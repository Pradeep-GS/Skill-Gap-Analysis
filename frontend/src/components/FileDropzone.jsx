import { useCallback, useRef, useState } from 'react'

export default function FileDropzone({ file, onFileSelect, accept = '.pdf', label = 'Upload PDF' }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const validateAndSet = useCallback(
    (selectedFile) => {
      if (!selectedFile) return
      if (selectedFile.type !== 'application/pdf') {
        onFileSelect(null, 'Only PDF files are supported.')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        onFileSelect(null, 'File is too large. Maximum size is 10MB.')
        return
      }
      onFileSelect(selectedFile, null)
    },
    [onFileSelect]
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    validateAndSet(dropped)
  }

  const handleChange = (e) => {
    const selected = e.target.files?.[0]
    validateAndSet(selected)
  }

  return (
    <div>
      <label className="label-text">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-300 bg-slate-50 hover:border-primary-500/50 hover:bg-primary-50/40'
        }`}
      >
        <svg
          className="h-8 w-8 text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
          />
        </svg>
        {file ? (
          <p className="text-sm font-medium text-secondary-500">{file.name}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-secondary-500">
              Drag & drop your PDF here, or <span className="text-primary-500">browse</span>
            </p>
            <p className="text-xs text-slate-400">PDF only, up to 10MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
