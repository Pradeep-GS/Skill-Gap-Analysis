import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import Toast from '../components/Toast.jsx'
import { getJobs, getCandidates, runAnalysis } from '../services/api.js'

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function Jobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState({}) // { [jobId]: candidateId }
  const [analyzingJobId, setAnalyzingJobId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const loadData = async () => {
    setLoading(true)
    try {
      const [jobsRes, candidatesRes] = await Promise.all([getJobs(), getCandidates()])
      setJobs(jobsRes.jobs || [])
      setCandidates(candidatesRes.candidates || [])
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAnalyze = async (jobId) => {
    const candidateId = selectedCandidate[jobId]
    if (!candidateId) {
      setToast({ message: 'Please select a candidate first.', type: 'error' })
      return
    }

    setAnalyzingJobId(jobId)
    try {
      const { analysis } = await runAnalysis(jobId, candidateId)
      localStorage.setItem('lastAnalysisId', analysis.id)
      localStorage.setItem('lastJobId', jobId)
      localStorage.setItem('lastCandidateId', candidateId)
      setToast({ message: 'Analysis complete! Redirecting to dashboard...', type: 'success' })
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setAnalyzingJobId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24">
        <Spinner label="Loading saved jobs..." size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-500">Saved Job Descriptions</h1>
          <p className="mt-1 text-sm text-secondary-500/70">
            Pick a candidate for any job below and run the AI skill gap analysis instantly.
          </p>
        </div>
        <button onClick={() => navigate('/upload-job')} className="btn-secondary">
          + Add New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-sm text-secondary-500/70">
            No jobs saved yet. Upload a job description to get started.
          </p>
          <button onClick={() => navigate('/upload-job')} className="btn-primary mt-5">
            Upload Job Description
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-500">{job.role_name}</h3>
                  <p className="text-sm text-secondary-500/70">{job.company_name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-secondary-500/50">
                    <span>Posted {formatDate(job.created_at)}</span>
                    {job.experience_required && <span>• {job.experience_required} experience</span>}
                    <span>• {job.required_skills?.length || 0} skills detected</span>
                  </div>
                </div>
              </div>

              {job.required_skills && job.required_skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.required_skills.slice(0, 12).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary-500/20 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.required_skills.length > 12 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-secondary-500/60">
                      +{job.required_skills.length - 12} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <select
                  value={selectedCandidate[job.id] || ''}
                  onChange={(e) =>
                    setSelectedCandidate((prev) => ({ ...prev, [job.id]: e.target.value }))
                  }
                  className="input-field !py-2 sm:w-64"
                >
                  <option value="">Select a candidate...</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAnalyze(job.id)}
                  disabled={analyzingJobId === job.id}
                  className="btn-primary !py-2"
                >
                  {analyzingJobId === job.id ? 'Analyzing...' : 'Analyze'}
                </button>

                {candidates.length === 0 && (
                  <span className="text-xs text-secondary-500/50">
                    No candidates yet —{' '}
                    <button
                      onClick={() => navigate('/upload-resume')}
                      className="font-medium text-primary-600 underline"
                    >
                      upload a resume
                    </button>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}
