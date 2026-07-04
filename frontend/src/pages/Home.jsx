import { Link } from 'react-router-dom'

const steps = [
  {
    title: 'Upload Job Description',
    description: 'Recruiters upload a JD as a PDF or paste plain text describing the role.',
  },
  {
    title: 'Upload Resume',
    description: 'Candidates upload their resume as a PDF for instant parsing.',
  },
  {
    title: 'AI Skill Extraction',
    description: 'Groq-powered AI extracts technical and professional skills from both documents.',
  },
  {
    title: 'Gap Analysis Dashboard',
    description: 'See match score, missing skills, strengths, and a personalized learning roadmap.',
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <span className="mb-5 inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-600">
          AI-Powered Recruitment Intelligence
        </span>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-secondary-500 sm:text-5xl">
          Close the gap between{' '}
          <span className="text-primary-500">talent</span> and{' '}
          <span className="text-primary-500">opportunity</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-secondary-500/70 sm:text-lg">
          Skill Gap Analysis Agent compares job descriptions against candidate resumes using AI,
          revealing exactly what's missing — and generating a roadmap to close that gap.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary">
            Get Started — Sign Up
          </Link>
          <Link to="/login" className="btn-secondary">
            Log In
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-10 text-center text-2xl font-bold text-secondary-500">How it works</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step.title} className="card">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-500 text-sm font-bold text-primary-500">
                {idx + 1}
              </div>
              <h3 className="mb-1.5 font-semibold text-secondary-500">{step.title}</h3>
              <p className="text-sm text-secondary-500/70">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl bg-secondary-500 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to see the gap?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
            Run your first analysis in under two minutes — no setup required.
          </p>
          <Link to="/register" className="btn-primary mt-6 inline-flex">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
