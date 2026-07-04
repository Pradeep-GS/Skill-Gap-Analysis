import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Toast from '../components/Toast.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setToast({ message: 'Email and password are required.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      navigate(user.role === 'hr' ? '/upload-job' : '/jobs')
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-bold text-secondary-500">Welcome back</h1>
      <p className="mt-2 text-sm text-secondary-500/70">Log in to continue.</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5">
        <div>
          <label className="label-text">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-secondary-500/70">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600">
          Sign up
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
