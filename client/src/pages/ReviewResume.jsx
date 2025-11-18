import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { ActionButtons } from '../components/ActionButtons';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [atsScore, setAtsScore] = useState(null);

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
      const formData = new FormData();
      formData.append('resume', input);

      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        // Auto-format the content for clean bullet display and spacing
        const formattedContent = data.content
          .replace(/(\r\n|\r|\n){2,}/g, '\n\n') // Normalize line breaks
          .replace(/(\n)(?=[A-Z][a-z]+:)/g, '\n\n') // Add spacing before new sections like "Education:", "Experience:"
          .replace(/([•\-*]\s*)([A-Za-z])/g, '• $2'); // Ensure proper bullets

        setContent(formattedContent);
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
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Resume Review</h1>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
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
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 truncate">
                  <FileText className="w-4 h-4 inline mr-2" />
                  {fileName}
                </p>
              </div>
            )}

            <button
              disabled={loading || !input}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition disabled:opacity-70"
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

        {/* Output Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Analysis Results</h1>
            </div>
            {content && (
              <ActionButtons
                content={content}
                type="markdown"
                filename={`resume-review-${Date.now()}`}
              />
            )}
          </div>

          {/* ATS Score Display */}
          {atsScore !== null && (
            <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-1">ATS Score</h2>
                  <p className="text-xs text-gray-600">Applicant Tracking System Compatibility</p>
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
                        className="text-gray-200"
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
                        className={`transition-all duration-500 ${
                          atsScore >= 80
                            ? 'text-teal-600'
                            : atsScore >= 60
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold ${
                        atsScore >= 80
                          ? 'text-teal-600'
                          : atsScore >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {atsScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-teal-200">
                <p className={`text-xs font-medium ${
                  atsScore >= 80
                    ? 'text-teal-700'
                    : atsScore >= 60
                    ? 'text-yellow-700'
                    : 'text-red-700'
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
            <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 max-w-xs">
                Upload a resume and click "Review Resume" to get AI-powered feedback
              </p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700 flex-1 max-h-[400px] overflow-auto">
              <style>{`
                .prose h2, .prose h3, .prose strong {
                  color: #1f2937;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  font-weight: 600;
                }
                .prose p {
                  margin-bottom: 0.75rem;
                  line-height: 1.6;
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
  );
};

export default ReviewResume;
