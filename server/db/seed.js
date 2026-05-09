import { getDb, saveDatabase } from './schema.js';

export async function seedDatabase() {
  const db = getDb();

  // Check if data already exists
  const projectCount = db.exec('SELECT COUNT(*) as count FROM projects')[0]?.values[0][0] || 0;

  if (projectCount > 0) {
    console.log('📊 Database already has data, skipping seed');
    return;
  }

  console.log('🌱 Seeding database with example data...');

  const skillsData = [
    { name: 'React', category: 'Frontend', proficiency: 4, icon: '⚛️' },
    { name: 'JavaScript', category: 'Frontend', proficiency: 4, icon: '🟨' },
    { name: 'TypeScript', category: 'Frontend', proficiency: 3, icon: '🔷' },
    { name: 'Tailwind CSS', category: 'Frontend', proficiency: 4, icon: '🎨' },
    { name: 'Node.js', category: 'Backend', proficiency: 3, icon: '🟢' },
    { name: 'Express', category: 'Backend', proficiency: 3, icon: '🚂' },
    { name: 'REST APIs', category: 'Backend', proficiency: 4, icon: '🔌' },
    { name: 'SQLite', category: 'Database', proficiency: 3, icon: '💾' },
    { name: 'SQL', category: 'Database', proficiency: 3, icon: '🗄️' },
    { name: 'ChatGPT/Claude', category: 'AI', proficiency: 5, icon: '🤖' },
    { name: 'Git', category: 'Tools', proficiency: 4, icon: '📦' },
    { name: 'VS Code', category: 'Tools', proficiency: 5, icon: '💻' },
  ];

  const skillIds = {};
  for (const skill of skillsData) {
    db.run(
      'INSERT INTO skills (name, category, proficiency, icon) VALUES (?, ?, ?, ?)',
      [skill.name, skill.category, skill.proficiency, skill.icon]
    );
    const result = db.exec('SELECT last_insert_rowid() as id');
    skillIds[skill.name] = result[0].values[0][0];
  }

  const projectsData = [
    {
      title: 'Summer of Build Portfolio',
      description: 'A full-stack personal learning portfolio to track my development journey.',
      status: 'in-progress',
      start_date: '2026-05-01',
      end_date: null,
      github_url: 'https://github.com/yourusername/summer-of-build',
      live_url: null,
      cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      featured: 1,
      skills: ['React', 'Node.js', 'Express', 'SQLite', 'Tailwind CSS', 'REST APIs']
    },
    {
      title: 'Task Tracker CLI',
      description: 'A command-line task management tool built with Node.js.',
      status: 'completed',
      start_date: '2026-05-08',
      end_date: '2026-05-10',
      github_url: 'https://github.com/yourusername/task-tracker',
      live_url: null,
      cover_image_url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
      featured: 0,
      skills: ['Node.js', 'JavaScript', 'Git']
    },
    {
      title: 'Weather Dashboard',
      description: 'An interactive weather dashboard using public APIs.',
      status: 'completed',
      start_date: '2026-05-15',
      end_date: '2026-05-18',
      github_url: 'https://github.com/yourusername/weather-dashboard',
      live_url: null,
      cover_image_url: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800',
      featured: 1,
      skills: ['React', 'JavaScript', 'REST APIs', 'Tailwind CSS']
    }
  ];

  for (const project of projectsData) {
    db.run(
      'INSERT INTO projects (title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [project.title, project.description, project.status, project.start_date, project.end_date, project.github_url, project.live_url, project.cover_image_url, project.featured]
    );
    const result = db.exec('SELECT last_insert_rowid() as id');
    const projectId = result[0].values[0][0];

    for (const skillName of project.skills) {
      if (skillIds[skillName]) {
        db.run('INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)', [projectId, skillIds[skillName]]);
      }
    }
  }

  const journalData = [
    {
      title: 'Starting My Summer of Code',
      body: `# Day 1: The Journey Begins\n\nToday marks the start of my summer learning journey!`,
      date: '2026-05-01',
      project_id: null,
      tags: 'motivation,goals,start'
    },
    {
      title: 'Building the Portfolio App',
      body: `# Working on the Meta Project\n\nStarted building my portfolio app today.`,
      date: '2026-05-08',
      project_id: 1,
      tags: 'full-stack,database,learning'
    },
    {
      title: 'API Design Insights',
      body: `# Lessons in REST API Design\n\nSpent time thinking about API design today.`,
      date: '2026-05-15',
      project_id: null,
      tags: 'backend,api,best-practices'
    }
  ];

  for (const entry of journalData) {
    db.run(
      'INSERT INTO journal_entries (title, body, date, project_id, tags) VALUES (?, ?, ?, ?, ?)',
      [entry.title, entry.body, entry.date, entry.project_id, entry.tags]
    );
  }

  saveDatabase();

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${skillsData.length} skills`);
  console.log(`   - ${projectsData.length} projects`);
  console.log(`   - ${journalData.length} journal entries`);
}