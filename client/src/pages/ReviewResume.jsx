import { FileText, Sparkles } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ActionButtons } from "../components/ActionButtons";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [content, setContent] = useState("");
	const [fileName, setFileName] = useState("");
	const [atsScore, setAtsScore] = useState(null);

	const { getToken } = useAuth();

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setInput(file);
		setFileName(file ? file.name : "");
		setAtsScore(null);
		setContent("");
	};

	const onSubmitHandler = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			const formData = new FormData();
			formData.append("resume", input);

			const { data } = await axios.post("/api/ai/resume-review", formData, {
				headers: {
					Authorization: `Bearer ${await getToken()}`,
				},
			});

			if (data.success) {
				// Clean up the content - remove markdown code fences if present
				let cleanContent = data.content;
				if (
					cleanContent.startsWith("```markdown") ||
					cleanContent.startsWith("```")
				) {
					cleanContent = cleanContent
						.replace(/^```markdown\n?/, "")
						.replace(/^```\n?/, "")
						.replace(/\n?```$/, "");
				}

				// Convert bullet points (•) to markdown list format
				// Handle lines that start with • (with optional leading whitespace)
				// This regex matches: start of line, optional whitespace, bullet character, space(s), then content
				cleanContent = cleanContent.replace(/^(\s*)•\s+/gm, "$1- ");

				// Remove blank lines between list items to ensure they form a single list
				// This regex finds: newline, optional whitespace, newline, then a list item (starts with -)
				cleanContent = cleanContent.replace(/\n\s*\n(\s*- )/g, "\n$1");

				// Normalize line breaks (but preserve double breaks for paragraph separation)
				cleanContent = cleanContent.replace(/(\r\n|\r|\n){3,}/g, "\n\n");

				// Ensure proper spacing around section headers (lines starting with **)
				cleanContent = cleanContent.replace(/(\n)(\*\*[^*]+\*\*:?)/g, "\n\n$2");

				setContent(cleanContent);
				setAtsScore(data.atsScore);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.message);
		}
		setLoading(false);
	};

	return (
		<div className='p-6 max-w-7xl mx-auto'>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Input Section */}
					<div className='lg:col-span-1'>
						<div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-6'>
							<div className='flex items-center gap-3 mb-6'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center'>
									<Sparkles className='w-5 h-5 text-white' />
								</div>
								<h2 className='text-lg font-semibold text-gray-900'>
									Resume Review
								</h2>
							</div>

							<form onSubmit={onSubmitHandler} className='space-y-5'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Upload Resume
									</label>
									<div className='flex items-center justify-center w-full'>
										<label
											htmlFor='dropzone-file'
											className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition'
										>
											<div className='flex flex-col items-center justify-center pt-5 pb-6'>
												<FileText className='w-8 h-8 mb-3 text-gray-400' />
												<p className='mb-2 text-sm text-gray-500'>
													<span className='font-semibold'>Click to upload</span> or
													drag and drop
												</p>
												<p className='text-xs text-gray-500'>PDF (MAX. 10MB)</p>
											</div>
											<input
												id='dropzone-file'
												type='file'
												accept='application/pdf'
												onChange={handleFileChange}
												className='hidden'
												required
											/>
										</label>
									</div>
								</div>

								{fileName && (
									<div className='bg-gray-50 p-3 rounded-lg'>
										<p className='text-sm text-gray-700 truncate'>
											<FileText className='w-4 h-4 inline mr-2' />
											{fileName}
										</p>
									</div>
								)}

								<button
									disabled={loading || !input}
									className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition disabled:opacity-70 disabled:cursor-not-allowed'
								>
									{loading ? (
										<span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
									) : (
										<>
											<FileText className='w-5 h-5' />
											Review Resume
										</>
									)}
								</button>
							</form>
						</div>
					</div>

				{/* Output Section */}
				<div className='lg:col-span-2'>
					<div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-h-[calc(100vh-3rem)] overflow-hidden flex flex-col'>
						<div className='flex items-center justify-between mb-6 flex-shrink-0'>
								<div className='flex items-center gap-3'>
									<div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
										<FileText className='w-5 h-5 text-gray-600' />
									</div>
									<h2 className='text-lg font-semibold text-gray-900'>
										Analysis Results
									</h2>
								</div>
								{content && (
									<ActionButtons
										content={content}
										type='markdown'
										filename={`resume-review-${Date.now()}`}
									/>
								)}
							</div>

						{/* ATS Score Display */}
						{atsScore !== null && (
							<div className='mb-6 p-5 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 flex-shrink-0'>
									<div className='flex items-center justify-between'>
										<div>
											<h2 className='text-sm font-medium text-gray-700 mb-1'>
												ATS Score
											</h2>
											<p className='text-xs text-gray-600'>
												Applicant Tracking System Compatibility
											</p>
										</div>
										<div className='flex items-center gap-3'>
											<div className='relative w-20 h-20'>
												<svg className='transform -rotate-90 w-20 h-20'>
													<circle
														cx='40'
														cy='40'
														r='36'
														stroke='currentColor'
														strokeWidth='6'
														fill='none'
														className='text-gray-200'
													/>
													<circle
														cx='40'
														cy='40'
														r='36'
														stroke='currentColor'
														strokeWidth='6'
														fill='none'
														strokeDasharray={`${2 * Math.PI * 36}`}
														strokeDashoffset={`${
															2 * Math.PI * 36 * (1 - atsScore / 100)
														}`}
														className={`transition-all duration-500 ${
															atsScore >= 80
																? "text-teal-600"
																: atsScore >= 60
																? "text-yellow-500"
																: "text-red-500"
														}`}
													/>
												</svg>
												<div className='absolute inset-0 flex items-center justify-center'>
													<span
														className={`text-2xl font-bold ${
															atsScore >= 80
																? "text-teal-600"
																: atsScore >= 60
																? "text-yellow-600"
																: "text-red-600"
														}`}
													>
														{atsScore}
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className='mt-3 pt-3 border-t border-teal-200'>
										<p
											className={`text-xs font-medium ${
												atsScore >= 80
													? "text-teal-700"
													: atsScore >= 60
													? "text-yellow-700"
													: "text-red-700"
											}`}
										>
											{atsScore >= 80
												? "✓ Excellent ATS compatibility"
												: atsScore >= 60
												? "⚠ Good, but could be improved"
												: "⚠ Needs significant improvements for ATS"}
										</p>
									</div>
								</div>
							)}

						<div className='h-[450px] overflow-auto flex-shrink-0'>
							{!content ? (
									<div className='flex flex-col justify-center items-center text-center py-16'>
										<div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
											<FileText className='w-8 h-8 text-gray-400' />
										</div>
										<p className='text-gray-500 max-w-xs'>
											Upload a resume and click "Review Resume" to get AI-powered
											feedback and ATS score
										</p>
									</div>
								) : (
									<div className='px-4 py-3'>
										<Markdown
											remarkPlugins={[remarkGfm]}
											components={{
												h1: ({ children }) => (
													<h1 className='text-2xl font-bold text-gray-900 mb-4 mt-6 border-b-2 border-teal-200 pb-2'>
														{children}
													</h1>
												),
												h2: ({ children }) => (
													<h2 className='text-xl font-bold text-gray-800 mb-3 mt-5'>
														{children}
													</h2>
												),
												h3: ({ children }) => (
													<h3 className='text-lg font-semibold text-gray-700 mb-2 mt-4'>
														{children}
													</h3>
												),
												h4: ({ children }) => (
													<h4 className='text-base font-semibold text-gray-700 mb-2 mt-3'>
														{children}
													</h4>
												),
												p: ({ children }) => (
													<p className='text-gray-700 mb-3 leading-7 text-base'>
														{children}
													</p>
												),
												ul: ({ children }) => (
													<ul className='list-disc ml-6 mb-4 space-y-1.5'>
														{children}
													</ul>
												),
												ol: ({ children }) => (
													<ol className='list-decimal ml-6 mb-4 space-y-1.5'>
														{children}
													</ol>
												),
												li: ({ children }) => (
													<li className='text-gray-700 leading-7'>{children}</li>
												),
												strong: ({ children }) => (
													<strong className='font-bold text-gray-900'>
														{children}
													</strong>
												),
												em: ({ children }) => (
													<em className='italic text-gray-600'>{children}</em>
												),
												blockquote: ({ children }) => (
													<blockquote className='border-l-4 border-teal-500 pl-4 italic text-gray-600 my-4 bg-teal-50 py-2'>
														{children}
													</blockquote>
												),
												hr: () => <hr className='my-4 border-gray-200' />,
											}}
										>
											{content}
										</Markdown>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
	);
};

export default ReviewResume;