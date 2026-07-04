import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
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
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/upload-job" element={<UploadJobDescription />} />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}
