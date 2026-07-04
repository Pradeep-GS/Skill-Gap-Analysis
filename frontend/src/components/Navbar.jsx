import { Link, NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors duration-150 ${
    isActive ? 'text-primary-500' : 'text-secondary-500/70 hover:text-secondary-500'
  }`

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-lg font-bold text-white">
            S
          </span>
          <span className="text-lg font-bold text-secondary-500">
            Skill<span className="text-primary-500">Gap</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/jobs" className={navLinkClass}>
            Jobs
          </NavLink>
          <NavLink to="/upload-job" className={navLinkClass}>
            Upload JD
          </NavLink>
          <NavLink to="/upload-resume" className={navLinkClass}>
            Upload Resume
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
        </div>

        <Link to="/upload-job" className="btn-primary hidden !py-2 !px-4 text-sm md:inline-flex">
          Get Started
        </Link>
      </nav>
    </header>
  )
}
