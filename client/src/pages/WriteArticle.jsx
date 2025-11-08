import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { ActionButtons } from '../components/ActionButtons';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: 'Short (500-800 words)' },
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1600, text: 'Long (1200+ words)' },
  ]

  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = `Write an article about ${input} in ${selectedLength.text}`
      const { data } = await axios.post('/api/ai/generate-article', {
        prompt,
        length: selectedLength.length
      }, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })

      if (data.success) {
        setContent(data.content)
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
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center'>
              <Sparkles className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>Article Configuration</h1>
          </div>
          
          <form onSubmit={onSubmitHandler} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Article Topic</label>
              <input 
                onChange={(e) => setInput(e.target.value)} 
                value={input} 
                type="text" 
                className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition' 
                placeholder='The Future of artificial intelligence is...' 
                required 
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Article length</label>
              <div className='flex flex-wrap gap-2'>
                {articleLength.map((item, index) => (
                  <button
                    type="button"
                    onClick={() => setSelectedLength(item)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${selectedLength.text === item.text 
                      ? 'bg-blue-100 text-blue-700 border-blue-200' 
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    key={index}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              disabled={loading} 
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-70'
            >
              {loading ? (
                <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
              ) : (
                <>
                  <Edit className='w-5 h-5' />
                  Generate Article
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Card */}
        <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                <Edit className='w-5 h-5 text-gray-600' />
              </div>
              <h1 className='text-xl font-semibold text-gray-900'>Generated Article</h1>
            </div>
            {content && <ActionButtons content={content} type="markdown" filename={`article-${Date.now()}`} />}
          </div>
          
          {!content ? (
            <div className='flex-1 flex flex-col justify-center items-center text-center py-10'>
              <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                <Edit className='w-8 h-8 text-gray-400' />
              </div>
              <p className='text-gray-500 max-w-xs'>Enter a topic and click "Generate Article" to get started</p>
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

export default WriteArticle