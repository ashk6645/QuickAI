import React, { useState } from "react";
import Markdown from "react-markdown";

const CreationItem = ({ item }) => {
	const [expanded, setExpanded] = useState(false);

	// Convert JSON content to markdown format for job-opportunities and learning-resources
	const formatContentAsMarkdown = () => {
		if (item.type === "job-opportunities") {
			try {
				const jobTitles = JSON.parse(item.content);
				if (Array.isArray(jobTitles)) {
					return jobTitles.map((title) => `- ${title}`).join("\n");
				}
			} catch {
				// If parsing fails, return original content
				return item.content;
			}
		} else if (item.type === "learning-resources") {
			try {
				const resources = JSON.parse(item.content);
				if (resources && resources.skills && Array.isArray(resources.skills)) {
					let markdown = "";
					resources.skills.forEach((skill, index) => {
						markdown += `## ${index + 1}. ${skill.skillName}\n\n`;

						if (
							skill.resources?.youtube &&
							skill.resources.youtube.length > 0
						) {
							markdown += `### YouTube Videos\n\n`;
							skill.resources.youtube.forEach((video) => {
								markdown += `- [${video.title}](${video.url})`;
								if (video.description) {
									markdown += ` - ${video.description}`;
								}
								markdown += "\n";
							});
							markdown += "\n";
						}

						if (
							skill.resources?.articles &&
							skill.resources.articles.length > 0
						) {
							markdown += `### Articles & Tutorials\n\n`;
							skill.resources.articles.forEach((article) => {
								markdown += `- [${article.title}](${article.url})`;
								if (article.source) {
									markdown += ` (${article.source})`;
								}
								if (article.description) {
									markdown += ` - ${article.description}`;
								}
								markdown += "\n";
							});
							markdown += "\n";
						}
					});
					return markdown;
				}
			} catch {
				// If parsing fails, return original content
				return item.content;
			}
		}
		return item.content;
	};

	return (
		<div
			onClick={() => setExpanded(!expanded)}
			className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer'
		>
			<div className='flex justify-between items-center gap-4'>
				<div>
					<h2>{item.prompt}</h2>
					<p className='text-gray-500'>
						{item.type} - {new Date(item.created_at).toLocaleDateString()}
					</p>
				</div>
				<button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>
					{item.type}
				</button>
			</div>
			{expanded && (
				<div>
					{item.type === "image" ? (
						<div>
							<img
								src={item.content}
								alt='image'
								className='mt-3 w-full max-w-md'
							/>
						</div>
					) : (
						<div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
							<div className='reset-tw'>
								<Markdown>{formatContentAsMarkdown()}</Markdown>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CreationItem;
