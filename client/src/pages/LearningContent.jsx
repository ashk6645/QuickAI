import { GraduationCap, FileText, Sparkles, ExternalLink, Upload, Youtube, BookOpen } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import { ActionButtons } from '../components/ActionButtons'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const LearningContent = () => {
  const [inputType, setInputType] = useState('text') // 'text' or 'pdf'
  const [jobDescription, setJobDescription] = useState('')
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [learningContent, setLearningContent] = useState('')

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0]
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      setFile(uploadedFile)
      setFileName(uploadedFile.name)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    if (inputType === 'text' && !jobDescription.trim()) {
      toast.error('Please enter a job description')
      return
    }
    
    if (inputType === 'pdf' && !file) {
      toast.error('Please upload a job description PDF')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      
      if (inputType === 'text') {
        formData.append('jobDescription', jobDescription)
      } else {
        formData.append('jdFile', file)
      }
      formData.append('inputType', inputType)

      const { data } = await axios.post('/api/ai/learning-content', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        setLearningContent(data.content)
        toast.success('Learning resources found!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div className='p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Input Card */}
        <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center'>
              <Sparkles className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>AI Learning Path</h1>
          </div>

          {/* Input Type Toggle */}
          <div className='mb-5'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Input Method</label>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setInputType('text')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                  inputType === 'text'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FileText className='w-4 h-4 inline mr-2' />
                Paste Text
              </button>
              <button
                type='button'
                onClick={() => setInputType('pdf')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                  inputType === 'pdf'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Upload className='w-4 h-4 inline mr-2' />
                Upload PDF
              </button>
            </div>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-5'>
            {inputType === 'text' ? (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Paste Job Description
                </label>
                <textarea
                  onChange={(e) => setJobDescription(e.target.value)}
                  value={jobDescription}
                  rows={12}
                  className='w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none'
                  placeholder='Paste the job description here to get personalized learning resources...'
                  required
                />
              </div>
            ) : (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Upload Job Description PDF
                </label>
                <div className='flex items-center justify-center w-full'>
                  <label
                    htmlFor='jd-upload'
                    className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition'
                  >
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                      <Upload className='w-8 h-8 mb-3 text-gray-400' />
                      <p className='mb-2 text-sm text-gray-500'>
                        <span className='font-semibold'>Click to upload</span> or drag and drop
                      </p>
                      <p className='text-xs text-gray-500'>PDF (MAX. 10MB)</p>
                    </div>
                    <input
                      id='jd-upload'
                      type='file'
                      accept='application/pdf'
                      onChange={handleFileChange}
                      className='hidden'
                      required
                    />
                  </label>
                </div>
                {fileName && (
                  <div className='bg-gray-50 p-3 rounded-lg mt-3'>
                    <p className='text-sm text-gray-700 truncate'>
                      <FileText className='w-4 h-4 inline mr-2' />
                      {fileName}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              disabled={loading}
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition disabled:opacity-70'
            >
              {loading ? (
                <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
              ) : (
                <>
                  <GraduationCap className='w-5 h-5' />
                  Get Learning Resources
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                <GraduationCap className='w-5 h-5 text-gray-600' />
              </div>
              <h1 className='text-xl font-semibold text-gray-900'>Learning Resources</h1>
            </div>
            {learningContent && (
              <ActionButtons content={learningContent} type='markdown' filename={`learning-resources-${Date.now()}`} />
            )}
          </div>

          {!learningContent ? (
            <div className='flex-1 flex flex-col justify-center items-center text-center py-10'>
              <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                <GraduationCap className='w-8 h-8 text-gray-400' />
              </div>
              <p className='text-gray-500 max-w-xs'>
                {inputType === 'text' 
                  ? 'Paste a job description to get curated learning resources'
                  : 'Upload a job description PDF to discover learning materials'}
              </p>
              <div className='flex items-center gap-4 mt-6'>
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <Youtube className='w-4 h-4' />
                  <span>Videos</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <BookOpen className='w-4 h-4' />
                  <span>Articles</span>
                </div>
              </div>
            </div>
          ) : (
            <div className='prose prose-sm max-w-none text-gray-700 flex-1 max-h-[600px] overflow-auto'>
              <style>{`
                .prose h2, .prose h3 {
                  color: #1f2937;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  font-weight: 600;
                }
                .prose h2 {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                }
                .prose a {
                  color: #059669;
                  text-decoration: none;
                  font-weight: 500;
                }
                .prose a:hover {
                  text-decoration: underline;
                }
                .prose ul {
                  list-style-type: none;
                  padding-left: 0;
                  margin-top: 0.5rem;
                  margin-bottom: 1.5rem;
                }
                .prose li {
                  margin-top: 0.75rem;
                  margin-bottom: 0.75rem;
                  padding: 0.75rem;
                  background: #f9fafb;
                  border-radius: 0.5rem;
                  border-left: 3px solid #10b981;
                }
                .prose strong {
                  color: #1f2937;
                  font-weight: 600;
                }
              `}</style>
              <Markdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target='_blank' rel='noopener noreferrer'>
                      {props.children}
                      <ExternalLink className='w-3 h-3 inline ml-1' />
                    </a>
                  )
                }}
              >
                {learningContent}
              </Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearningContent
