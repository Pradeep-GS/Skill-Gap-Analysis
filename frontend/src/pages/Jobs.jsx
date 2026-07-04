import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner.jsx'
import Toast from '../components/Toast.jsx'
import { getJobs, getMyCandidateProfile, runAnalysis } from '../services/api.js'

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
  const [hasResume, setHasResume] = useState(true)
  const [analyzingJobId, setAnalyzingJobId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const loadData = async () => {
    setLoading(true)
    try {
      const jobsRes = await getJobs()
      setJobs(jobsRes.jobs || [])

      try {
        await getMyCandidateProfile()
        setHasResume(true)
      } catch {
        setHasResume(false)
      }
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
    if (!hasResume) {
      setToast({ message: 'Please upload your resume first.', type: 'error' })
      setTimeout(() => navigate('/upload-resume'), 1200)
      return
    }

    setAnalyzingJobId(jobId)
    try {
      const { analysis } = await runAnalysis(jobId)
      localStorage.setItem('lastAnalysisId', analysis.id)
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
        <Spinner label="Loading job postings..." size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-500">Job Postings</h1>
          <p className="mt-1 text-sm text-secondary-500/70">
            Browse open roles and run an instant AI skill gap analysis against your resume.
          </p>
        </div>
        <button onClick={() => navigate('/upload-resume')} className="btn-secondary">
          Manage My Resume
        </button>
      </div>

      {!hasResume && (
        <div className="card mt-6 border-amber-300 bg-amber-50">
          <p className="text-sm text-amber-700">
            You haven't uploaded a resume yet.{' '}
            <button
              onClick={() => navigate('/upload-resume')}
              className="font-semibold underline"
            >
              Upload it now
            </button>{' '}
            to start analyzing job matches.
          </p>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-sm text-secondary-500/70">No jobs have been posted yet. Check back soon!</p>
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

              <div className="mt-5 border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleAnalyze(job.id)}
                  disabled={analyzingJobId === job.id}
                  className="btn-primary !py-2"
                >
                  {analyzingJobId === job.id ? 'Analyzing...' : 'Analyze'}
                </button>
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
