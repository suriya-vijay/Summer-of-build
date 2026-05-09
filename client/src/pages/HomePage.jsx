import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/projects').then(r => r.json()).then(setProjects)
    fetch('/api/skills').then(r => r.json()).then(setSkills)
  }, [])

  const filteredProjects = projects.filter(p =>
    filter === 'all' ? true : p.status === filter
  )

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold font-mono text-primary">Suriya Builds</span>
            </div>
            <div className="flex space-x-8">
              <a href="#projects" className="text-gray-300 hover:text-primary transition-colors">Projects</a>
              <a href="#skills" className="text-gray-300 hover:text-primary transition-colors">Skills</a>
              <Link to="/admin/login" className="text-gray-400 hover:text-primary transition-colors text-sm">Admin</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Suriya <span className="text-primary animate-glow">Vijayakumar</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              An Ohio State student on a mission — building real projects, learning full-stack development, and documenting every step of the journey.
            </p>
            {stats && (
              <div className="flex flex-wrap justify-center gap-12 mt-12">
                <div className="text-center animate-slide-up">
                  <div className="text-5xl font-bold text-primary font-mono">{stats.projects.total}</div>
                  <div className="text-gray-400 mt-2">Projects Built</div>
                </div>
                <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="text-5xl font-bold text-primary font-mono">{stats.projects.completed}</div>
                  <div className="text-gray-400 mt-2">Completed</div>
                </div>
                <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="text-5xl font-bold text-primary font-mono">{stats.skills}</div>
                  <div className="text-gray-400 mt-2">Skills Learned</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Projects</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-primary text-dark-900' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-all ${filter === 'completed' ? 'bg-primary text-dark-900' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-4 py-2 rounded-lg transition-all ${filter === 'in-progress' ? 'bg-primary text-dark-900' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
              >
                In Progress
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div key={project.id} className="card group cursor-pointer">
                {project.cover_image_url && (
                  <div className="mb-4 -mx-6 -mt-6 h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                  {project.featured && <span className="text-primary text-xl">⭐</span>}
                </div>
                <p className="text-gray-400 mb-4 text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map(skill => (
                    <span key={skill.id} className="badge text-xs">
                      {skill.icon} {skill.name}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 text-sm">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      GitHub →
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Live Demo →
                    </a>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {project.status === 'completed' ? '✅ Completed' : '🚧 In Progress'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Skills & Technologies</h2>

          {['Frontend', 'Backend', 'Database', 'AI', 'Tools'].map(category => {
            const categorySkills = skills.filter(s => s.category === category)
            if (categorySkills.length === 0) return null

            return (
              <div key={category} className="mb-10">
                <h3 className="text-2xl font-semibold mb-6 text-primary">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {categorySkills.map(skill => (
                    <div key={skill.id} className="card text-center">
                      <div className="text-4xl mb-3">{skill.icon}</div>
                      <div className="font-semibold mb-2">{skill.name}</div>
                      <div className="flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < skill.proficiency ? 'bg-primary' : 'bg-dark-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Built with 💚 by Suriya Vijayakumar — Summer 2026
          </p>
          <p className="text-gray-500 text-sm mt-2">
            React • Node.js • Express • SQLite • Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}