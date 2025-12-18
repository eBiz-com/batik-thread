# 📦 GitHub Setup & Deployment Guide

This guide will help you push your project to GitHub and deploy it to Vercel.

## ✅ Prerequisites

- Git installed (✅ Already installed: version 2.52.0)
- GitHub account ([Sign up here](https://github.com/signup) if needed)
- Vercel account ([Sign up here](https://vercel.com/signup) - free, can use GitHub to sign in)

---

## 🚀 Step 1: Initialize Git Repository

**Already done!** ✅ Git repository initialized at `C:\Dev\BatikThread`

---

## 📝 Step 2: Create GitHub Repository

1. **Go to GitHub:**
   - Visit [github.com](https://github.com)
   - Sign in (or create account)

2. **Create New Repository:**
   - Click the **"+"** icon (top right) → **"New repository"**
   - Repository name: `batik-thread` (or any name you prefer)
   - Description: `Modern African Luxury E-commerce Website`
   - Choose: **Public** (free) or **Private**
   - ⚠️ **DO NOT** check "Add a README file" (we already have one)
   - ⚠️ **DO NOT** check "Add .gitignore" (we already have one)
   - ⚠️ **DO NOT** choose a license (unless you want one)
   - Click **"Create repository"**

3. **Copy the Repository URL:**
   - GitHub will show you a page with setup instructions
   - Copy the HTTPS URL (looks like: `https://github.com/YOUR_USERNAME/batik-thread.git`)
   - **Save this URL** - you'll need it in the next step

---

## 🔗 Step 3: Connect Local Repository to GitHub

Open PowerShell in the project directory and run:

```powershell
cd C:\Dev\BatikThread

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit - Batik & Thread e-commerce site"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/batik-thread.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If this is your first time using Git, you may need to set your identity:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 🌐 Step 4: Deploy to Vercel from GitHub

### 4.1 Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. **Choose "Continue with GitHub"** (easiest option)
4. Authorize Vercel to access your GitHub

### 4.2 Import Your Repository

1. In Vercel dashboard, click **"Add New Project"**
2. You'll see your GitHub repositories listed
3. Find `batik-thread` and click **"Import"**

### 4.3 Configure Project Settings

Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset:** `Next.js` ✅
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

### 4.4 Add Environment Variables

**IMPORTANT:** Add these environment variables in Vercel:

1. Click **"Environment Variables"** section
2. Add each variable:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://gbetxpvmtmnkbqtosjso.supabase.co`
   - Environment: `Production`, `Preview`, `Development` (check all)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4`
   - Environment: `Production`, `Preview`, `Development` (check all)

   **Variable 3 (Optional - for email receipts):**
   - Name: `GMAIL_USER`
   - Value: `ddicservicellc@gmail.com`
   - Environment: `Production`, `Preview`, `Development` (check all)

   **Variable 4 (Optional - for email receipts):**
   - Name: `GMAIL_PASS`
   - Value: `your_gmail_app_password` (get from Gmail settings)
   - Environment: `Production`, `Preview`, `Development` (check all)

### 4.5 Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. 🎉 **Done!** Your site is live!

---

## 🔗 Step 5: Get Your Live URLs

After deployment, Vercel will show you:

- **🌐 Public Site:** `https://your-project-name.vercel.app`
- **🔐 Admin Dashboard:** `https://your-project-name.vercel.app/admin`
  - Username: `admin`
  - Password: `batik2025`

**Share these URLs for testing!** 🚀

---

## 🔄 Step 6: Making Updates (Future Changes)

Whenever you make changes to your code:

```powershell
cd C:\Dev\BatikThread

# Stage changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

**Vercel will automatically:**
- ✅ Detect the push to GitHub
- ✅ Build your updated site
- ✅ Deploy the new version
- ✅ Update your live URLs

**No manual deployment needed!** 🎉

---

## 📋 Quick Command Reference

### First Time Setup (One Time Only)
```powershell
cd C:\Dev\BatikThread
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/batik-thread.git
git branch -M main
git push -u origin main
```

### Making Updates (Every Time)
```powershell
cd C:\Dev\BatikThread
git add .
git commit -m "Your update message"
git push
```

---

## 🆘 Troubleshooting

### "Permission denied" when pushing
- Make sure you're logged into GitHub
- Use GitHub Desktop app as alternative
- Or set up SSH keys (advanced)

### "Repository not found"
- Check that you created the repo on GitHub
- Verify the repository URL is correct
- Make sure you have access to the repository

### Build fails on Vercel
- Check that all environment variables are set
- Verify `package.json` has correct dependencies
- Check Vercel build logs for specific errors

### Site works locally but not on Vercel
- Make sure environment variables are set in Vercel
- Check that Supabase RLS policies allow public access
- Verify database tables exist in Supabase

---

## ✅ Checklist

- [ ] Git repository initialized
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables added
- [ ] Site deployed successfully
- [ ] Public URL tested
- [ ] Admin dashboard accessible

---

## 🎉 You're All Set!

Your site is now:
- ✅ Version controlled on GitHub
- ✅ Live on Vercel
- ✅ Auto-deploying on every push
- ✅ Ready to share with testers!

**Need help?** Check the Vercel dashboard logs or GitHub issues.

