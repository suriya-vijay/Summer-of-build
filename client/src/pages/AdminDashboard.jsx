import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(err => console.error('Failed to fetch stats:', err))
  }, [])

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your learning progress overview.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-gray-400 text-sm mb-2">Total Projects</div>
            <div className="text-4xl font-bold text-primary">{stats.projects.total}</div>
            <div className="text-sm text-gray-500 mt-2">
              {stats.projects.completed} completed, {stats.projects.inProgress} in progress
            </div>
          </div>

          <div className="card">
            <div className="text-gray-400 text-sm mb-2">Skills Acquired</div>
            <div className="text-4xl font-bold text-primary">{stats.skills}</div>
            <div className="text-sm text-gray-500 mt-2">Across 5 categories</div>
          </div>

          <div className="card">
            <div className="text-gray-400 text-sm mb-2">Journal Entries</div>
            <div className="text-4xl font-bold text-primary">{stats.journalEntries}</div>
            <div className="text-sm text-gray-500 mt-2">Learning documented</div>
          </div>

          <div className="card">
            <div className="text-gray-400 text-sm mb-2">Days Learning</div>
            <div className="text-4xl font-bold text-primary">{stats.daysSinceStart}</div>
            <div className="text-sm text-gray-500 mt-2">Since you started</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/projects" className="card hover:border-primary transition-all group">
          <div className="text-3xl mb-4">📁</div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Manage Projects</h2>
          <p className="text-gray-400 text-sm">Add, edit, or delete your projects</p>
        </Link>

        <Link to="/admin/skills" className="card hover:border-primary transition-all group">
          <div className="text-3xl mb-4">🎯</div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Manage Skills</h2>
          <p className="text-gray-400 text-sm">Track your skills and proficiency levels</p>
        </Link>

        <Link to="/admin/journal" className="card hover:border-primary transition-all group">
          <div className="text-3xl mb-4">📝</div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Manage Journal</h2>
          <p className="text-gray-400 text-sm">Write and edit your learning journal</p>
        </Link>
      </div>
    </AdminLayout>
  )
}
