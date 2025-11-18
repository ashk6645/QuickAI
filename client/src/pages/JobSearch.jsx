import { Briefcase, FileText, Sparkles, ExternalLink, Upload } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import { ActionButtons } from '../components/ActionButtons'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const JobSearch = () => {
  const [inputType, setInputType] = useState('jd') // 'jd' or 'resume'
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobResults, setJobResults] = useState('')

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      setResume(file)
      setFileName(file.name)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    if (inputType === 'jd' && !jobDescription.trim()) {
      toast.error('Please enter a job description')
      return
    }
    
    if (inputType === 'resume' && !resume) {
      toast.error('Please upload your resume')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      
      if (inputType === 'jd') {
        formData.append('jobDescription', jobDescription)
      } else {
        formData.append('resume', resume)
      }
      formData.append('inputType', inputType)

      const { data } = await axios.post('/api/ai/job-search', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        setJobResults(data.content)
        toast.success('Job opportunities found!')
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
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center'>
              <Sparkles className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>AI Job Search</h1>
          </div>

          {/* Input Type Toggle */}
          <div className='mb-5'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Search By</label>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setInputType('jd')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                  inputType === 'jd'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FileText className='w-4 h-4 inline mr-2' />
                Job Description
              </button>
              <button
                type='button'
                onClick={() => setInputType('resume')}
                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                  inputType === 'resume'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Upload className='w-4 h-4 inline mr-2' />
                Resume
              </button>
            </div>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-5'>
            {inputType === 'jd' ? (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Paste Job Description
                </label>
                <textarea
                  onChange={(e) => setJobDescription(e.target.value)}
                  value={jobDescription}
                  rows={12}
                  className='w-full px-4 py-2.5 border border-gray-200 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none'
                  placeholder='Paste the job description here...'
                  required
                />
              </div>
            ) : (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Upload Resume
                </label>
                <div className='flex items-center justify-center w-full'>
                  <label
                    htmlFor='resume-upload'
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
                      id='resume-upload'
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
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-70'
            >
              {loading ? (
                <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
              ) : (
                <>
                  <Briefcase className='w-5 h-5' />
                  Find Job Opportunities
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
                <Briefcase className='w-5 h-5 text-gray-600' />
              </div>
              <h1 className='text-xl font-semibold text-gray-900'>Job Opportunities</h1>
            </div>
            {jobResults && (
              <ActionButtons content={jobResults} type='markdown' filename={`job-opportunities-${Date.now()}`} />
            )}
          </div>

          {!jobResults ? (
            <div className='flex-1 flex flex-col justify-center items-center text-center py-10'>
              <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                <Briefcase className='w-8 h-8 text-gray-400' />
              </div>
              <p className='text-gray-500 max-w-xs'>
                {inputType === 'jd' 
                  ? 'Paste a job description to find similar opportunities'
                  : 'Upload your resume to find matching job roles'}
              </p>
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
                .prose a {
                  color: #4f46e5;
                  text-decoration: none;
                  font-weight: 500;
                }
                .prose a:hover {
                  text-decoration: underline;
                }
                .prose ul {
                  list-style-type: disc;
                  padding-left: 1.5rem;
                  margin-top: 0.5rem;
                  margin-bottom: 1.5rem;
                }
                .prose li {
                  margin-top: 0.5rem;
                  margin-bottom: 0.5rem;
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
                {jobResults}
              </Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobSearch
