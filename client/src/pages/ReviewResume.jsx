import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setInput(file)
    setFileName(file ? file.name : '')
  }

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
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false)
  }

  return (
    <div className='p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Input Card */}
        <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center'>
              <Sparkles className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>Resume Review</h1>
          </div>
          
          <form onSubmit={onSubmitHandler} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Upload Resume</label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    accept='application/pdf' 
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
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition disabled:opacity-70'
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

        {/* Output Card */}
        <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
              <FileText className='w-5 h-5 text-gray-600' />
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>Analysis Results</h1>
          </div>
          
          {!content ? (
            <div className='flex-1 flex flex-col justify-center items-center text-center py-10'>
              <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                <FileText className='w-8 h-8 text-gray-400' />
              </div>
              <p className='text-gray-500 max-w-xs'>Upload a resume and click "Review Resume" to get started</p>
            </div>
          ) : (
            <div className='prose prose-sm max-w-none text-gray-700 flex-1 overflow-auto'>
              <Markdown>{content}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewResume