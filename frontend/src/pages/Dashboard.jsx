import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Spinner from '../components/Spinner.jsx'
import Toast from '../components/Toast.jsx'
import { getAnalysis } from '../services/api.js'

const COLORS = ['#00C68D', '#e2e8f0']

const categoryStyles = {
  'Strong Match': 'bg-primary-50 text-primary-600 border-primary-500/30',
  'Moderate Match': 'bg-amber-50 text-amber-600 border-amber-500/30',
  'High Skill Gap': 'bg-red-50 text-red-600 border-red-500/30',
}

function SkillPills({ items, tone = 'positive' }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-secondary-500/50">None found.</p>
  }
  const toneClass =
    tone === 'positive'
      ? 'bg-primary-50 text-primary-600 border-primary-500/20'
      : 'bg-red-50 text-red-600 border-red-500/20'
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((skill) => (
        <span
          key={skill}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}
        >
          {skill}
        </span>
      ))}
    </div>
  )
}

function ListCard({ title, items, numbered = false }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold text-secondary-500">{title}</h3>
      {items && items.length > 0 ? (
        <ul className={`space-y-2 text-sm text-secondary-500/80 ${numbered ? 'list-decimal pl-5' : 'list-disc pl-5'}`}>
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-secondary-500/50">Nothing to show.</p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    const analysisId = localStorage.getItem('lastAnalysisId')
    if (!analysisId) {
      setLoading(false)
      return
    }

    getAnalysis(analysisId)
      .then((data) => setAnalysis(data.analysis))
      .catch((err) => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#f7f9fb' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
      pdf.save('skill-gap-analysis-report.pdf')
    } catch (err) {
      setToast({ message: 'Failed to generate PDF report.', type: 'error' })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24">
        <Spinner label="Loading dashboard..." size="lg" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h2 className="text-2xl font-bold text-secondary-500">No analysis found yet</h2>
        <p className="mt-2 text-sm text-secondary-500/70">
          Upload a job description and a resume to generate your first analysis.
        </p>
        <button onClick={() => navigate('/upload-job')} className="btn-primary mt-6">
          Start Analysis
        </button>
      </div>
    )
  }

  const pieData = [
    { name: 'Matched', value: analysis.matched_skills.length },
    { name: 'Missing', value: analysis.missing_skills.length },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-500">Skill Gap Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-500/70">
            AI-generated analysis of candidate fit against job requirements.
          </p>
        </div>
        <button onClick={handleDownloadPdf} disabled={exporting} className="btn-secondary">
          {exporting ? 'Preparing PDF...' : 'Download Report (PDF)'}
        </button>
      </div>

      <div ref={reportRef} className="mt-8 space-y-6 bg-[#f7f9fb] p-1">
        {/* Score summary */}
        <div className="card">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <div className="w-full sm:w-1/2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-500/70">Match Score</span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    categoryStyles[analysis.match_category] || ''
                  }`}
                >
                  {analysis.match_category}
                </span>
              </div>
              <div className="mt-3 text-4xl font-extrabold text-secondary-500">
                {analysis.match_score}%
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-700"
                  style={{ width: `${Math.min(analysis.match_score, 100)}%` }}
                />
              </div>
            </div>

            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Matched / Missing skills */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="card">
            <h3 className="mb-3 font-semibold text-secondary-500">Matched Skills</h3>
            <SkillPills items={analysis.matched_skills} tone="positive" />
          </div>
          <div className="card">
            <h3 className="mb-3 font-semibold text-secondary-500">Missing Skills</h3>
            <SkillPills items={analysis.missing_skills} tone="negative" />
          </div>
        </div>

        {/* Strengths / Weaknesses */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ListCard title="Strengths" items={analysis.strengths} />
          <ListCard title="Weaknesses" items={analysis.weaknesses} />
        </div>

        {/* Recommendations / Roadmap */}
        <ListCard title="Recommendations" items={analysis.recommendations} />
        <ListCard title="Learning Roadmap" items={analysis.roadmap} numbered />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}
