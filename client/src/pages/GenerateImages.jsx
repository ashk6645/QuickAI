import { Image, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { ActionButtons } from '../components/ActionButtons';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = [
    'Realistic', 'Ghibli style', 'Cartoon', 'Fantasy style', 'Portrait Style', '3D Style', 'Pencil Sketch'
  ]

  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const prompt = `Generate an image of ${input} in the style of ${selectedStyle}`
      const { data } = await axios.post('/api/ai/generate-image', {
        prompt, publish
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
                  <Image className='w-5 h-5 text-primary' />
                </div>
                <h2 className='text-lg font-semibold text-foreground'>Image Configuration</h2>
              </div>

              <form onSubmit={onSubmitHandler} className='space-y-5 p-6'>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>Image Description</label>
                  <textarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    rows={4}
                    className='w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-foreground placeholder:text-muted-foreground resize-none'
                    placeholder='Describe what you want to see in the image...'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>Style</label>
                  <div className='flex flex-wrap gap-2'>
                    {imageStyle.map((item) => (
                      <button
                        type="button"
                        onClick={() => setSelectedStyle(item)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition ${selectedStyle === item
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'text-muted-foreground border-border hover:bg-secondary hover:text-foreground'}`}
                        key={item}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={(e) => setPublish(e.target.checked)}
                      checked={publish}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <span className='text-sm text-foreground'>Make this image public</span>
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
                      <Image className='w-5 h-5' />
                      Generate Image
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
                  <h2 className='text-lg font-semibold text-foreground'>Generated Image</h2>
                </div>
                {content && <ActionButtons content={content} type="image" filename={`quickai-image-${Date.now()}`} />}
              </div>

              <div className='flex-1 overflow-y-auto pr-2 pl-6 custom-scrollbar flex items-center justify-center bg-secondary/20 rounded-lg'>
                {!content ? (
                  <div className='h-full flex flex-col justify-center items-center text-center py-16 opacity-50'>
                    <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4'>
                      <Image className='w-8 h-8 text-muted-foreground' />
                    </div>
                    <p className='text-muted-foreground max-w-xs'>Enter a description and click "Generate Image" to get started</p>
                  </div>
                ) : (
                  <img src={content} alt="Generated content" className='max-w-full max-h-full rounded-lg object-contain shadow-sm' />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateImages