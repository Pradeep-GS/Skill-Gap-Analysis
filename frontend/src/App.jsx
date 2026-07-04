import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Jobs from './pages/Jobs.jsx'
import UploadJobDescription from './pages/UploadJobDescription.jsx'
import UploadResume from './pages/UploadResume.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-job"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <UploadJobDescription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-resume"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <UploadResume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
