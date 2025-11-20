// controllers/aiController.js
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import fsSync from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import FormData from "form-data";
import path from "path";

// --- Config & constants ---
const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
  // Optionally add fetch options/timeouts if supported by client
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const DEFAULT_FREE_LIMIT = Number(process.env.FREE_USAGE_LIMIT || 10);
const MAX_RESUME_SIZE = Number(process.env.MAX_RESUME_SIZE || 5 * 1024 * 1024); // 5MB
const DEFAULT_ARTICLE_TOKENS = 400;
const DEFAULT_TIMEOUT_MS = Number(process.env.EXTERNAL_TIMEOUT_MS || 30_000);

// Cloudinary config (ensure env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Utility helpers ---
const safeJson = (res, status = 200, body = {}) => res.status(status).json(body);

const ensureAuth = (req) => {
  // support req.auth() (clerk middleware) or req.userId set earlier
  try {
    if (req?.auth && typeof req.auth === "function") {
      const authResult = req.auth();
      if (authResult?.userId) return authResult.userId;
    }
    if (req?.userId) return req.userId;
    if (req?.authResult?.userId) return req.authResult.userId;
  } catch (e) {
    // fallthrough to error
  }
  throw new Error("Unauthorized");
};

const checkFreeUsageLimit = (plan, free_usage, limit = DEFAULT_FREE_LIMIT) =>
  plan === "premium" ? true : typeof free_usage === "number" ? free_usage < limit : true;

const incrementFreeUsage = async (userId, currentFreeUsage = 0) => {
  // non-blocking update; log on failure but don't block user flow
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        free_usage: (Number(currentFreeUsage) || 0) + 1,
      },
    });
  } catch (e) {
    console.error("incrementFreeUsage failed:", e?.message || e);
  }
};

const insertCreation = async ({ userId, prompt, content, type, publish = false }) => {
  try {
    await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${content}, ${type}, ${publish})`;
  } catch (e) {
    // Log but do not throw to prevent breaking upstream user flows
    console.error("insertCreation DB error:", e?.message || e);
  }
};

const cleanupFile = async (filePath) => {
  if (!filePath) return;
  try {
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (e) {
    console.error("cleanupFile failed:", e?.message || e);
  }
};

const readFileSafe = async (filePath) => {
  if (!filePath) throw new Error("No file path provided");
  return fs.readFile(filePath);
};

const statFileSafe = async (filePath) => {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
};

const parseJsonSafely = (maybeJson) => {
  if (!maybeJson || typeof maybeJson !== "string") return null;
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
};

const extractJsonArray = (text) => {
  if (!text) return null;
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // fallback continue
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractJsonObject = (text) => {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      // fallback
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// LLM call with defensive checks
const callLLM = async ({ prompt, temperature = 0.7, max_tokens = 500 }) => {
  if (!prompt || !prompt.trim()) throw new Error("LLM prompt is empty");
  try {
    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens,
    });

    const content =
      response?.choices?.[0]?.message?.content ??
      response?.choices?.[0]?.text ??
      response?.outputs?.[0]?.content?.[0]?.text ??
      null;

    if (!content) {
      throw new Error("Invalid LLM response");
    }
    return content;
  } catch (e) {
    console.error("callLLM error:", e?.message || e);
    throw new Error("LLM request failed");
  }
};

// Upload binary buffer (image) to Cloudinary
const uploadImageBufferToCloudinary = async (buffer, options = {}) => {
  if (!buffer) throw new Error("No buffer to upload");
  // Cloudinary accepts data URI or file path. We'll use upload_stream for buffers,
  // but cloudinary.uploader.upload can accept data URI too.
  const dataUri = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
  return cloudinary.uploader.upload(dataUri, { resource_type: "image", ...options });
};

// Shared middleware-like plan guard for premium features
const requirePremium = async (req, res) => {
  const plan = req.plan ?? "free";
  if (plan !== "premium") {
    throw { status: 403, body: { success: false, message: "This feature requires premium access. Upgrade to premium to continue." } };
  }
};

// --- Controllers ---
export const generateArticle = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { prompt, length } = req.body ?? {};
    const plan = req.plan ?? "free";
    const free_usage = Number(req.free_usage ?? 0);

    if (!prompt || !prompt.trim()) return safeJson(res, 400, { success: false, message: "Prompt is required" });
    if (!checkFreeUsageLimit(plan, free_usage)) return safeJson(res, 403, { success: false, message: "Free usage limit reached" });

    const max_tokens = Number(length) > 0 ? Math.min(2000, Number(length)) : DEFAULT_ARTICLE_TOKENS;
    const content = await callLLM({ prompt, temperature: 0.7, max_tokens });

    await insertCreation({ userId, prompt, content, type: "article" });
    if (plan !== "premium") incrementFreeUsage(userId, free_usage); // async non-blocking

    return safeJson(res, 200, { success: true, content });
  } catch (err) {
    console.error("generateArticle error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.body?.message || err?.message || "Server error" });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { prompt } = req.body ?? {};
    const plan = req.plan ?? "free";
    const free_usage = Number(req.free_usage ?? 0);

    if (!prompt || !prompt.trim()) return safeJson(res, 400, { success: false, message: "Prompt is required" });
    if (!checkFreeUsageLimit(plan, free_usage)) return safeJson(res, 403, { success: false, message: "Free usage limit reached" });

    const content = await callLLM({ prompt, temperature: 0.8, max_tokens: 200 });

    await insertCreation({ userId, prompt, content, type: "blog-title" });
    if (plan !== "premium") incrementFreeUsage(userId, free_usage);

    return safeJson(res, 200, { success: true, content });
  } catch (err) {
    console.error("generateBlogTitle error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.body?.message || err?.message || "Server error" });
  }
};

export const generateImage = async (req, res) => {
  // expects req.body.prompt, optional publish. premium only
  const tempPath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    await requirePremium(req, res);

    const { prompt, publish } = req.body ?? {};
    if (!prompt || !prompt.trim()) return safeJson(res, 400, { success: false, message: "Prompt is required" });

    // Use ClipDrop API to generate image binary
    const formData = new FormData();
    formData.append("prompt", prompt);

    const clipdropResp = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: { "x-api-key": process.env.CLIPDROP_API_KEY, ...(formData.getHeaders ? formData.getHeaders() : {}) },
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: DEFAULT_TIMEOUT_MS,
    });

    const uploadResult = await uploadImageBufferToCloudinary(clipdropResp.data, { folder: "creations" });
    const secure_url = uploadResult.secure_url;

    await insertCreation({
      userId,
      prompt,
      content: secure_url,
      type: "image",
      publish: publish === "true" || publish === true,
    });

    return safeJson(res, 200, { success: true, content: secure_url });
  } catch (err) {
    console.error("generateImage error:", err?.message || err);
    // do not swallow errors silently — return a readable message
    return safeJson(res, err?.status || 500, { success: false, message: err?.body?.message || err?.message || "Server error" });
  } finally {
    await cleanupFile(tempPath);
  }
};

export const removeImageBackground = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    await requirePremium(req, res);

    if (!filePath) return safeJson(res, 400, { success: false, message: "No image uploaded" });

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      transformation: [{ effect: "background_removal" }],
      resource_type: "image",
    });

    const secure_url = uploadResult.secure_url;
    await insertCreation({ userId, prompt: "Remove background from image", content: secure_url, type: "image" });

    return safeJson(res, 200, { success: true, content: secure_url });
  } catch (err) {
    console.error("removeImageBackground error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.message || "Server error" });
  } finally {
    await cleanupFile(filePath);
  }
};

export const removeImageObject = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    await requirePremium(req, res);

    const { object } = req.body ?? {};
    if (!filePath || !object) return safeJson(res, 400, { success: false, message: "Image and object name are required" });

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

    return safeJson(res, 200, { success: true, content: imageUrl });
  } catch (err) {
    console.error("removeImageObject error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.message || "Server error" });
  } finally {
    await cleanupFile(filePath);
  }
};

const _processResumeFileCommon = async (filePath) => {
  if (!filePath) throw new Error("No file provided");
  const stat = await statFileSafe(filePath);
  if (stat && stat.size > MAX_RESUME_SIZE) throw { status: 400, message: "Resume file size exceeds limit" };

  const dataBuffer = await readFileSafe(filePath);
  const pdfData = await pdf(dataBuffer);
  return { pdfText: pdfData.text || "", rawBuffer: dataBuffer };
};

export const resumeReview = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    await requirePremium(req, res);

    if (!filePath) return safeJson(res, 400, { success: false, message: "Resume file is required" });

    const { pdfText } = await _processResumeFileCommon(filePath);
    const prompt = `Analyze the following resume and provide concise, actionable feedback in BULLET POINTS ONLY.

First, calculate an ATS (Applicant Tracking System) Score out of 100 based on:
- Format compatibility
- Keyword optimization
- Section completeness
- Structure and readability
- Industry-standard best practices

Then format your response EXACTLY like this using Markdown:

**ATS SCORE:** [Score out of 100] - [Brief explanation of the score]

### STRENGTHS

- [Key strength 1]

### AREAS FOR IMPROVEMENT

- [Improvement 1]

### CONTENT QUALITY

- [Content feedback 1]

### STRUCTURE & FORMAT

- [Format feedback 1]

### OVERALL RATING

[X/10]

### TOP RECOMMENDATIONS

- [Action item 1]

IMPORTANT:
- Keep bullets short (1-2 sentences).
- Ensure blank line between bullets and before headers.

Resume Content:
${pdfText}`;

    const content = await callLLM({ prompt, temperature: 0.7, max_tokens: 1000 });

    // Extract ATS score defensively
    let atsScore = null;
    try {
      const m = content.match(/\*\*ATS SCORE:\*\*\s*([0-9]{1,3})/i) || content.match(/ATS SCORE[:\s]+([0-9]{1,3})/i);
      if (m) atsScore = parseInt(m[1], 10);
    } catch {
      atsScore = null;
    }

    await insertCreation({ userId, prompt: "Review the uploaded resume", content, type: "resume-review" });

    return safeJson(res, 200, { success: true, content, atsScore });
  } catch (err) {
    console.error("resumeReview error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.message || "Server error" });
  } finally {
    await cleanupFile(filePath);
  }
};

export const findJobOpportunities = async (req, res) => {
  const filePath = req.file?.path;
  try {
    const userId = ensureAuth(req);
    await requirePremium(req, res);

    if (!filePath) return safeJson(res, 400, { success: false, message: "Resume file is required" });

    const { pdfText } = await _processResumeFileCommon(filePath);

    const analysisPrompt = `Analyze the following resume and extract key information to suggest relevant job opportunities.

Resume Content:
${pdfText}

Provide:
1. Key skills and technologies mentioned
2. Years of experience and level (junior/mid/senior)
3. Industry/domain expertise
4. Education
5. Key achievements and responsibilities

Then, suggest 8-12 specific job titles/roles that would be a good fit for this candidate.
Return ONLY a JSON array of job title strings, no other text.`;

    const llmResp = await callLLM({ prompt: analysisPrompt, temperature: 0.7, max_tokens: 500 });

    let jobTitles = extractJsonArray(llmResp) || [];
    if (!Array.isArray(jobTitles) || jobTitles.length === 0) {
      // fallback: best-effort parse lines
      jobTitles = llmResp
        .split("\n")
        .map((l) => l.replace(/^[-•\d.\s"]+|["\s]+$/g, "").trim())
        .filter(Boolean)
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

    return safeJson(res, 200, { success: true, jobTitles });
  } catch (err) {
    console.error("findJobOpportunities error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.message || "Server error" });
  } finally {
    await cleanupFile(filePath);
  }
};

export const searchJobs = async (req, res) => {
  try {
    const { jobTitle } = req.body ?? {};
    await requirePremium(req, res);

    if (!jobTitle || !jobTitle.trim()) return safeJson(res, 400, { success: false, message: "jobTitle is required" });

    const searchPrompt = `Generate a comprehensive job search query for the position: "${jobTitle}"
Format as JSON:
{ "keywords": "string", "jobBoards": ["board1"], "searchUrls": { "indeed":"url", "linkedin":"url", "glassdoor":"url", "internshala":"url", "naukri":"url" } }`;

    const llmResp = await callLLM({ prompt: searchPrompt, temperature: 0.7, max_tokens: 300 });

    const encodedTitle = encodeURIComponent(jobTitle);
    const defaultSearchUrls = {
      indeed: `https://www.indeed.com/jobs?q=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}`,
      glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedTitle}`,
      internshala: `https://internshala.com/jobs/${encodedTitle}-jobs/`,
      naukri: `https://www.naukri.com/${encodedTitle}-jobs`,
    };

    let parsed = extractJsonObject(llmResp);
    const searchData = {
      keywords: parsed?.keywords || jobTitle,
      jobBoards: parsed?.jobBoards || ["LinkedIn", "Indeed", "Glassdoor", "Internshala", "Naukri"],
      searchUrls: {
        indeed: parsed?.searchUrls?.indeed || defaultSearchUrls.indeed,
        linkedin: parsed?.searchUrls?.linkedin || defaultSearchUrls.linkedin,
        glassdoor: parsed?.searchUrls?.glassdoor || defaultSearchUrls.glassdoor,
        internshala: parsed?.searchUrls?.internshala || defaultSearchUrls.internshala,
        naukri: parsed?.searchUrls?.naukri || defaultSearchUrls.naukri,
      },
    };

    return safeJson(res, 200, { success: true, searchData });
  } catch (err) {
    console.error("searchJobs error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.message || "Server error" });
  }
};

export const generateLearningResources = async (req, res) => {
  try {
    const { jobDescription } = req.body ?? {};
    await requirePremium(req, res);

    if (!jobDescription || !jobDescription.trim()) return safeJson(res, 400, { success: false, message: "Job description is required" });

    const prompt = `Analyze the following job description and extract the top 5-7 key technical skills or technologies required.

Job Description:
${jobDescription.slice(0, 2000)}

For each skill, return JSON objects with fields:
"skill","importance","youtubeQuery","articleUrl"
Return ONLY a JSON array.`;

    const llmResp = await callLLM({ prompt, temperature: 0.7, max_tokens: 800 });

    let resources = extractJsonArray(llmResp) || [];
    // normalize fallback if parse failed
    resources = Array.isArray(resources) ? resources.slice(0, 7) : [];

    const enhancedResources = resources.map((r) => ({
      skill: r.skill || r.name || "",
      importance: r.importance || "",
      youtubeQuery: r.youtubeQuery || `${r.skill || r.name} tutorial`,
      articleUrl: r.articleUrl || r.url || `https://www.google.com/search?q=${encodeURIComponent((r.skill || r.name) + " tutorial")}`,
      youtubeLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(r.youtubeQuery || (r.skill || r.name))}`,
    }));

    const userId = req.userId || (req.auth && req.auth().userId) || null;
    if (userId) {
      await insertCreation({
        userId,
        prompt: jobDescription.slice(0, 100) + (jobDescription.length > 100 ? "..." : ""),
        content: JSON.stringify(enhancedResources),
        type: "learning-resources",
      });
    }

    return safeJson(res, 200, { success: true, resources: enhancedResources });
  } catch (err) {
    console.error("generateLearningResources error:", err?.message || err);
    return safeJson(res, err?.status || 500, { success: false, message: err?.message || "Server error" });
  }
};
