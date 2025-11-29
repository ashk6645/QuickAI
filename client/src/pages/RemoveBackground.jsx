import { Eraser, Sparkles, Upload } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { ActionButtons } from '../components/ActionButtons';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState('')

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setInput(file)

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)

      const { data } = await axios.post('/api/ai/remove-image-background', formData, {
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
                  <Upload className='w-5 h-5 text-primary' />
                </div>
                <h2 className='text-lg font-semibold text-foreground'>Upload Image</h2>
              </div>

              <form onSubmit={onSubmitHandler} className='space-y-5 p-6'>
                <div>
                  <label className='block text-sm font-medium text-foreground mb-2'>Image File</label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG (MAX. 5MB)</p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        accept='image/*'
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>

                {preview && (
                  <div className="flex justify-center bg-secondary/30 p-2 rounded-lg border border-border">
                    <img src={preview} alt="Preview" className="h-40 rounded-lg object-contain" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !input}
                  className='w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20'
                >
                  {loading ? (
                    <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                  ) : (
                    <>
                      <Eraser className='w-5 h-5' />
                      Remove Background
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
                  <h2 className='text-lg font-semibold text-foreground'>Processed Image</h2>
                </div>
                {content && <ActionButtons content={content} type="image" filename={`removed-bg-${Date.now()}`} />}
              </div>

              <div className='flex-1 overflow-y-auto pr-2 pl-6 custom-scrollbar flex items-center justify-center bg-secondary/20 rounded-lg'>
                {!content ? (
                  <div className='h-full flex flex-col justify-center items-center text-center py-16 opacity-50'>
                    <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4'>
                      <Eraser className='w-8 h-8 text-muted-foreground' />
                    </div>
                    <p className='text-muted-foreground max-w-xs'>Upload an image and click "Remove Background" to get started</p>
                  </div>
                ) : (
                  <img src={content} alt="Processed content" className='max-w-full max-h-full rounded-lg object-contain shadow-sm' />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemoveBackground