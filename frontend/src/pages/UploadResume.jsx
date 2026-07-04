import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileDropzone from '../components/FileDropzone.jsx'
import Spinner from '../components/Spinner.jsx'
import Toast from '../components/Toast.jsx'
import { uploadResume, runAnalysis } from '../services/api.js'

export default function UploadResume() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('Uploading...')
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

    if (!name.trim() || !email.trim()) {
      setToast({ message: 'Name and email are required.', type: 'error' })
      return
    }
    if (!file) {
      setToast({ message: 'Please upload your resume as a PDF.', type: 'error' })
      return
    }

    const jobId = localStorage.getItem('lastJobId')
    if (!jobId) {
      setToast({ message: 'Please upload a job description first.', type: 'error' })
      setTimeout(() => navigate('/upload-job'), 1200)
      return
    }

    setLoading(true)
    try {
      setLoadingLabel('Parsing resume and extracting skills...')
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('email', email.trim())
      formData.append('file', file)

      const { candidate } = await uploadResume(formData)
      localStorage.setItem('lastCandidateId', candidate.id)

      setLoadingLabel('Running AI skill gap analysis...')
      const { analysis } = await runAnalysis(jobId, candidate.id)
      localStorage.setItem('lastAnalysisId', analysis.id)

      setToast({ message: 'Analysis complete! Redirecting to dashboard...', type: 'success' })
      setTimeout(() => navigate('/dashboard'), 1000)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-bold text-secondary-500">Upload Resume</h1>
      <p className="mt-2 text-sm text-secondary-500/70">
        Enter candidate details and upload the resume PDF to run the analysis.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        <div>
          <label className="label-text">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. priya@example.com"
            className="input-field"
          />
        </div>

        <FileDropzone file={file} onFileSelect={handleFileSelect} label="Resume PDF" />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Processing...' : 'Submit & Analyze'}
        </button>

        {loading && <Spinner label={loadingLabel} />}
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}
