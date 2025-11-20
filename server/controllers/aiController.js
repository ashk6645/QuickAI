import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import fsSync from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import FormData from "form-data"; // FIX: FormData import for node
import path from "path";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/*Helper utilities*/
const safeJson = (res, status = 200, body = {}) => res.status(status).json(body);

const ensureAuth = (req) => {
  if (!req || typeof req.auth !== "function") {
    throw new Error("Missing auth middleware");
  }
  const authResult = req.auth();
  if (!authResult || !authResult.userId) {
    throw new Error("Unauthorized");
  }
  return authResult.userId;
};

const checkFreeUsageLimit = async (plan, free_usage, limit = 10) => {
  if (plan !== "premium" && typeof free_usage === "number" && free_usage >= limit) {
    return false;
  }
  return true;
};

const incrementFreeUsage = async (userId, currentFreeUsage = 0) => {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        free_usage: (currentFreeUsage || 0) + 1,
      },
    });
  } catch (e) {
    // don't block main flow if update fails — log for later investigation
    console.error("Failed to update free_usage:", e?.message || e);
  }
};

const insertCreation = async ({ userId, prompt, content, type, publish = false }) => {
  try {
    await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${content}, ${type}, ${publish})`;
  } catch (e) {
    console.error("DB insert failed:", e?.message || e);
    // swallow DB error to keep user flow working (but return success false in some cases if needed)
  }
};

const callLLM = async ({ prompt, temperature = 0.7, max_tokens = 400 }) => {
  const response = await AI.chat.completions.create({
    model: GEMINI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature,
    max_tokens,
  });

  // defensive checks
  const content =
    response?.choices?.[0]?.message?.content ??
    response?.choices?.[0]?.text ??
    null;

  if (!content) {
    const raw = JSON.stringify(response).slice(0, 1000);
    throw new Error("Invalid LLM response: " + raw);
  }

  return content;
};

const cleanupFile = async (filePath) => {
  if (!filePath) return;
  try {
    // only remove if file exists
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (e) {
    console.error("Failed to cleanup file:", e?.message || e);
  }
};

/*Controllers*/

export const generateArticle = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { prompt, length } = req.body ?? {};
    const plan = req.plan ?? "free";
    const free_usage = Number(req.free_usage ?? 0);

    if (!prompt || !prompt.trim()) {
      return safeJson(res, 400, { success: false, message: "Prompt is required" });
    }

    if (!(await checkFreeUsageLimit(plan, free_usage))) {
      return safeJson(res, 403, {
        success: false,
        message: "You have reached your free usage limit. Upgrade to premium for more usage.",
      });
    }

    const content = await callLLM({ prompt, temperature: 0.7, max_tokens: Number(length) || 400 });

    await insertCreation({ userId, prompt, content, type: "article" });

    if (plan !== "premium") await incrementFreeUsage(userId, free_usage);

    return safeJson(res, 200, { success: true, content });
  } catch (error) {
    console.error("generateArticle error:", error?.message || error);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { prompt } = req.body ?? {};
    const plan = req.plan ?? "free";
    const free_usage = Number(req.free_usage ?? 0);

    if (!prompt || !prompt.trim()) {
      return safeJson(res, 400, { success: false, message: "Prompt is required" });
    }

    if (!(await checkFreeUsageLimit(plan, free_usage))) {
      return safeJson(res, 403, {
        success: false,
        message: "You have reached your free usage limit. Upgrade to premium for more usage.",
      });
    }

    const content = await callLLM({ prompt, temperature: 0.8, max_tokens: 200 });

    await insertCreation({ userId, prompt, content, type: "blog-title" });

    if (plan !== "premium") await incrementFreeUsage(userId, free_usage);

    return safeJson(res, 200, { success: true, content });
  } catch (error) {
    console.error("generateBlogTitle error:", error?.message || error);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const generateImage = async (req, res) => {
  // this route expects req.file/upload handled by multer or similar
  try {
    const userId = ensureAuth(req);
    const { prompt, publish } = req.body ?? {};
    const plan = req.plan ?? "free";

    if (plan !== "premium") {
      return safeJson(res, 403, {
        success: false,
        message: "This feature is only available for premium users. Upgrade to premium to use this feature.",
      });
    }

    if (!prompt || !prompt.trim()) {
      return safeJson(res, 400, { success: false, message: "Prompt is required" });
    }

    // Use ClipDrop API to generate image (returns binary)
    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: { "x-api-key": process.env.CLIPDROP_API_KEY, ...formData.getHeaders?.() },
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Convert to base64 data url
    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, { resource_type: "image" });
    const secure_url = uploadResult.secure_url;

    await insertCreation({
      userId,
      prompt,
      content: secure_url,
      type: "image",
      publish: publish === "true" || publish === true,
    });

    return safeJson(res, 200, { success: true, content: secure_url });
  } catch (error) {
    console.error("generateImage error:", error?.message || error);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const removeImageBackground = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    const plan = req.plan ?? "free";

    if (plan !== "premium") {
      await cleanupFile(filePath);
      return safeJson(res, 403, {
        success: false,
        message: "This feature is only available for premium users. Upgrade to premium to use this feature.",
      });
    }

    if (!filePath) {
      return safeJson(res, 400, { success: false, message: "No image uploaded" });
    }

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      transformation: [{ effect: "background_removal", background_removal: "remove_the_background" }],
      resource_type: "image",
    });

    const secure_url = uploadResult.secure_url;
    await insertCreation({ userId, prompt: "Remove background from image", content: secure_url, type: "image" });

    await cleanupFile(filePath);
    return safeJson(res, 200, { success: true, content: secure_url });
  } catch (error) {
    console.error("removeImageBackground error:", error?.message || error);
    await cleanupFile(filePath);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const removeImageObject = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    const plan = req.plan ?? "free";
    const { object } = req.body ?? {};

    if (plan !== "premium") {
      await cleanupFile(filePath);
      return safeJson(res, 403, {
        success: false,
        message: "This feature is only available for premium users. Upgrade to premium to use this feature.",
      });
    }

    if (!filePath || !object) {
      await cleanupFile(filePath);
      return safeJson(res, 400, { success: false, message: "Image and object name are required" });
    }

    // Upload original image and generate transformed URL
    const uploadRes = await cloudinary.uploader.upload(filePath, { resource_type: "image" });
    const public_id = uploadRes.public_id;

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await insertCreation({
      userId,
      prompt: `Removed ${object} from image`,
      content: imageUrl,
      type: "image",
    });

    await cleanupFile(filePath);
    return safeJson(res, 200, { success: true, content: imageUrl });
  } catch (error) {
    console.error("removeImageObject error:", error?.message || error);
    await cleanupFile(filePath);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const resumeReview = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    const plan = req.plan ?? "free";

    if (plan !== "premium") {
      await cleanupFile(filePath);
      return safeJson(res, 403, {
        success: false,
        message: "This feature is only available for premium users. Upgrade to premium to use this feature.",
      });
    }

    if (!filePath) {
      return safeJson(res, 400, { success: false, message: "Resume file is required" });
    }

    // Validate size limit server-side if available (req.file.size may be undefined depending on middleware)
    try {
      const stat = await fs.stat(filePath);
      if (stat.size > 5 * 1024 * 1024) {
        await cleanupFile(filePath);
        return safeJson(res, 400, { success: false, message: "Resume file size exceeds 5MB limit. Please upload a smaller file." });
      }
    } catch (e) {
      // ignore stat issues, proceed
    }

    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Analyze the following resume and provide concise, actionable feedback in BULLET POINTS ONLY. 

First, calculate an ATS (Applicant Tracking System) Score out of 100 based on:
- Format compatibility (standard sections, clean formatting)
- Keyword optimization (relevant skills and keywords)
- Section completeness (contact info, experience, education, skills)
- Structure and readability
- Industry-standard best practices

Then format your response EXACTLY like this using Markdown:

**ATS SCORE:** [Score out of 100] - [Brief explanation of the score]

### STRENGTHS

- [Key strength 1]

- [Key strength 2]

- [Key strength 3]

### AREAS FOR IMPROVEMENT

- [Improvement 1]

- [Improvement 2]

- [Improvement 3]

### CONTENT QUALITY

- [Content feedback 1]

- [Content feedback 2]

### STRUCTURE & FORMAT

- [Format feedback 1]

- [Format feedback 2]

### OVERALL RATING

[X/10]

### TOP RECOMMENDATIONS

- [Action item 1]

- [Action item 2]

- [Action item 3]

IMPORTANT:
- Use standard Markdown bullet points (hyphen space).
- Ensure there is a blank line between every bullet point.
- Ensure there is a blank line before every header.
- Keep each bullet point to 1-2 sentences maximum. Be specific and actionable.
- The ATS Score should be a number between 0-100.

Resume Content:
${pdfData.text}`;

    const content = await callLLM({ prompt, temperature: 0.7, max_tokens: 1000 });

    // Extract ATS score defensively
    let atsScore = null;
    const atsScoreMatch = content.match(/\*\*ATS SCORE:\*\*\s*([0-9]{1,3})/i) || content.match(/ATS SCORE[:\s]+([0-9]{1,3})/i);
    if (atsScoreMatch) atsScore = parseInt(atsScoreMatch[1], 10);

    await insertCreation({ userId, prompt: "Review the uploaded resume", content, type: "resume-review" });

    await cleanupFile(filePath);
    return safeJson(res, 200, { success: true, content, atsScore });
  } catch (error) {
    console.error("resumeReview error:", error?.message || error);
    await cleanupFile(filePath);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const findJobOpportunities = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    const plan = req.plan ?? "free";

    if (plan !== "premium") {
      await cleanupFile(filePath);
      return safeJson(res, 403, {
        success: false,
        message: "This feature is only available for premium users. Upgrade to premium to use this feature.",
      });
    }

    if (!filePath) {
      return safeJson(res, 400, { success: false, message: "Resume file is required" });
    }

    // size check
    try {
      const stat = await fs.stat(filePath);
      if (stat.size > 5 * 1024 * 1024) {
        await cleanupFile(filePath);
        return safeJson(res, 400, { success: false, message: "Resume file size exceeds 5MB limit. Please upload a smaller file." });
      }
    } catch (e) {
      // ignore
    }

    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdf(dataBuffer);

    const analysisPrompt = `Analyze the following resume and extract key information to suggest relevant job opportunities.

Resume Content:
${pdfData.text}

Based on the resume, provide:
1. Key skills and technologies mentioned
2. Years of experience and level (junior/mid/senior)
3. Industry/domain expertise
4. Education background
5. Key achievements and responsibilities

Then, suggest 8-12 specific job titles/roles that would be a good fit for this candidate. Format your response as a JSON array of job titles, where each job title is a string.

Return ONLY the JSON array, no other text.`;

    const llmResp = await callLLM({ prompt: analysisPrompt, temperature: 0.7, max_tokens: 500 });

    // Try to extract JSON array
    let jobTitles = [];
    try {
      const jsonMatch = llmResp.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jobTitles = JSON.parse(jsonMatch[0]);
      } else {
        jobTitles = JSON.parse(llmResp);
      }
    } catch (err) {
      // fallback: parse as lines (best-effort)
      jobTitles = llmResp
        .split("\n")
        .map((line) => line.replace(/^[-•\d.\s"]+|["\s]+$/g, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 12);
    }

    if (!Array.isArray(jobTitles) || jobTitles.length === 0) {
      jobTitles = ["Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Engineer"];
    }

    await insertCreation({
      userId,
      prompt: "Find job opportunities",
      content: JSON.stringify(jobTitles),
      type: "job-opportunities",
    });

    await cleanupFile(filePath);
    return safeJson(res, 200, { success: true, jobTitles });
  } catch (error) {
    console.error("findJobOpportunities error:", error?.message || error);
    await cleanupFile(filePath);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const searchJobs = async (req, res) => {
  try {
    const { jobTitle } = req.body ?? {};
    const plan = req.plan ?? "free";

    if (plan !== "premium") {
      return safeJson(res, 403, {
        success: false,
        message: "This feature is only available for premium users. Upgrade to premium to use this feature.",
      });
    }

    if (!jobTitle || !jobTitle.trim()) {
      return safeJson(res, 400, { success: false, message: "jobTitle is required" });
    }

    const searchPrompt = `Generate a comprehensive job search query for the position: "${jobTitle}"

Provide:
1. Optimized search keywords for job boards
2. Relevant job board suggestions (LinkedIn, Indeed, Glassdoor, Internshala, Naukri, etc.)
3. Search URL parameters that would help find active listings

Format as JSON:
{
  "keywords": "string",
  "jobBoards": ["board1","board2"],
  "searchUrls": {
    "indeed": "url",
    "linkedin": "url",
    "glassdoor": "url",
    "internshala": "url",
    "naukri": "url"
  }
}`;

    const llmResp = await callLLM({ prompt: searchPrompt, temperature: 0.7, max_tokens: 300 });

    const encodedTitle = encodeURIComponent(jobTitle);

    const defaultSearchUrls = {
      indeed: `https://www.indeed.com/jobs?q=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}`,
      glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedTitle}`,
      internshala: `https://internshala.com/jobs/${encodedTitle}-jobs/`,
      naukri: `https://www.naukri.com/${encodedTitle}-jobs`,
    };

    let searchData = {
      keywords: jobTitle,
      jobBoards: ["LinkedIn", "Indeed", "Glassdoor", "Internshala", "Naukri"],
      searchUrls: defaultSearchUrls,
    };

    try {
      const jsonMatch = llmResp.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        searchData = {
          keywords: parsedData.keywords || jobTitle,
          jobBoards: parsedData.jobBoards || searchData.jobBoards,
          searchUrls: {
            indeed: parsedData.searchUrls?.indeed || defaultSearchUrls.indeed,
            linkedin: parsedData.searchUrls?.linkedin || defaultSearchUrls.linkedin,
            glassdoor: parsedData.searchUrls?.glassdoor || defaultSearchUrls.glassdoor,
            internshala: parsedData.searchUrls?.internshala || defaultSearchUrls.internshala,
            naukri: parsedData.searchUrls?.naukri || defaultSearchUrls.naukri,
          },
        };
      }
    } catch (err) {
      console.error("searchJobs: failed parsing LLM response, using defaults", err?.message || err);
      // use default searchData
    }

    return safeJson(res, 200, { success: true, searchData });
  } catch (error) {
    console.error("searchJobs error:", error?.message || error);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

export const generateLearningResources = async (req, res) => {
  try {
    const { jobDescription } = req.body ?? {};
    const plan = req.plan ?? "free";

    if (plan !== "premium") {
      return safeJson(res, 403, {
        success: false,
        message: "This feature is only available for premium users. Upgrade to premium to use this feature.",
      });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return safeJson(res, 400, { success: false, message: "Job description is required" });
    }

    const prompt = `Analyze the following job description and extract the top 5-7 key technical skills or technologies required.
    
    Job Description:
    ${jobDescription.slice(0, 2000)}
    
    For each skill, provide:
    1. The name of the skill/technology
    2. A brief 1-sentence explanation of why it's important for this role based on the description (or general knowledge if not specified).
    3. A specific YouTube search query to learn this skill.
    4. A specific, high-quality URL to an article, documentation, or tutorial website that teaches this skill (e.g., official docs, freeCodeCamp, MDN, GeeksforGeeks, etc.). Ensure the URL is valid and points to a real page.

    Format the output as a JSON array of objects:
    [
      {
        "skill": "React.js",
        "importance": "Required for building the frontend user interface.",
        "youtubeQuery": "React.js crash course for beginners 2024",
        "articleUrl": "https://react.dev/learn"
      }
    ]
    
    Return ONLY the JSON array.`;

    const llmResp = await callLLM({ prompt, temperature: 0.7, max_tokens: 800 });

    let resources = [];
    try {
      const jsonMatch = llmResp.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        resources = JSON.parse(jsonMatch[0]);
      } else {
        resources = JSON.parse(llmResp);
      }
    } catch (e) {
      console.error("Failed to parse learning resources JSON:", e);
      // Fallback or empty array
    }

    // Enhance resources with actual links (generated on server to ensure consistency)
    const enhancedResources = resources.map(r => ({
      ...r,
      youtubeLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(r.youtubeQuery)}`,
      articleLink: r.articleUrl || `https://www.google.com/search?q=${encodeURIComponent(r.skill + " tutorial")}` // Fallback to google search if no URL
    }));

    // Save to database
    const userId = req.userId;
    await insertCreation({
      userId,
      prompt: jobDescription.slice(0, 100) + (jobDescription.length > 100 ? "..." : ""),
      content: JSON.stringify(enhancedResources),
      type: "learning-resources",
    });

    return safeJson(res, 200, { success: true, resources: enhancedResources });

  } catch (error) {
    console.error("generateLearningResources error:", error?.message || error);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};