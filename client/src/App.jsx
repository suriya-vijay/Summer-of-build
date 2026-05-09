import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProjects from './pages/AdminProjects'
import AdminSkills from './pages/AdminSkills'
import AdminJournal from './pages/AdminJournal'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setIsAuthenticated(data.valid)
          setIsLoading(false)
        })
        .catch(() => {
          localStorage.removeItem('token')
          setIsAuthenticated(false)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-primary text-xl">Loading...</div>
        </div>
      )
    }
    return isAuthenticated ? children : <Navigate to="/admin/login" />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/admin/login" 
          element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/projects" 
          element={
            <ProtectedRoute>
              <AdminProjects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/skills" 
          element={
            <ProtectedRoute>
              <AdminSkills />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/journal" 
          element={
            <ProtectedRoute>
              <AdminJournal />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
