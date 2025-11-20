import React from 'react'

export const SkeletonCard = () => {
  return (
    <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <div className='h-3 bg-gray-200 rounded w-24 mb-2'></div>
          <div className='h-6 bg-gray-300 rounded w-16'></div>
        </div>
        <div className='w-12 h-12 rounded-lg bg-gray-200'></div>
      </div>
    </div>
  )
}

export const SkeletonCreationItem = () => {
  return (
    <div className='bg-gray-50 p-4 rounded-lg border border-gray-100 animate-pulse'>
      <div className='flex items-start gap-4'>
        <div className='w-12 h-12 rounded-lg bg-gray-200'></div>
        <div className='flex-1'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-3 bg-gray-200 rounded w-1/2 mb-2'></div>
          <div className='h-3 bg-gray-200 rounded w-1/4'></div>
        </div>
      </div>
    </div>
  )
}

export const SkeletonImage = () => {
  return (
    <div className='animate-pulse'>
      <div className='bg-gray-200 h-64 w-full rounded-lg'></div>
    </div>
  )
}

export const SkeletonText = ({ lines = 3 }) => {
  return (
    <div className='animate-pulse space-y-3'>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className='h-4 bg-gray-200 rounded' 
          style={{ width: `${100 - (i * 10)}%` }}
        ></div>
      ))}
    </div>
  )
}

export const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3'
  }
  
  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    primary: 'border-primary'
  }
  
  return (
    <span className={`${sizeClasses[size]} ${colorClasses[color]} border-t-transparent rounded-full animate-spin inline-block`}></span>
  )
}