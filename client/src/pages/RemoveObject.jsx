import { Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState('')
  const [object, setObject] = useState('')
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
      setLoading(true);
      if (object.split(' ').length > 1) {
        toast.error('Please enter only one object name');
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post("/api/ai/remove-image-object", formData, {
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
      toast.error(error.response?.data?.message || error.message);
    }
    setLoading(false);
  };

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
                <h2 className='text-lg font-semibold text-gray-900'>Upload Image</h2>
              </div>
              
              <form onSubmit={onSubmitHandler} className='space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Image File</label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Scissors className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">JPG, PNG (MAX. 5MB)</p>
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
                  <div className="flex justify-center">
                    <img src={preview} alt="Preview" className="h-40 rounded-lg object-contain" />
                  </div>
                )}
                
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Object to remove</label>
                  <input 
                    onChange={(e) => setObject(e.target.value)} 
                    value={object} 
                    type="text" 
                    className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition' 
                    placeholder='e.g. person, car, tree' 
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter only one object name</p>
                </div>
                
                <button 
                  type="submit"
                  disabled={loading || !input || !object} 
                  className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                  ) : (
                    <>
                      <Scissors className='w-5 h-5' />
                      Remove Object
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Output Section */}
          <div className='lg:col-span-2'>
            <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                  <Scissors className='w-5 h-5 text-gray-600' />
                </div>
                <h2 className='text-lg font-semibold text-gray-900'>Processed Image</h2>
              </div>
              
              <div className='h-[450px] overflow-auto flex items-center justify-center'>
                {!content ? (
                  <div className='flex flex-col justify-center items-center text-center py-16'>
                    <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                      <Scissors className='w-8 h-8 text-gray-400' />
                    </div>
                    <p className='text-gray-500 max-w-xs'>Upload an image and specify an object to remove</p>
                  </div>
                ) : (
                  <img src={content} alt="Processed content" className='max-h-full rounded-lg object-contain' />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemoveObject