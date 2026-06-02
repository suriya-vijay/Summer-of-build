import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import API_BASE from '../lib/api.js'

export default function AdminSkills() {
  const [skills, setSkills] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [formData, setFormData] = useState({
    name: '', category: 'Frontend', proficiency: 3, icon: ''
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = () => {
    fetch(`${API_BASE}/api/skills`).then(r => r.json()).then(setSkills)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingSkill ? `${API_BASE}/api/skills/${editingSkill.id}` : `${API_BASE}/api/skills`
    const method = editingSkill ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      fetchSkills()
      resetForm()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will remove the skill from all projects.')) return
    const token = localStorage.getItem('token')
    await fetch(`${API_BASE}/api/skills/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchSkills()
  }

  const handleEdit = (skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon: skill.icon || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingSkill(null)
    setFormData({ name: '', category: 'Frontend', proficiency: 3, icon: '' })
  }

  const categories = ['Frontend', 'Backend', 'Database', 'AI', 'Tools']

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Skills</h1>
          <p className="text-gray-400">Track your skills and proficiency levels</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Skill'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">{editingSkill ? 'Edit Skill' : 'New Skill'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Skill Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon/Emoji</label>
              <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="input" placeholder="e.g., ⚛️ 🟨 🔷" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Proficiency (1-5)</label>
              <input type="range" min="1" max="5" value={formData.proficiency} onChange={e => setFormData({...formData, proficiency: parseInt(e.target.value)})} className="w-full" />
              <div className="text-center text-primary font-bold text-xl mt-2">{formData.proficiency}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn-primary">{editingSkill ? 'Update Skill' : 'Create Skill'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {categories.map(category => {
        const categorySkills = skills.filter(s => s.category === category)
        if (categorySkills.length === 0) return null

        return (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map(skill => (
                <div key={skill.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <h3 className="font-bold">{skill.name}</h3>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < skill.proficiency ? 'bg-primary' : 'bg-dark-600'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(skill)} className="text-primary hover:text-primary/80 text-sm">Edit</button>
                      <button onClick={() => handleDelete(skill.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </AdminLayout>
  )
}