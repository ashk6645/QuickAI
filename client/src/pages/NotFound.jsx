import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4'>
      <div className='text-center max-w-md'>
        <div className='mb-8'>
          <div className='text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            404
          </div>
          <div className='mt-4 relative'>
            <Search className='w-16 h-16 text-gray-300 mx-auto animate-pulse' />
          </div>
        </div>
        
        <h1 className='text-3xl font-semibold text-gray-900 mb-3'>Page Not Found</h1>
        <p className='text-gray-600 mb-8'>
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        <div className='flex gap-4 justify-center flex-wrap'>
          <button
            onClick={() => navigate('/')}
            className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition'
          >
            <Home className='w-5 h-5' />
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition'
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound