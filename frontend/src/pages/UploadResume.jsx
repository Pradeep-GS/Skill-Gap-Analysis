import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileDropzone from '../components/FileDropzone.jsx'
import Spinner from '../components/Spinner.jsx'
import Toast from '../components/Toast.jsx'
import { uploadResume } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function UploadResume() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const handleFileSelect = (selectedFile, error) => {
    if (error) {
      setToast({ message: error, type: 'error' })
      return
    }
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setToast({ message: 'Please upload your resume as a PDF.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await uploadResume(formData)
      setToast({ message: 'Resume uploaded! You can now analyze it against any job.', type: 'success' })
      setTimeout(() => navigate('/jobs'), 1000)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-bold text-secondary-500">Your Resume</h1>
      <p className="mt-2 text-sm text-secondary-500/70">
        Uploading a new resume replaces your previous one, {user?.name}. Once uploaded, head to{' '}
        <span className="font-medium text-primary-600">Jobs</span> to analyze it against any posting.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        <FileDropzone file={file} onFileSelect={handleFileSelect} label="Resume PDF" />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Processing...' : 'Upload Resume'}
        </button>

        {loading && <Spinner label="Parsing resume and extracting skills..." />}
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}
