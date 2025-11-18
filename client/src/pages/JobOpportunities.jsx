import {
	FileText,
	Search,
	Briefcase,
	ExternalLink,
	Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const JobOpportunities = () => {
	const [resume, setResume] = useState(null);
	const [fileName, setFileName] = useState("");
	const [loading, setLoading] = useState(false);
	const [jobTitles, setJobTitles] = useState([]);
	const [searchingJob, setSearchingJob] = useState(null);
	const [searchResults, setSearchResults] = useState({});

	const { getToken } = useAuth();

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setResume(file);
		setFileName(file ? file.name : "");
		setJobTitles([]);
		setSearchResults({});
	};

	const onSubmitHandler = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			const formData = new FormData();
			formData.append("resume", resume);

			const { data } = await axios.post(
				"/api/ai/find-job-opportunities",
				formData,
				{
					headers: {
						Authorization: `Bearer ${await getToken()}`,
					},
				}
			);

			if (data.success) {
				setJobTitles(data.jobTitles || []);
				toast.success("Job opportunities found!");
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			toast.error(error.response?.data?.message || error.message);
		}
		setLoading(false);
	};

	const handleSearchJob = async (jobTitle) => {
		try {
			setSearchingJob(jobTitle);
			const { data } = await axios.post(
				"/api/ai/search-jobs",
				{ jobTitle },
				{
					headers: {
						Authorization: `Bearer ${await getToken()}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (data.success && data.searchData) {
				setSearchResults((prev) => ({
					...prev,
					[jobTitle]: data.searchData,
				}));
				toast.success("Job search links generated!");
			} else {
				toast.error(data.message || "Failed to generate job search links");
			}
		} catch (error) {
			console.error("Error searching jobs:", error);
			toast.error(
				error.response?.data?.message ||
					error.message ||
					"Failed to search jobs"
			);
		} finally {
			setSearchingJob(null);
		}
	};

	return (
		<div className='h-full overflow-y-auto'>
			<div className='p-6 max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-6'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
							<Briefcase className='w-5 h-5 text-white' />
						</div>
						<h1 className='text-2xl font-semibold text-gray-900'>
							Job Opportunities
						</h1>
					</div>
					<p className='text-gray-600 text-sm'>
						Upload your resume to discover relevant job opportunities tailored
						to your skills and experience.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Upload Section */}
					<div className='lg:col-span-1'>
						<div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-6'>
							<div className='flex items-center gap-3 mb-6'>
								<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
									<Sparkles className='w-5 h-5 text-white' />
								</div>
								<h2 className='text-lg font-semibold text-gray-900'>
									Upload Resume
								</h2>
							</div>

							<form onSubmit={onSubmitHandler} className='space-y-5'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Resume File
									</label>
									<div className='flex items-center justify-center w-full'>
										<label
											htmlFor='dropzone-file'
											className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition'
										>
											<div className='flex flex-col items-center justify-center pt-5 pb-6'>
												<FileText className='w-8 h-8 mb-3 text-gray-400' />
												<p className='mb-2 text-sm text-gray-500'>
													<span className='font-semibold'>Click to upload</span>{" "}
													or drag and drop
												</p>
												<p className='text-xs text-gray-500'>PDF (MAX. 5MB)</p>
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
										<p className='text-sm text-gray-700 truncate flex items-center gap-2'>
											<FileText className='w-4 h-4 flex-shrink-0' />
											<span className='truncate'>{fileName}</span>
										</p>
									</div>
								)}

								<button
									type='submit'
									disabled={loading || !resume}
									className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-70 disabled:cursor-not-allowed'
								>
									{loading ? (
										<span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
									) : (
										<>
											<Briefcase className='w-5 h-5' />
											Find Opportunities
										</>
									)}
								</button>
							</form>
						</div>
					</div>

					{/* Job Opportunities Section */}
					<div className='lg:col-span-2'>
						<div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
							<div className='flex items-center gap-3 mb-6'>
								<div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
									<Briefcase className='w-5 h-5 text-gray-600' />
								</div>
								<h2 className='text-lg font-semibold text-gray-900'>
									Suggested Job Roles
								</h2>
							</div>

							<div className="h-[450px] overflow-scroll">
								{jobTitles.length === 0 ? (
									<div className='flex flex-col justify-center items-center text-center py-16'>
										<div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
											<Briefcase className='w-8 h-8 text-gray-400' />
										</div>
										<p className='text-gray-500 max-w-xs'>
											Upload your resume and click "Find Opportunities" to
											discover relevant job roles
										</p>
									</div>
								) : (
									<div className='space-y-4'>
										{jobTitles.map((jobTitle, index) => {
											const isSearching = searchingJob === jobTitle;
											const searchData = searchResults[jobTitle];

											return (
												<div
													key={index}
													className='border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition'
												>
													<div className='flex items-center justify-between mb-3 flex-wrap gap-2'>
														<h3 className='text-lg font-medium text-gray-900 flex-1 min-w-[200px]'>
															{jobTitle}
														</h3>
														<button
															onClick={() => handleSearchJob(jobTitle)}
															disabled={isSearching}
															className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm whitespace-nowrap'
														>
															{isSearching ? (
																<>
																	<span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
																	Searching...
																</>
															) : (
																<>
																	<Search className='w-4 h-4' />
																	{searchData && searchData.searchUrls
																		? "Refresh Links"
																		: "Search Jobs"}
																</>
															)}
														</button>
													</div>

													{searchData && searchData.searchUrls && (
														<div className='mt-4 pt-4 border-t border-gray-200 animate-in fade-in duration-300'>
															{searchData.keywords && (
																<p className='text-sm text-gray-600 mb-3'>
																	<strong>Keywords:</strong>{" "}
																	{searchData.keywords}
																</p>
															)}
															<div className='flex flex-wrap gap-2'>
																{searchData.searchUrls.indeed && (
																	<a
																		href={searchData.searchUrls.indeed}
																		target='_blank'
																		rel='noopener noreferrer'
																		className='flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium shadow-sm hover:shadow-md'
																	>
																		<ExternalLink className='w-4 h-4' />
																		Indeed
																	</a>
																)}
																{searchData.searchUrls.linkedin && (
																	<a
																		href={searchData.searchUrls.linkedin}
																		target='_blank'
																		rel='noopener noreferrer'
																		className='flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium shadow-sm hover:shadow-md'
																	>
																		<ExternalLink className='w-4 h-4' />
																		LinkedIn
																	</a>
																)}
																{searchData.searchUrls.glassdoor && (
																	<a
																		href={searchData.searchUrls.glassdoor}
																		target='_blank'
																		rel='noopener noreferrer'
																		className='flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium shadow-sm hover:shadow-md'
																	>
																		<ExternalLink className='w-4 h-4' />
																		Glassdoor
																	</a>
																)}
															</div>
														</div>
													)}
												</div>
											);
										})}
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

export default JobOpportunities;
