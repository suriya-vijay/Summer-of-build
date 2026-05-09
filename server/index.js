import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, getDb, saveDatabase } from './db/schema.js';
import { seedDatabase } from './db/seed.js';

// Import routes
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import skillsRoutes from './routes/skills.js';
import journalRoutes from './routes/journal.js';

// Load environment variables
dotenv.config({ path: '../.env' });

if (!process.env.ADMIN_PASSWORD) {
  console.error('❌ ERROR: ADMIN_PASSWORD is not set in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not set in .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/journal', journalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Summer of Build API is running' });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    const db = getDb();

    const projectCount = db.exec('SELECT COUNT(*) as count FROM projects')[0]?.values[0][0] || 0;
    const completedProjects = db.exec("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'")[0]?.values[0][0] || 0;
    const skillCount = db.exec('SELECT COUNT(*) as count FROM skills')[0]?.values[0][0] || 0;
    const journalCount = db.exec('SELECT COUNT(*) as count FROM journal_entries')[0]?.values[0][0] || 0;

    const firstProjectResult = db.exec('SELECT MIN(start_date) as first_date FROM projects');
    let daysSinceStart = 0;
    const firstDate = firstProjectResult[0]?.values[0][0];
    if (firstDate) {
      const diffTime = Math.abs(new Date() - new Date(firstDate));
      daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      projects: {
        total: projectCount,
        completed: completedProjects,
        inProgress: projectCount - completedProjects
      },
      skills: skillCount,
      journalEntries: journalCount,
      daysSinceStart
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server after DB is ready
async function start() {
  await initializeDatabase();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 Summer of Build API is running!`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/stats\n`);
  });
}

start();