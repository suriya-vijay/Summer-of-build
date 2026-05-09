import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'

export default function AdminJournal() {
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [formData, setFormData] = useState({
    title: '', body: '', date: new Date().toISOString().split('T')[0],
    project_id: '', tags: ''
  })

  useEffect(() => {
    fetchEntries()
    fetchProjects()
  }, [])

  const fetchEntries = () => {
    fetch('/api/journal').then(r => r.json()).then(setEntries)
  }

  const fetchProjects = () => {
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingEntry ? `/api/journal/${editingEntry.id}` : '/api/journal'
    const method = editingEntry ? 'PUT' : 'POST'

    // Convert tags string to array
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        tags: tagsArray,
        project_id: formData.project_id || null
      })
    })

    if (response.ok) {
      fetchEntries()
      resetForm()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return
    const token = localStorage.getItem('token')
    await fetch(`/api/journal/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchEntries()
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      body: entry.body,
      date: entry.date,
      project_id: entry.project_id || '',
      tags: entry.tags.join(', ')
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingEntry(null)
    setFormData({
      title: '', body: '', date: new Date().toISOString().split('T')[0],
      project_id: '', tags: ''
    })
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Journal</h1>
          <p className="text-gray-400">Write and edit your learning journal</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">{editingEntry ? 'Edit Entry' : 'New Entry'}</h2>
          
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
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="input"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Content (Markdown supported) *</label>
            <textarea
              value={formData.body}
              onChange={e => setFormData({...formData, body: e.target.value})}
              className="textarea font-mono"
              rows="12"
              placeholder="# Heading

Write your journal entry here. Markdown is supported!

## What I learned:
- Point 1
- Point 2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Linked Project (optional)</label>
              <select
                value={formData.project_id}
                onChange={e => setFormData({...formData, project_id: e.target.value})}
                className="input"
              >
                <option value="">None</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="input"
                placeholder="e.g., learning, react, debugging"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn-primary">
              {editingEntry ? 'Update Entry' : 'Create Entry'}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{entry.title}</h3>
                  {entry.project_title && (
                    <span className="badge text-xs">🔗 {entry.project_title}</span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  {new Date(entry.date).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </div>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {entry.body.slice(0, 200)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-dark-700 text-gray-400 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(entry)}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
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
