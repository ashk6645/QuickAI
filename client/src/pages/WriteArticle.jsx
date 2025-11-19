import { Edit, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      const prompt = `Write a well-structured, professional article about "${input}".

Requirements:
- Length: ${selectedLength.text}
- Use proper markdown formatting with headings (# for main sections, ## for subsections)
- Include an engaging introduction
- Break content into clear sections with descriptive headings
- Use proper spacing between paragraphs
- Include bullet points or numbered lists where appropriate
- End with a compelling conclusion
- Make it SEO-friendly and easy to read

Format the article in clean markdown with proper spacing.`
      const { data } = await axios.post('/api/ai/generate-article', {
        prompt,
        length: selectedLength.length
      }, {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })

      if (data.success) {
        // Remove markdown code fence if present
        let cleanContent = data.content;
        if (cleanContent.startsWith('```markdown') || cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```markdown\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        console.log('Cleaned content:', cleanContent);
        setContent(cleanContent)
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
                <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center'>
                  <Sparkles className='w-5 h-5 text-white' />
                </div>
                <h2 className='text-lg font-semibold text-gray-900'>Article Configuration</h2>
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
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Article Length</label>
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
                  type="submit"
                  disabled={loading} 
                  className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed'
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
          </div>

          {/* Output Section */}
          <div className='lg:col-span-2'>
            <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                    <Edit className='w-5 h-5 text-gray-600' />
                  </div>
                  <h2 className='text-lg font-semibold text-gray-900'>Generated Article</h2>
                </div>
                {content && <ActionButtons content={content} type="markdown" filename={`article-${Date.now()}`} />}
              </div>
              
              <div className='h-[450px] overflow-auto'>
                {!content ? (
                  <div className='flex flex-col justify-center items-center text-center py-16'>
                    <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                      <Edit className='w-8 h-8 text-gray-400' />
                    </div>
                    <p className='text-gray-500 max-w-xs'>Enter a topic and click "Generate Article" to get started</p>
                  </div>
                ) : (
                  <div className='px-4 py-3'>
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className='text-3xl font-bold text-gray-900 mb-6 mt-8 border-b-2 border-gray-200 pb-3'>{children}</h1>,
                  h2: ({children}) => <h2 className='text-2xl font-bold text-gray-800 mb-4 mt-6'>{children}</h2>,
                  h3: ({children}) => <h3 className='text-xl font-semibold text-gray-700 mb-3 mt-5'>{children}</h3>,
                  h4: ({children}) => <h4 className='text-lg font-semibold text-gray-700 mb-2 mt-4'>{children}</h4>,
                  p: ({children}) => <p className='text-gray-700 mb-4 leading-7 text-base'>{children}</p>,
                  ul: ({children}) => <ul className='list-disc ml-8 mb-4 space-y-2'>{children}</ul>,
                  ol: ({children}) => <ol className='list-decimal ml-8 mb-4 space-y-2'>{children}</ol>,
                  li: ({children}) => <li className='text-gray-700 leading-7'>{children}</li>,
                  strong: ({children}) => <strong className='font-bold text-gray-900'>{children}</strong>,
                  em: ({children}) => <em className='italic text-gray-600'>{children}</em>,
                  blockquote: ({children}) => <blockquote className='border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2'>{children}</blockquote>,
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
export default WriteArticle