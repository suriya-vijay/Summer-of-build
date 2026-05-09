import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/admin/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen">
      <nav className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/admin" className="flex items-center space-x-2">
                <span className="text-2xl">🔐</span>
                <span className="text-xl font-bold font-mono text-primary">Admin Panel</span>
              </Link>
              
              <div className="flex space-x-4">
                <Link 
                  to="/admin" 
                  className={`text-sm ${isActive('/admin') ? 'text-primary' : 'text-gray-400 hover:text-primary'} transition-colors`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/projects" 
                  className={`text-sm ${isActive('/admin/projects') ? 'text-primary' : 'text-gray-400 hover:text-primary'} transition-colors`}
                >
                  Projects
                </Link>
                <Link 
                  to="/admin/skills" 
                  className={`text-sm ${isActive('/admin/skills') ? 'text-primary' : 'text-gray-400 hover:text-primary'} transition-colors`}
                >
                  Skills
                </Link>
                <Link 
                  to="/admin/journal" 
                  className={`text-sm ${isActive('/admin/journal') ? 'text-primary' : 'text-gray-400 hover:text-primary'} transition-colors`}
                >
                  Journal
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                View Portfolio →
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
