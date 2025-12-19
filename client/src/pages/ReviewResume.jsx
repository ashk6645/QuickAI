import { FileText, Sparkles, Upload } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { ActionButtons } from '../components/ActionButtons';
import DataPipeline from '../components/DataPipeline';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [isDataFlowing, setIsDataFlowing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setInput(file);
    setFileName(file ? file.name : '');
    setAtsScore(null);
    setContent('');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setIsDataFlowing(true);
      setIsReceiving(false);
      setContent('');
      setAtsScore(null);
      
      const formData = new FormData();
      formData.append('resume', input);

      setTimeout(() => {
        setIsReceiving(true);
      }, 1000);

      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        // Auto-format the content for clean bullet display and spacing
        setContent(data.content);
        setAtsScore(data.atsScore);
        setTimeout(() => {
          setIsDataFlowing(false);
          setIsReceiving(false);
        }, 500);
      } else {
        toast.error(data.message);
        setIsDataFlowing(false);
        setIsReceiving(false);
      }
    } catch (error) {
      toast.error(error.message);
      setIsDataFlowing(false);
      setIsReceiving(false);
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border shadow-sm sticky top-0 relative">
              <DataPipeline isActive={isDataFlowing} isReceiving={isReceiving} />
              <div className='flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border bg-muted/50'>
                <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Upload className='w-5 h-5 text-primary' />
                </div>
                <h2 className='text-lg font-semibold text-foreground'>Upload Resume</h2>
              </div>

              <form onSubmit={onSubmitHandler} className="space-y-5 p-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Resume File
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary transition"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PDF (MAX. 10MB)</p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>

                {fileName && (
                  <div className="bg-secondary/30 p-3 rounded-lg border border-border">
                    <p className="text-sm text-foreground truncate flex items-center gap-2">
                      <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                      <span className="truncate">{fileName}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !input}
                  className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Review Resume
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2 relative">
            <div className={`bg-card rounded-xl border h-[calc(100vh-8rem)] flex flex-col transition-all duration-500 ${
              isReceiving ? 'border-primary/50 animate-receiving-pulse' : 'border-border shadow-sm'
            }`}>
              <div className='flex items-center justify-between px-6 pt-6 pb-4 border-b border-border bg-muted/50 flex-shrink-0'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                    <Sparkles className='w-5 h-5 text-primary' />
                  </div>
                  <h2 className='text-lg font-semibold text-foreground'>Review Feedback</h2>
                </div>
                {content && (
                  <ActionButtons
                    content={content}
                    type="markdown"
                    filename={`resume-review-${Date.now()}`}
                  />
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 pl-6 py-4 custom-scrollbar">
                {/* ATS Score Display */}
                {atsScore !== null && (
                  <div className="mb-6 p-5 rounded-xl bg-secondary/20 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-medium text-foreground mb-1">ATS Score</h2>
                        <p className="text-xs text-muted-foreground">Applicant Tracking System Compatibility</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20">
                          <svg className="transform -rotate-90 w-20 h-20">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              className="text-secondary"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 36}`}
                              strokeDashoffset={`${2 * Math.PI * 36 * (1 - atsScore / 100)}`}
                              className={`transition-all duration-500 ${atsScore >= 80
                                ? 'text-emerald-500'
                                : atsScore >= 60
                                  ? 'text-amber-500'
                                  : 'text-rose-500'
                                }`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-bold ${atsScore >= 80
                              ? 'text-emerald-500'
                              : atsScore >= 60
                                ? 'text-amber-500'
                                : 'text-rose-500'
                              }`}>
                              {atsScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className={`text-xs font-medium ${atsScore >= 80
                        ? 'text-emerald-600'
                        : atsScore >= 60
                          ? 'text-amber-600'
                          : 'text-rose-600'
                        }`}>
                        {atsScore >= 80
                          ? '✓ Excellent ATS compatibility'
                          : atsScore >= 60
                            ? '⚠ Good, but could be improved'
                            : '⚠ Needs significant improvements for ATS'}
                      </p>
                    </div>
                  </div>
                )}

                {!content ? (
                  <div className="h-full flex flex-col justify-center items-center text-center py-16 opacity-50">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground max-w-xs">
                      Upload a resume and click "Review Resume" to get AI-powered feedback
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-foreground">
                    <style>{`
                      .prose h2, .prose h3, .prose strong {
                        color: var(--color-foreground);
                        margin-top: 1.5rem;
                        margin-bottom: 0.75rem;
                        font-weight: 600;
                      }
                      .prose p {
                        margin-bottom: 0.75rem;
                        line-height: 1.6;
                        color: var(--color-foreground);
                      }
                      .prose ul {
                        list-style-type: disc;
                        padding-left: 1.5rem;
                        margin-top: 0.5rem;
                        margin-bottom: 1.5rem;
                      }
                      .prose li {
                        margin-top: 0.25rem;
                        margin-bottom: 0.25rem;
                        color: var(--color-foreground);
                      }
                      .prose > *:not(:last-child) {
                        margin-bottom: 1.25rem;
                      }
                    `}</style>
                    <Markdown>{content}</Markdown>
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

export default ReviewResume;