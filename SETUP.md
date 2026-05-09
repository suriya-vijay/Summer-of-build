# 🚀 Setup Instructions for Windows

Your Summer of Build portfolio app is ready! Follow these steps to get it running.

## PowerShell Execution Policy Issue

If you see errors about scripts being disabled, you need to allow script execution:

### Option 1: Run in Command Prompt (Recommended)
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project:
   ```cmd
   cd C:\summerportfolio
   ```
4. Continue with installation below

### Option 2: Enable PowerShell Scripts (One-time setup)
Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Installation Steps

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   
   This will install:
   - Root dependencies (concurrently)
   - Server dependencies (Express, SQLite, JWT, etc.)
   - Client dependencies (React, Vite, Tailwind, etc.)

2. **Update your password in `.env` file:**
   Open `.env` and change:
   ```
   ADMIN_PASSWORD=your-secure-password-here
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```
   
   This starts both:
   - Backend server on http://localhost:3001
   - Frontend on http://localhost:5173

4. **Open your browser:**
   - Public Portfolio: http://localhost:5173
   - Admin Login: http://localhost:5173/admin/login

## What Happens on First Run

✅ Database is automatically created at `server/db/portfolio.db`
✅ Sample data is seeded (3 projects, 12 skills, 3 journal entries)
✅ You can immediately start using the app!

## Troubleshooting

### "Cannot find module" errors
Make sure you ran `npm run install-all` in the root directory.

### Port already in use
Change the PORT in `.env` file or kill the process using that port.

### Database not creating
Make sure the `server/db` directory exists and you have write permissions.

## Next Steps

1. Login to admin panel with your password
2. Customize the example projects or add your own
3. Update skills and proficiency levels
4. Write your first journal entry
5. Customize the hero section in `client/src/pages/HomePage.jsx`
6. Change colors in `client/tailwind.config.js`

## GitHub Setup

Once everything works:

```bash
git init
git add .
git commit -m "Initial commit - Summer of Build portfolio"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## Need Help?

Check the main README.md for full documentation!

---

**You're all set! Happy building! 🎉**
