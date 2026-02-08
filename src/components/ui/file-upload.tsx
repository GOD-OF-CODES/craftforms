'use client'

import { InputHTMLAttributes, forwardRef, useState, useRef } from 'react'

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  maxSize?: number
  onFileSelect?: (files: FileList | null) => void
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ label, error, maxSize, onFileSelect, className = '', id, ...props }, ref) => {
    const [dragActive, setDragActive] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const uploadId = id || `file-upload-${Math.random().toString(36).substr(2, 9)}`

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
    }

    const handleFiles = (files: FileList) => {
      setSelectedFiles(files)
      onFileSelect?.(files)
      if (inputRef.current) {
        const dataTransfer = new DataTransfer()
        Array.from(files).forEach((file) => dataTransfer.items.add(file))
        inputRef.current.files = dataTransfer.files
      }
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={uploadId} className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${error ? 'border-error' : ''}
          `}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={(node) => {
              if (typeof ref === 'function') ref(node)
              else if (ref) ref.current = node
              // @ts-ignore
              inputRef.current = node
            }}
            type="file"
            id={uploadId}
            className="hidden"
            onChange={handleChange}
            {...props}
          />

          <svg
            className="mx-auto h-12 w-12 text-text-secondary"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mt-4">
            <p className="text-sm text-text-primary">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            {maxSize && (
              <p className="text-xs text-text-secondary mt-1">
                Max file size: {formatFileSize(maxSize)}
              </p>
            )}
          </div>
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {Array.from(selectedFiles).map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-surface border border-border"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg className="w-5 h-5 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{file.name}</p>
                    <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-error">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'

export default FileUpload
