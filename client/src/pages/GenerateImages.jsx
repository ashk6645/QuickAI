import { Image, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = [
    'Realistic', 'Cartoon', 'Ghibli style', 'Anime Style', 'Cartoon style', 'Fantasy style', '3D Style', 'Portrait Style'
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
    <div className='p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Input Card */}
        <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center'>
              <Sparkles className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>AI Image Generator</h1>
          </div>
          
          <form onSubmit={onSubmitHandler} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Describe your Image</label>
              <textarea 
                onChange={(e) => setInput(e.target.value)} 
                value={input} 
                rows={4} 
                className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition' 
                placeholder='Describe what you want to see in the image...' 
                required 
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Style</label>
              <div className='flex flex-wrap gap-2'>
                {imageStyle.map((item) => (
                  <button
                    type="button"
                    onClick={() => setSelectedStyle(item)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${selectedStyle === item 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
              <span className='text-sm text-gray-700'>Make this image public</span>
            </div>
            
            <button 
              disabled={loading} 
              className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition disabled:opacity-70'
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

        {/* Output Card */}
        <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
              <Image className='w-5 h-5 text-gray-600' />
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>Generated Images</h1>
          </div>
          
          {!content ? (
            <div className='flex-1 flex flex-col justify-center items-center text-center py-10'>
              <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                <Image className='w-8 h-8 text-gray-400' />
              </div>
              <p className='text-gray-500 max-w-xs'>Enter a description and click "Generate Image" to get started</p>
            </div>
          ) : (
            <div className='flex-1 flex items-center justify-center'>
              <img src={content} alt="Generated content" className='max-h-96 rounded-lg object-contain' />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenerateImages