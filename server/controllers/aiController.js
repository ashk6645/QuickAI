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
		const prompt = `Analyze the following resume and provide a comprehensive review with ATS score and job recommendations.

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
1. Section headings: Use ## for markdown headings (e.g., ## STRENGTHS)
2. NEVER use bullets (•) before headings
3. NEVER mix asterisks (*) with headings
4. Leave one blank line after each heading only not after the bullet points.
5. Each bullet point MUST be on its own separate line, change to next line when one bullet point ends.
6. Keep bullets concise (max 15 words each)

Format your response EXACTLY like this:

## ATS SCORE
78/100 - Strong keyword usage but needs more quantified achievements and formatting consistency.

## STRENGTHS

• Strong technical skillset in frontend and backend development

• Demonstrated experience building full-stack applications

• Proven track record of improving user engagement

## AREAS FOR IMPROVEMENT

• Quantify achievements with specific metrics and numbers

• Standardize bullet point format across all sections

• Add specific dates (month, year) for education and certifications

## CONTENT QUALITY

• Technical skills are well-organized and relevant

• Project descriptions demonstrate hands-on experience

## STRUCTURE & FORMAT

• Clear section organization with logical flow

• Could benefit from consistent date formatting

## ATS OPTIMIZATION TIPS

• Include keywords from target job descriptions naturally

• Use standard section headers (Experience, Education, Skills)

• Save as PDF format for best ATS compatibility

## RECOMMENDED JOB ROLES

• Full Stack Developer - Strong experience in both frontend and backend

• Software Engineer - Broad technical skills across multiple technologies

• Frontend Developer - Solid React and JavaScript expertise

• Backend Developer - Good experience with Node.js and databases

• Web Developer - Comprehensive web development skillset

## OVERALL RATING
8/10

## TOP PRIORITY ACTIONS

• Add quantifiable metrics to all project achievements

• Ensure consistent formatting across all sections

• Include month and year for all dates

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