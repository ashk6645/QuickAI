import { useAuth } from '@clerk/clerk-react';
import { Hash, Sparkles, Edit } from 'lucide-react'
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
            <div className='bg-card rounded-xl border border-border shadow-sm sticky top-0'>
              <div className='flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border bg-muted/50'>
                <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Hash className='w-5 h-5 text-primary' />
                </div>
                <h2 className='text-lg font-semibold text-foreground'>Title Configuration</h2>
              </div>

              <form onSubmit={onSubmitHandler} className='space-y-5 p-6'>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>Topic Keyword</label>
                  <input
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    type="text"
                    className='w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-foreground placeholder:text-muted-foreground'
                    placeholder='Technology, Human, Environment...'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>Category</label>
                  <div className='flex flex-wrap gap-2'>
                    {blogCategories.map((item) => (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(item)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition ${selectedCategory === item
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'text-muted-foreground border-border hover:bg-secondary hover:text-foreground'}`}
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
                  className='w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20'
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
            <div className='bg-card rounded-xl border border-border shadow-sm h-[calc(100vh-8rem)] flex flex-col'>
              <div className='flex items-center justify-between px-6 pt-6 pb-4 border-b border-border bg-muted/50 flex-shrink-0'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                    <Sparkles className='w-5 h-5 text-primary' />
                  </div>
                  <h2 className='text-lg font-semibold text-foreground'>Generated Titles</h2>
                </div>
                {content && <ActionButtons content={content} type="text" filename={`blog-titles-${Date.now()}`} />}
              </div>

              <div className='flex-1 overflow-y-auto pr-2 pl-6 py-4 custom-scrollbar'>
                {!content ? (
                  <div className='h-full flex flex-col justify-center items-center text-center py-16 opacity-50'>
                    <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4'>
                      <Hash className='w-8 h-8 text-muted-foreground' />
                    </div>
                    <p className='text-muted-foreground max-w-xs'>Enter a keyword and select a category to generate title ideas</p>
                  </div>
                ) : (
                  <div className='prose prose-slate max-w-none dark:prose-invert'>
                    <Markdown
                      components={{
                        ol: ({ node, ...props }) => <ol className='list-decimal list-inside space-y-2 text-foreground' {...props} />,
                        li: ({ node, ...props }) => <li className='py-2 px-4 bg-secondary/30 rounded-lg hover:bg-secondary transition cursor-pointer text-base leading-relaxed border border-transparent hover:border-border' {...props} />,
                        p: ({ node, ...props }) => <p className='mb-2 text-muted-foreground' {...props} />
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