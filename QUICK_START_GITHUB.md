# ⚡ Quick Start: GitHub + Vercel Deployment

## 🎯 Goal
Get your site live and shareable in 10 minutes!

---

## Step 1: Create GitHub Repository (2 min)

1. Go to [github.com](https://github.com) → Sign in
2. Click **"+"** → **"New repository"**
3. Name: `batik-thread`
4. **DO NOT** check "Add README" or ".gitignore"
5. Click **"Create repository"**
6. **Copy the repository URL** (looks like: `https://github.com/YOUR_USERNAME/batik-thread.git`)

---

## Step 2: Push Code to GitHub (3 min)

**Option A: Use the Script (Easiest)**
```powershell
cd C:\Dev\BatikThread
.\setup-github.ps1
```
(Enter your GitHub repository URL when prompted)

**Option B: Manual Commands**
```powershell
cd C:\Dev\BatikThread
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/batik-thread.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel (5 min)

1. **Go to [vercel.com](https://vercel.com)** → Sign up with GitHub
2. **Click "Add New Project"**
3. **Select your `batik-thread` repository** → Click "Import"
4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these 2 (required):
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://gbetxpvmtmnkbqtosjso.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4
     ```
   - Check all environments: Production, Preview, Development
5. **Click "Deploy"**
6. **Wait 2-3 minutes** ⏳

---

## Step 4: Get Your URLs! 🎉

After deployment, Vercel shows you:

- **🌐 Public Site:** `https://your-project.vercel.app`
- **🔐 Admin:** `https://your-project.vercel.app/admin`
  - Username: `admin`
  - Password: `batik2025`

**Share these URLs for testing!** 🚀

---

## 🔄 Making Updates Later

```powershell
cd C:\Dev\BatikThread
git add .
git commit -m "Your changes"
git push
```

Vercel auto-deploys! ✨

---

## 📖 Need More Details?

See `GITHUB_SETUP.md` for the complete guide.

---

## ✅ Done!

Your site is now:
- ✅ On GitHub (version controlled)
- ✅ Live on Vercel (shareable)
- ✅ Auto-deploying (updates automatically)

