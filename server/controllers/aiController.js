import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const AI = new OpenAI({
	apiKey: process.env.GEMINI_API_KEY,
	baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
	try {
		const { userId } = req.auth();
		const { prompt, length } = req.body;
		const plan = req.plan;
		const free_usage = req.free_usage;

		if (plan !== "premium" && free_usage >= 10) {
			return res.json({
				success: false,
				message:
					"You have reached your free usage limit. Upgrade to premium for more usage.",
			});
		}

		const response = await AI.chat.completions.create({
			model: "gemini-2.0-flash",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.7,
			max_tokens: length,
		});

		const content = response.choices[0].message.content;

		await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

		if (plan !== "premium") {
			await clerkClient.users.updateUserMetadata(userId, {
				privateMetadata: {
					free_usage: free_usage + 1,
				},
			});
		}
		res.json({ success: true, content });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

export const generateBlogTitle = async (req, res) => {
	try {
		const { userId } = req.auth();
		const { prompt } = req.body;
		const plan = req.plan;
		const free_usage = req.free_usage;

		if (plan !== "premium" && free_usage >= 10) {
			return res.json({
				success: false,
				message:
					"You have reached your free usage limit. Upgrade to premium for more usage.",
			});
		}

		const response = await AI.chat.completions.create({
			model: "gemini-2.0-flash",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.8,
			max_tokens: 400,
		});

		const content = response.choices[0].message.content;

		await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

		if (plan !== "premium") {
			await clerkClient.users.updateUserMetadata(userId, {
				privateMetadata: {
					free_usage: free_usage + 1,
				},
			});
		}
		res.json({ success: true, content });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

export const generateImage = async (req, res) => {
	try {
		const { userId } = req.auth();
		const { prompt, publish } = req.body;
		const plan = req.plan;

		if (plan !== "premium") {
			return res.json({
				success: false,
				message:
					"This feature is only available for premium users. Upgrade to premium to use this feature.",
			});
		}

		const formData = new FormData();
		formData.append("prompt", prompt);

		const { data } = await axios.post(
			"https://clipdrop-api.co/text-to-image/v1",
			formData,
			{
				headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
				responseType: "arraybuffer",
			}
		);

		const base64Image = `data:image/png;base64,${Buffer.from(
			data,
			"binary"
		).toString("base64")}`;

		const { secure_url } = await cloudinary.uploader.upload(base64Image);

		await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${
			publish ?? false
		})`;

		res.json({ success: true, content: secure_url });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

export const removeImageBackground = async (req, res) => {
	try {
		const { userId } = req.auth();
		const image = req.file;
		const plan = req.plan;

		if (plan !== "premium") {
			return res.json({
				success: false,
				message:
					"This feature is only available for premium users. Upgrade to premium to use this feature.",
			});
		}

		const { secure_url } = await cloudinary.uploader.upload(image.path, {
			transformation: [
				{
					effect: "background_removal",
					background_removal: "remove_the_background",
				},
			],
		});

		await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

		res.json({ success: true, content: secure_url });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

export const removeImageObject = async (req, res) => {
	try {
		const { userId } = req.auth();
		const { object } = req.body;
		const image = req.file;
		const plan = req.plan;

		if (plan !== "premium") {
			return res.json({
				success: false,
				message:
					"This feature is only available for premium users. Upgrade to premium to use this feature.",
			});
		}

		const { public_id } = await cloudinary.uploader.upload(image.path);

		const imageUrl = cloudinary.url(public_id, {
			transformation: [{ effect: `gen_remove:${object}` }],
			resource_type: "image",
		});

		await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

		res.json({ success: true, content: imageUrl });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

export const resumeReview = async (req, res) => {
	try {
		const { userId } = req.auth();
		const resume = req.file;
		const plan = req.plan;

		if (plan !== "premium") {
			return res.json({
				success: false,
				message:
					"This feature is only available for premium users. Upgrade to premium to use this feature.",
			});
		}

		if (resume.size > 5 * 1024 * 1024) {
			return res.json({
				success: false,
				message:
					"Resume file size exceeds 5MB limit. Please upload a smaller file.",
			});
		}

		const dataBuffer = fs.readFileSync(resume.path);
		const pdfData = await pdf(dataBuffer);
		const prompt = `Analyze the following resume and provide concise, actionable feedback in BULLET POINTS ONLY. 

First, calculate an ATS (Applicant Tracking System) Score out of 100 based on:
- Format compatibility (standard sections, clean formatting)
- Keyword optimization (relevant skills and keywords)
- Section completeness (contact info, experience, education, skills)
- Structure and readability
- Industry-standard best practices

Then format your response EXACTLY like this:

**ATS SCORE:** [Score out of 100] - [Brief explanation of the score]

**STRENGTHS:**
• [Key strength 1]
• [Key strength 2]
• [Key strength 3]

**AREAS FOR IMPROVEMENT:**
• [Improvement 1]
• [Improvement 2]
• [Improvement 3]

**CONTENT QUALITY:**
• [Content feedback 1]
• [Content feedback 2]

**STRUCTURE & FORMAT:**
• [Format feedback 1]
• [Format feedback 2]

**OVERALL RATING:** [X/10]

**TOP RECOMMENDATIONS:**
• [Action item 1]
• [Action item 2]
• [Action item 3]

Keep each bullet point to 1-2 sentences maximum. Be specific and actionable. The ATS Score should be a number between 0-100.

Resume Content:
${pdfData.text}`;

		const response = await AI.chat.completions.create({
			model: "gemini-2.0-flash",
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.7,
			max_tokens: 1000,
		});

		const content = response.choices[0].message.content;

		// Extract ATS score from the content
		let atsScore = null;
		const atsScoreMatch =
			content.match(/\*\*ATS SCORE:\*\*\s*(\d+)/i) ||
			content.match(/ATS SCORE[:\s]+(\d+)/i);
		if (atsScoreMatch) {
			atsScore = parseInt(atsScoreMatch[1]);
		}

		await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

		res.json({ success: true, content, atsScore });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

export const findJobOpportunities = async (req, res) => {
	try {
		const { userId } = req.auth();
		const resume = req.file;
		const plan = req.plan;

		if (plan !== "premium") {
			return res.json({
				success: false,
				message:
					"This feature is only available for premium users. Upgrade to premium to use this feature.",
			});
		}

		if (resume.size > 5 * 1024 * 1024) {
			return res.json({
				success: false,
				message:
					"Resume file size exceeds 5MB limit. Please upload a smaller file.",
			});
		}

		const dataBuffer = fs.readFileSync(resume.path);
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

Example format:
["Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Engineer", "DevOps Engineer", "Product Manager", "Technical Lead", "Senior Software Engineer"]

Return ONLY the JSON array, no other text.`;

		const analysisResponse = await AI.chat.completions.create({
			model: "gemini-2.0-flash",
			messages: [
				{
					role: "user",
					content: analysisPrompt,
				},
			],
			temperature: 0.7,
			max_tokens: 500,
		});

		let jobTitles = [];
		try {
			const content = analysisResponse.choices[0].message.content.trim();
			// Extract JSON array from response (handle cases where LLM adds extra text)
			const jsonMatch = content.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				jobTitles = JSON.parse(jsonMatch[0]);
			} else {
				// Fallback: try to parse the entire content
				jobTitles = JSON.parse(content);
			}
		} catch (parseError) {
			// If JSON parsing fails, extract job titles from text
			const content = analysisResponse.choices[0].message.content;
			jobTitles = content
				.split("\n")
				.map((line) => line.replace(/^[-•\d.\s"]+|["\s]+$/g, "").trim())
				.filter((line) => line.length > 0 && line.length < 100)
				.slice(0, 12);
		}

		// Ensure we have an array
		if (!Array.isArray(jobTitles) || jobTitles.length === 0) {
			jobTitles = [
				"Software Engineer",
				"Full Stack Developer",
				"Frontend Developer",
				"Backend Engineer",
			];
		}

		await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Find job opportunities', ${JSON.stringify(
			jobTitles
		)}, 'job-opportunities')`;

		res.json({ success: true, jobTitles });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

export const searchJobs = async (req, res) => {
	try {
		const { jobTitle } = req.body;
		const plan = req.plan;

		if (plan !== "premium") {
			return res.json({
				success: false,
				message:
					"This feature is only available for premium users. Upgrade to premium to use this feature.",
			});
		}

		// Use web search to find active job listings
		// For now, we'll return a search URL and use LLM to generate relevant job search queries
		// In production, you'd integrate with job APIs like Adzuna, Indeed, LinkedIn, etc.

		const searchPrompt = `Generate a comprehensive job search query for the position: "${jobTitle}"

Provide:
1. Optimized search keywords for job boards
2. Relevant job board suggestions (LinkedIn, Indeed, Glassdoor, Internshala, Naukri, etc.)
3. Search URL parameters that would help find active listings

Format as JSON:
{
	"keywords": "string",
	"jobBoards": ["board1", "board2"],
	"searchUrls": {
		"indeed": "url",
		"linkedin": "url",
		"glassdoor": "url",
		"internshala": "url",
		"naukri": "url"
	}
}`;

		const searchResponse = await AI.chat.completions.create({
			model: "gemini-2.0-flash",
			messages: [
				{
					role: "user",
					content: searchPrompt,
				},
			],
			temperature: 0.7,
			max_tokens: 300,
		});

		const encodedTitle = encodeURIComponent(jobTitle);

		// Default search URLs - always provide these
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
			const content = searchResponse.choices[0].message.content.trim();
			const jsonMatch = content.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const parsedData = JSON.parse(jsonMatch[0]);
				// Merge LLM response with defaults, ensuring URLs always exist
				searchData = {
					keywords: parsedData.keywords || jobTitle,
					jobBoards: parsedData.jobBoards || [
						"LinkedIn",
						"Indeed",
						"Glassdoor",
						"Internshala",
						"Naukri",
					],
					searchUrls: {
						indeed: parsedData.searchUrls?.indeed || defaultSearchUrls.indeed,
						linkedin:
							parsedData.searchUrls?.linkedin || defaultSearchUrls.linkedin,
						glassdoor:
							parsedData.searchUrls?.glassdoor || defaultSearchUrls.glassdoor,
						internshala:
							parsedData.searchUrls?.internshala || defaultSearchUrls.internshala,
						naukri:
							parsedData.searchUrls?.naukri || defaultSearchUrls.naukri,
					},
				};
			}
		} catch (parseError) {
			console.log(
				"Error parsing LLM response, using defaults:",
				parseError.message
			);
			// Use defaults already set above
		}

		// Ensure searchUrls always exists and has all required properties
		if (!searchData.searchUrls) {
			searchData.searchUrls = defaultSearchUrls;
		}

		res.json({ success: true, searchData });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};