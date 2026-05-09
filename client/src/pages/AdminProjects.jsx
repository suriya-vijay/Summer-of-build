import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'in-progress', start_date: '',
    end_date: '', github_url: '', live_url: '', cover_image_url: '',
    featured: false, skill_ids: []
  })

  useEffect(() => {
    fetchProjects()
    fetchSkills()
  }, [])

  const fetchProjects = () => {
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }

  const fetchSkills = () => {
    fetch('/api/skills').then(r => r.json()).then(setSkills)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects'
    const method = editingProject ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      fetchProjects()
      resetForm()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    const token = localStorage.getItem('token')
    await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchProjects()
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date || '',
      github_url: project.github_url || '',
      live_url: project.live_url || '',
      cover_image_url: project.cover_image_url || '',
      featured: project.featured,
      skill_ids: project.skills.map(s => s.id)
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingProject(null)
    setFormData({
      title: '', description: '', status: 'in-progress', start_date: '',
      end_date: '', github_url: '', live_url: '', cover_image_url: '',
      featured: false, skill_ids: []
    })
  }

  const toggleSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skill_ids: prev.skill_ids.includes(skillId)
        ? prev.skill_ids.filter(id => id !== skillId)
        : [...prev.skill_ids, skillId]
    }))
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Projects</h1>
          <p className="text-gray-400">Add, edit, or delete your projects</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">{editingProject ? 'Edit Project' : 'New Project'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="input"
              >
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="textarea"
              rows="4"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={e => setFormData({...formData, github_url: e.target.value})}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Live URL</label>
              <input
                type="url"
                value={formData.live_url}
                onChange={e => setFormData({...formData, live_url: e.target.value})}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cover Image URL</label>
              <input
                type="url"
                value={formData.cover_image_url}
                onChange={e => setFormData({...formData, cover_image_url: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Skills Used</label>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    formData.skill_ids.includes(skill.id)
                      ? 'bg-primary text-dark-900'
                      : 'bg-dark-700 text-gray-300'
                  }`}
                >
                  {skill.icon} {skill.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => setFormData({...formData, featured: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Featured Project</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn-primary">
              {editingProject ? 'Update Project' : 'Create Project'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {projects.map(project => (
          <div key={project.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  {project.featured && <span className="text-primary">⭐</span>}
                  <span className={`text-xs px-2 py-1 rounded ${
                    project.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map(skill => (
                    <span key={skill.id} className="badge text-xs">
                      {skill.icon} {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(project)}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
