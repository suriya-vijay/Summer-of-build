 Summer of Build - Personal Learning Portfolio

A full-stack portfolio application to track your development journey, showcase projects, document skills, and maintain a learning journal. Perfect for developers building their portfolio while learning!

##  Features

### Public Portfolio Mode
- **Hero Section** with animated stats (projects built, skills learned, days of learning)
- **Projects Gallery** with filtering by status, featuring project cards with tech stack badges
- **Skills Dashboard** organized by category with proficiency levels
- **Learning Journal** with markdown support, tags, and project linking
- **Timeline View** showing your chronological learning journey
- Fully responsive, mobile-friendly dark theme with smooth animations

### Admin Panel (Password Protected)
- **Dashboard** with quick stats overview
- **Project Management** - Create, edit, delete projects with skill linking
- **Skills Management** - Track proficiency levels across 5 categories
- **Journal Management** - Write markdown entries with tag support
- JWT-based authentication

##  Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3) - no setup required!
- **Auth:** JWT tokens with secure password protection
- **Markdown:** react-markdown for journal rendering

##  Project Structure

```
summerportfolio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   ├── components/    # Reusable components
│   │   ├── App.jsx        # Main app with routing
│   │   └── index.css      # Tailwind styles
│   └── package.json
├── server/                 # Express backend
│   ├── db/
│   │   ├── schema.js      # Database schema
│   │   └── seed.js        # Seed data
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── index.js           # Server entry
├── .env                    # Environment variables
└── package.json           # Root package with scripts
```

##  Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd summerportfolio
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   This installs dependencies for root, server, and client.

3. **Configure environment variables:**
   
   The `.env` file is already created with default values. **IMPORTANT: Change the password!**
   
   ```env
   ADMIN_PASSWORD=your-secure-password-here
   PORT=3001
   JWT_SECRET=your-very-long-random-secret-key
   NODE_ENV=development
   ```

4. **Start the application:**
   ```bash
 **  npm run dev**
   ```
   
   This runs both the backend (port 3001) and frontend (port 5173) concurrently.

5. **Access the application:**
   - **Portfolio (Public):** http://localhost:5173
   - **Admin Panel:** http://localhost:5173/admin/login
   - **API:** http://localhost:3001/api

##  Admin Access

1. Navigate to http://localhost:5173/admin/login
2. Enter the password you set in `.env` 
3. You'll be redirected to the admin dashboard

##  Usage Guide

### Adding Projects
1. Go to Admin → Projects
2. Click "+ Add Project"
3. Fill in project details:
   - Title, description, dates
   - GitHub/Live URLs
   - Cover image URL (use Unsplash for free images)
   - Select skills used
   - Mark as featured (optional)

### Managing Skills
1. Go to Admin → Skills
2. Add skills with:
   - Name and category
   - Emoji/icon (e.g., ⚛️ for React)
   - Proficiency level (1-5)

### Writing Journal Entries
1. Go to Admin → Journal
2. Write entries in Markdown:
   ```markdown
   # Today I Learned
   
   ## Key Takeaways:
   - Point 1
   - Point 2
   
   ### Code Example:
   \`\`\`js
   const example = "code";
   \`\`\`
   ```
3. Add tags (comma-separated)
4. Link to a project (optional)

##  Customization

### Change the App Name
The app is currently called "Suriya Builds" - you can rename it:

1. **Frontend:** Edit `client/src/pages/HomePage.jsx` and search for "Suriya Builds"
2. **Title:** Edit `client/index.html` - change the `<title>` tag
3. **Package:** Edit `package.json` files to update the name field

### Change the Color Scheme
The app uses a lime green (`#00ff88`) accent color. To change it:

1. Open `client/tailwind.config.js`
2. Update the `primary` color under `theme.extend.colors`
3. Choose from: cyan (`#00d9ff`), orange (`#ff6b35`), purple (`#a855f7`), etc.

### Customize the Hero Message
Edit `client/src/pages/HomePage.jsx` - find the hero section and update the headline and tagline.

##  Database

The SQLite database is automatically created at `server/db/portfolio.db` on first run. It includes:

- **Projects** with many-to-many relationship to skills
- **Skills** organized by category

### Seed Data
The app includes example data to get you started:
- 3 sample projects
- 12 skills across 5 categories
- 3 journal entries

To reset the database, simply delete `server/db/portfolio.db` and restart the server.

##  GitHub Setup

### Initial Setup
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Summer of Build portfolio"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/summer-of-build.git

# Push to GitHub
git push -u origin main
```

##  Development!!

### Run Backend Only
```bash
npm run server
```

### Run Frontend Only
```bash
npm run client
```

### API Endpoints
- `GET /api/stats` - Dashboard statistics
- `GET /api/projects` - All projects
- `POST /api/projects` - Create project (auth required)
- `PUT /api/projects/:id` - Update project (auth required)
- `DELETE /api/projects/:id` - Delete project (auth required)
- Similar endpoints for `/api/skills` and `/api/journal`
- `POST /api/auth/login` - Admin login

##  Troubleshooting!!

### Port Already in Use
If port 3001 or 5173 is busy, change them:
- Backend: Edit `PORT` in `.env`
- Frontend: Edit `server.port` in `client/vite.config.js`

### Database Errors
Delete `server/db/portfolio.db` and restart to recreate with seed data.

### Authentication Issues
1. Check that `.env` file exists in the root directory
2. Verify `JWT_SECRET` is set
3. Clear browser localStorage and login again

##  Credits

Built with:
- React + Vite
- Express.js
- SQLite & better-sqlite3
- Tailwind CSS
- React Router
- React Markdown

##  License

MIT License - Feel free to use this for your own learning portfolio!
