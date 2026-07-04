import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Toast from '../components/Toast.jsx'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setToast({ message: 'All fields are required.', type: 'error' })
      return
    }
    if (form.password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const user = await register(form.name.trim(), form.email.trim(), form.password, form.role)
      navigate(user.role === 'hr' ? '/upload-job' : '/upload-resume')
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-bold text-secondary-500">Create your account</h1>
      <p className="mt-2 text-sm text-secondary-500/70">
        Sign up as an HR recruiter or as a candidate.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, role: 'candidate' }))}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              form.role === 'candidate' ? 'bg-white text-secondary-500 shadow-sm' : 'text-secondary-500/60'
            }`}
          >
            I'm a Candidate
          </button>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, role: 'hr' }))}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              form.role === 'hr' ? 'bg-white text-secondary-500 shadow-sm' : 'text-secondary-500/60'
            }`}
          >
            I'm an HR / Recruiter
          </button>
        </div>

        <div>
          <label className="label-text">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label-text">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-secondary-500/70">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600">
          Log in
        </Link>
      </p>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  )
}
