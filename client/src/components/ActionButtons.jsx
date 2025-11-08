import { Check, Copy, Download } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export const CopyButton = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className='w-4 h-4 text-green-600' />
          <span className='text-sm text-green-600'>Copied!</span>
        </>
      ) : (
        <>
          <Copy className='w-4 h-4 text-gray-600' />
          <span className='text-sm text-gray-700'>Copy</span>
        </>
      )}
    </button>
  )
}

export const DownloadButton = ({ content, filename, type = 'text', className = '' }) => {
  const handleDownload = () => {
    try {
      let blob
      let downloadFilename = filename || `quickai-${Date.now()}`

      if (type === 'text') {
        blob = new Blob([content], { type: 'text/plain' })
        downloadFilename += '.txt'
      } else if (type === 'markdown') {
        blob = new Blob([content], { type: 'text/markdown' })
        downloadFilename += '.md'
      } else if (type === 'image') {
        // For image URLs, we'll fetch and download
        fetch(content)
          .then(res => res.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = downloadFilename + '.png'
            a.click()
            window.URL.revokeObjectURL(url)
            toast.success('Image downloaded!')
          })
          .catch(() => toast.error('Failed to download image'))
        return
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadFilename
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Downloaded successfully!')
    } catch {
      toast.error('Failed to download')
    }
  }

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition ${className}`}
      title="Download"
    >
      <Download className='w-4 h-4' />
      <span className='text-sm'>Download</span>
    </button>
  )
}

export const ActionButtons = ({ content, type = 'text', filename }) => {
  return (
    <div className='flex gap-2 flex-wrap'>
      {type !== 'image' && <CopyButton text={content} />}
      <DownloadButton content={content} type={type} filename={filename} />
    </div>
  )
}
