import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Trash2, ChevronDown, ChevronUp, Image as ImageIcon, FileText, Briefcase, GraduationCap, ExternalLink } from 'lucide-react'

const CreationItem = ({ item, onDelete }) => {

    const [expanded, setExpanded] = useState(false)

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this creation?')) {
            onDelete(item.id);
        }
    }

    const getIconAndColor = () => {
        switch (item.type) {
            case 'image':
                return { icon: ImageIcon, bgColor: 'bg-purple-500/10', textColor: 'text-purple-600' };
            case 'job-opportunities':
                return { icon: Briefcase, bgColor: 'bg-blue-500/10', textColor: 'text-blue-600' };
            case 'learning-resources':
                return { icon: GraduationCap, bgColor: 'bg-green-500/10', textColor: 'text-green-600' };
            default:
                return { icon: FileText, bgColor: 'bg-blue-500/10', textColor: 'text-blue-600' };
        }
    }

    const { icon: Icon, bgColor, textColor } = getIconAndColor();

    const renderContent = () => {
        if (item.type === 'image') {
            return (
                <div className="relative group/image overflow-hidden rounded-md max-w-md">
                    <img src={item.content} alt="Generated content" className='w-full h-auto object-cover' />
                </div>
            );
        } else if (item.type === 'job-opportunities') {
            let jobTitles = [];
            try {
                jobTitles = JSON.parse(item.content);
            } catch (e) {
                jobTitles = [];
            }
            return (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Suggested Job Roles:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {jobTitles.map((title, index) => (
                            <div key={index} className="p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                                <p className="text-sm font-medium text-foreground">{title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (item.type === 'learning-resources') {
            let resources = [];
            try {
                resources = JSON.parse(item.content);
            } catch (e) {
                resources = [];
            }
            return (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Learning Resources:</h3>
                    {resources.map((resource, index) => (
                        <div key={index} className="p-4 bg-secondary/50 rounded-lg border border-border">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-semibold text-foreground">{resource.skill}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{resource.importance}</p>
                            <div className="flex flex-wrap gap-2">
                                {resource.youtubeLink && (
                                    <a
                                        href={resource.youtubeLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-md hover:bg-red-500/20 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        YouTube
                                    </a>
                                )}
                                {resource.articleLink && (
                                    <a
                                        href={resource.articleLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-md hover:bg-blue-500/20 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Article
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className='prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary'>
                    <Markdown>
                        {item.content}
                    </Markdown>
                </div>
            );
        }
    }

    return (
        <div className='group bg-card hover:bg-secondary/50 border-b border-border last:border-0 transition-colors'>
            <div
                className='flex justify-between items-center gap-4 p-4 cursor-pointer'
                onClick={() => (setExpanded(!expanded))}
            >
                <div className='flex items-center gap-4 flex-1 min-w-0'>
                    <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h2 className='font-medium text-foreground truncate'>{item.prompt}</h2>
                        <p className='text-xs text-muted-foreground mt-0.5'>
                            {new Date(item.created_at).toLocaleDateString()} • {item.type.replace('-', ' ')}
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <button
                        onClick={handleDelete}
                        className='p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100'
                        title='Delete creation'
                    >
                        <Trash2 className='w-4 h-4' />
                    </button>
                    <div className='text-muted-foreground'>
                        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className='px-4 pb-4 pl-[4.5rem]'>
                    <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                        {renderContent()}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreationItem