import { Check, Copy, Download } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'

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
      className={`flex items-center gap-2 px-3 py-1.5 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground hover:text-foreground ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className='w-4 h-4 text-green-500' />
          <span className='text-green-500'>Copied!</span>
        </>
      ) : (
        <>
          <Copy className='w-4 h-4' />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

export const DownloadButton = ({ content, filename, type = 'text', className = '' }) => {
  const handleDownload = () => {
    try {
      let downloadFilename = filename || `quickai-${Date.now()}`

      if (type === 'image') {
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

      // For text and markdown, generate PDF
      if (type === 'text' || type === 'markdown') {
        const doc = new jsPDF()

        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 20
        const maxLineWidth = pageWidth - (margin * 2)

        let cursorY = 20

        // Helper to add text and handle page breaks
        const addText = (text, fontSize = 12, isBold = false) => {
          doc.setFontSize(fontSize)
          doc.setFont("helvetica", isBold ? "bold" : "normal")

          const lines = doc.splitTextToSize(text, maxLineWidth)

          lines.forEach(line => {
            if (cursorY + fontSize / 2 > pageHeight - margin) {
              doc.addPage()
              cursorY = 20
            }
            doc.text(line, margin, cursorY)
            cursorY += (fontSize / 2) + 2 // Line height based on font size
          })

          cursorY += 2 // Extra spacing after block
        }

        const lines = content.split('\n')

        lines.forEach(line => {
          const trimmedLine = line.trim()

          if (!trimmedLine) {
            cursorY += 5 // Paragraph spacing
            return
          }

          // Handle Headers
          if (trimmedLine.startsWith('# ')) {
            addText(trimmedLine.replace(/^#\s+/, ''), 24, true)
          } else if (trimmedLine.startsWith('## ')) {
            addText(trimmedLine.replace(/^##\s+/, ''), 20, true)
          } else if (trimmedLine.startsWith('### ')) {
            addText(trimmedLine.replace(/^###\s+/, ''), 16, true)
          } else if (trimmedLine.startsWith('#### ')) {
            addText(trimmedLine.replace(/^####\s+/, ''), 14, true)
          }
          // Handle Bullets
          else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            // Clean bold syntax **text** to just text for now
            const cleanLine = trimmedLine.replace(/^[-*]\s+/, '• ').replace(/\*\*/g, '')
            addText(cleanLine, 12, false)
          }
          // Handle Numbered Lists
          else if (/^\d+\.\s/.test(trimmedLine)) {
            const cleanLine = trimmedLine.replace(/\*\*/g, '')
            addText(cleanLine, 12, false)
          }
          // Regular Text
          else {
            // Clean bold syntax **text** to just text
            const cleanLine = trimmedLine.replace(/\*\*/g, '')
            addText(cleanLine, 12, false)
          }
        })

        doc.save(downloadFilename + '.pdf')
        toast.success('PDF downloaded successfully!')
        return
      }

    } catch (error) {
      console.error(error)
      toast.error('Failed to download')
    }
  }

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium ${className}`}
      title="Download as PDF"
    >
      <Download className='w-4 h-4' />
      <span>Download PDF</span>
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