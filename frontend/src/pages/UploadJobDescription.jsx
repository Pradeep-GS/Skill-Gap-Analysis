import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileDropzone from '../components/FileDropzone.jsx'
import Spinner from '../components/Spinner.jsx'
import Toast from '../components/Toast.jsx'
import { uploadJobDescription } from '../services/api.js'

const initialForm = {
  role_name: '',
  company_name: '',
  experience_required: '',
  job_description_text: '',
}

export default function UploadJobDescription() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [inputMode, setInputMode] = useState('text') // 'text' | 'pdf'
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileSelect = (selectedFile, error) => {
    if (error) {
      setToast({ message: error, type: 'error' })
      return
    }
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.role_name.trim() || !form.company_name.trim()) {
      setToast({ message: 'Role name and company name are required.', type: 'error' })
      return
    }

    if (inputMode === 'text' && !form.job_description_text.trim()) {
      setToast({ message: 'Please paste the job description text.', type: 'error' })
      return
    }

    if (inputMode === 'pdf' && !file) {
      setToast({ message: 'Please upload a PDF job description.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('role_name', form.role_name.trim())
      formData.append('company_name', form.company_name.trim())
      if (form.experience_required.trim()) {
        formData.append('experience_required', form.experience_required.trim())
      }
      if (inputMode === 'text') {
        formData.append('job_description_text', form.job_description_text.trim())
      } else {
        formData.append('file', file)
      }

      const data = await uploadJobDescription(formData)
      localStorage.setItem('lastJobId', data.job.id)
      setToast({ message: 'Job description uploaded successfully!', type: 'success' })
      setTimeout(() => navigate('/upload-resume'), 1000)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-bold text-secondary-500">Upload Job Description</h1>
      <p className="mt-2 text-sm text-secondary-500/70">
        Provide role details and either paste the JD text or upload a PDF.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label-text">Role Name</label>
            <input
              name="role_name"
              value={form.role_name}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Company Name</label>
            <input
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label-text">Experience Required (optional)</label>
          <input
            name="experience_required"
            value={form.experience_required}
            onChange={handleChange}
            placeholder="e.g. 2-4 years"
            className="input-field"
          />
        </div>

        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              inputMode === 'text' ? 'bg-white text-secondary-500 shadow-sm' : 'text-secondary-500/60'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setInputMode('pdf')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              inputMode === 'pdf' ? 'bg-white text-secondary-500 shadow-sm' : 'text-secondary-500/60'
            }`}
          >
            Upload PDF
          </button>
        </div>

        {inputMode === 'text' ? (
          <div>
            <label className="label-text">Job Description</label>
            <textarea
              name="job_description_text"
              value={form.job_description_text}
              onChange={handleChange}
              rows={8}
              placeholder="Paste the full job description here..."
              className="input-field resize-none"
            />
          </div>
        ) : (
          <FileDropzone file={file} onFileSelect={handleFileSelect} label="Job Description PDF" />
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Uploading...' : 'Submit Job Description'}
        </button>

        {loading && <Spinner label="Extracting skills with AI..." />}
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}
