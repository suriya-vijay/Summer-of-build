import { getDb } from './schema.js';

export async function seedDatabase() {
  const db = getDb();

  // Check if data already exists
  const { rows } = await db.query('SELECT COUNT(*) as count FROM skills');
  const skillCount = parseInt(rows[0].count);

  if (skillCount > 0) {
    console.log('📊 Database already has data, skipping seed');
    return;
  }

  console.log('🌱 Seeding database with example data...');

  const skillsData = [
    { name: 'React', category: 'Frontend', proficiency: 4, icon: '⚛️' },
    { name: 'JavaScript', category: 'Frontend', proficiency: 4, icon: '🟨' },
    { name: 'Tailwind CSS', category: 'Frontend', proficiency: 4, icon: '🎨' },
    { name: 'Node.js', category: 'Backend', proficiency: 3, icon: '🟢' },
    { name: 'Express', category: 'Backend', proficiency: 3, icon: '🚂' },
    { name: 'REST APIs', category: 'Backend', proficiency: 4, icon: '🔌' },
    { name: 'SQL', category: 'Database', proficiency: 3, icon: '🗄️' },
    { name: 'PostgreSQL', category: 'Database', proficiency: 2, icon: '🐘' },
    { name: 'Claude', category: 'AI', proficiency: 5, icon: '🤖' },
    { name: 'Git', category: 'Tools', proficiency: 3, icon: '📦' },
    { name: 'VS Code', category: 'Tools', proficiency: 5, icon: '💻' },
    { name: 'Vercel', category: 'Tools', proficiency: 3, icon: '▲' },
    { name: 'Render', category: 'Tools', proficiency: 2, icon: '🚀' },
  ];

  const skillIds = {};
  for (const skill of skillsData) {
    const result = await db.query(
      'INSERT INTO skills (name, category, proficiency, icon) VALUES ($1, $2, $3, $4) RETURNING id',
      [skill.name, skill.category, skill.proficiency, skill.icon]
    );
    skillIds[skill.name] = result.rows[0].id;
  }

  const projectsData = [
    {
      title: 'Suriya Builds Portfolio',
      description: 'A full-stack personal portfolio app to track projects and skills learned over the summer. Features a public portfolio page and password-protected admin panel.',
      status: 'in-progress',
      start_date: '2026-06-01',
      end_date: null,
      github_url: 'https://github.com/suriya-vijay/Summer-of-build',
      live_url: 'https://summer-of-build-wu3y.vercel.app',
      cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      featured: 1,
      skills: ['React', 'Node.js', 'Express', 'SQL', 'Tailwind CSS', 'REST APIs']
    }
  ];

  for (const project of projectsData) {
    const result = await db.query(
      'INSERT INTO projects (title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [project.title, project.description, project.status, project.start_date, project.end_date, project.github_url, project.live_url, project.cover_image_url, project.featured]
    );
    const projectId = result.rows[0].id;

    for (const skillName of project.skills) {
      if (skillIds[skillName]) {
        await db.query(
          'INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2)',
          [projectId, skillIds[skillName]]
        );
      }
    }
  }

  console.log('✅ Database seeded successfully!');
}