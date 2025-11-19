import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import {
	Book,
	FileText,
	Sparkles,
	Youtube,
	ExternalLink,
	BookOpen,
	GraduationCap,
} from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const LearningResources = () => {
	const [jobDescription, setJobDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [learningResources, setLearningResources] = useState(null);

	const { getToken } = useAuth();

	const onSubmitHandler = async (e) => {
		e.preventDefault();
		if (!jobDescription.trim()) {
			toast.error("Please enter a job description");
			return;
		}

		try {
			setLoading(true);
			const { data } = await axios.post(
				"/api/ai/generate-learning-resources",
				{ jobDescription: jobDescription.trim() },
				{
					headers: {
						Authorization: `Bearer ${await getToken()}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (data.success) {
				setLearningResources(data.learningResources);
				toast.success("Learning resources generated successfully!");
			} else {
				toast.error(data.message || "Failed to generate learning resources");
			}
		} catch (error) {
			console.error("Error generating learning resources:", error);
			toast.error(
				error.response?.data?.message ||
					error.message ||
					"Failed to generate learning resources"
			);
		} finally {
			setLoading(false);
		}
	};

	const getSourceIcon = (source) => {
		const sourceLower = source?.toLowerCase() || "";
		if (sourceLower.includes("geeksforgeeks") || sourceLower.includes("gfg")) {
			return <BookOpen className='w-4 h-4' />;
		}
		if (sourceLower.includes("medium")) {
			return <FileText className='w-4 h-4' />;
		}
		if (sourceLower.includes("freecodecamp")) {
			return <GraduationCap className='w-4 h-4' />;
		}
		return <BookOpen className='w-4 h-4' />;
	};

	const getSourceColor = (source) => {
		const sourceLower = source?.toLowerCase() || "";
		if (sourceLower.includes("geeksforgeeks") || sourceLower.includes("gfg")) {
			return "bg-green-50 text-green-700 hover:bg-green-100 border-green-200";
		}
		if (sourceLower.includes("medium")) {
			return "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200";
		}
		if (sourceLower.includes("freecodecamp")) {
			return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";
		}
		return "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200";
	};

	return (
		<div className='h-full overflow-y-auto'>
			<div className='p-6 max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-6'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
							<Book className='w-5 h-5 text-white' />
						</div>
						<h1 className='text-2xl font-semibold text-gray-900'>
							Learning Resources
						</h1>
					</div>
					<p className='text-gray-600 text-sm'>
						Paste a job description to get personalized learning materials
						including YouTube videos and articles from trusted sources like
						GeeksforGeeks.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Input Section */}
					<div className='lg:col-span-1'>
						<div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-6'>
							<div className='flex items-center gap-3 mb-6'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
									<Sparkles className='w-5 h-5 text-white' />
								</div>
								<h2 className='text-lg font-semibold text-gray-900'>
									Job Description
								</h2>
							</div>

							<form onSubmit={onSubmitHandler} className='space-y-5'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Job Description
									</label>
									<textarea
										value={jobDescription}
										onChange={(e) => setJobDescription(e.target.value)}
										rows={12}
										className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none'
										placeholder='Paste the job description here...&#10;&#10;Example:&#10;We are looking for a Full Stack Developer with experience in React, Node.js, and MongoDB...'
										required
									/>
								</div>

								<button
									type='submit'
									disabled={loading || !jobDescription.trim()}
									className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-70 disabled:cursor-not-allowed'
								>
									{loading ? (
										<span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
									) : (
										<>
											<Book className='w-5 h-5' />
											Generate Resources
										</>
									)}
								</button>
							</form>
						</div>
					</div>

					{/* Results Section */}
					<div className='lg:col-span-2'>
						<div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
							<div className='flex items-center gap-3 mb-6'>
								<div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
									<Book className='w-5 h-5 text-gray-600' />
								</div>
								<h2 className='text-lg font-semibold text-gray-900'>
									Learning Resources
								</h2>
							</div>

							<div className='h-[480px] overflow-scroll'>
								{!learningResources ? (
									<div className='flex flex-col justify-center items-center text-center py-16'>
										<div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
											<Book className='w-8 h-8 text-gray-400' />
										</div>
										<p className='text-gray-500 max-w-xs'>
											Enter a job description and click "Generate Resources" to
											get personalized learning materials organized by skills
										</p>
									</div>
								) : (
									<div className='space-y-6'>
										{learningResources.skills &&
										learningResources.skills.length > 0 ? (
											learningResources.skills.map((skill, skillIndex) => (
												<div
													key={skillIndex}
													className='border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition'
												>
													{/* Skill Header */}
													<div className='flex items-center gap-3 mb-4'>
														<div className='w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
															<span className='text-white font-semibold text-sm'>
																{skillIndex + 1}
															</span>
														</div>
														<h3 className='text-xl font-semibold text-gray-900'>
															{skill.skillName}
														</h3>
													</div>

													{/* YouTube Videos */}
													{skill.resources?.youtube &&
													skill.resources.youtube.length > 0 ? (
														<div className='mb-5'>
															<div className='flex items-center gap-2 mb-3'>
																<Youtube className='w-5 h-5 text-red-600' />
																<h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
																	YouTube Videos
																</h4>
															</div>
															<div className='space-y-2 ml-7'>
																{skill.resources.youtube.map(
																	(video, videoIndex) => (
																		<a
																			key={videoIndex}
																			href={video.url}
																			target='_blank'
																			rel='noopener noreferrer'
																			className='flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:shadow-sm transition group'
																		>
																			<Youtube className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
																			<div className='flex-1 min-w-0'>
																				<h5 className='text-sm font-medium text-gray-900 group-hover:text-red-700 transition'>
																					{video.title}
																				</h5>
																				{video.description && (
																					<p className='text-xs text-gray-600 mt-1'>
																						{video.description}
																					</p>
																				)}
																			</div>
																			<ExternalLink className='w-4 h-4 text-gray-400 group-hover:text-red-600 transition flex-shrink-0 mt-1' />
																		</a>
																	)
																)}
															</div>
														</div>
													) : null}

													{/* Articles */}
													{skill.resources?.articles &&
													skill.resources.articles.length > 0 ? (
														<div>
															<div className='flex items-center gap-2 mb-3'>
																<BookOpen className='w-5 h-5 text-purple-600' />
																<h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
																	Articles & Tutorials
																</h4>
															</div>
															<div className='space-y-2 ml-7'>
																{skill.resources.articles.map(
																	(article, articleIndex) => (
																		<a
																			key={articleIndex}
																			href={article.url}
																			target='_blank'
																			rel='noopener noreferrer'
																			className={`flex items-start gap-3 p-3 border rounded-lg hover:shadow-sm transition group ${getSourceColor(
																				article.source
																			)}`}
																		>
																			<div className='flex-shrink-0 mt-0.5'>
																				{getSourceIcon(article.source)}
																			</div>
																			<div className='flex-1 min-w-0'>
																				<div className='flex items-center gap-2 mb-1'>
																					<h5 className='text-sm font-medium group-hover:underline'>
																						{article.title}
																					</h5>
																					{article.source && (
																						<span className='text-xs px-2 py-0.5 bg-white/50 rounded-full font-medium'>
																							{article.source}
																						</span>
																					)}
																				</div>
																				{article.description && (
																					<p className='text-xs opacity-80 mt-1'>
																						{article.description}
																					</p>
																				)}
																			</div>
																			<ExternalLink className='w-4 h-4 opacity-60 group-hover:opacity-100 transition flex-shrink-0 mt-1' />
																		</a>
																	)
																)}
															</div>
														</div>
													) : null}

													{/* Empty State for Skill */}
													{(!skill.resources?.youtube ||
														skill.resources.youtube.length === 0) &&
													(!skill.resources?.articles ||
														skill.resources.articles.length === 0) ? (
														<p className='text-sm text-gray-500 italic ml-7'>
															No resources available for this skill.
														</p>
													) : null}
												</div>
											))
										) : (
											<div className='flex flex-col justify-center items-center text-center py-16'>
												<div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
													<Book className='w-8 h-8 text-gray-400' />
												</div>
												<p className='text-gray-500 max-w-xs'>
													No learning resources found. Please try with a
													different job description.
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LearningResources;
