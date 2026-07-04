import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24">
        <Spinner label="Checking session..." size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'hr' ? '/upload-job' : '/jobs'} replace />
  }

  return children
}
