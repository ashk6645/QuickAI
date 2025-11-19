import { useAuth } from '@clerk/clerk-react';
import { Hash, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import axios from 'axios'
import { ActionButtons } from '../components/ActionButtons';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    'General', 'Technology', 'Health', 'Lifestyle', 'Travel', 'Food', 'Education', 'Business'
  ]

  const [selectedCategory, setSelectedCategory] = useState('General')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = `Generate 10 catchy, engaging blog title ideas about "${input}" in the ${selectedCategory} category. 

Format your response as a numbered list (1-10). Each title should be:
- Attention-grabbing and compelling
- SEO-friendly
- Clear and concise
- Under 60 characters when possible

Example format:
1. [Title 1]
2. [Title 2]
...and so on.`
      const { data } = await axios.post('/api/ai/generate-blog-title', {
        prompt
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
    <div className='h-full overflow-y-auto'>
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Upload Section */}
          <div className='lg:col-span-1'>
            <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
                  <Sparkles className='w-5 h-5 text-white' />
                </div>
                <h2 className='text-lg font-semibold text-gray-900'>Title Configuration</h2>
              </div>
              
              <form onSubmit={onSubmitHandler} className='space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Topic Keyword</label>
                  <input 
                    onChange={(e) => setInput(e.target.value)} 
                    value={input} 
                    type="text" 
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition' 
                    placeholder='Technology, Human, Environment...' 
                    required 
                  />
                </div>
                
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
                  <div className='flex flex-wrap gap-2'>
                    {blogCategories.map((item) => (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(item)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition ${selectedCategory === item 
                          ? 'bg-purple-100 text-purple-700 border-purple-200' 
                          : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        key={item}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={loading} 
                  className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                  ) : (
                    <>
                      <Hash className='w-5 h-5' />
                      Generate Titles
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Output Section */}
          <div className='lg:col-span-2'>
            <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                    <Hash className='w-5 h-5 text-gray-600' />
                  </div>
                  <h2 className='text-lg font-semibold text-gray-900'>Generated Titles</h2>
                </div>
                {content && <ActionButtons content={content} type="text" filename={`blog-titles-${Date.now()}`} />}
              </div>
              
              <div className='h-[450px] overflow-auto'>
                {!content ? (
                  <div className='flex flex-col justify-center items-center text-center py-16'>
                    <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                      <Hash className='w-8 h-8 text-gray-400' />
                    </div>
                    <p className='text-gray-500 max-w-xs'>Enter a keyword and select a category to generate title ideas</p>
                  </div>
                ) : (
                  <div className='prose prose-sm max-w-none text-gray-700'>
                    <Markdown 
                      components={{
                        ol: ({node, ...props}) => <ol className='list-decimal list-inside space-y-2 text-gray-800' {...props} />,
                        li: ({node, ...props}) => <li className='py-1.5 px-3 hover:bg-gray-50 rounded transition cursor-pointer text-base leading-relaxed' {...props} />,
                        p: ({node, ...props}) => <p className='mb-2' {...props} />
                      }}
                    >
                      {content}
                    </Markdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogTitles