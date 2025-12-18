# 🚀 Deploy from GitHub - Step by Step Guide

## Step 1: Initialize Git (if not already done)

```bash
cd C:\Dev\BatikThread
git init
```

## Step 2: Create .gitignore (Already Created ✅)

The `.gitignore` file is already set up to exclude:
- `node_modules/`
- `.next/`
- `.env` files
- Build files

## Step 3: Add All Files to Git

```bash
git add .
git commit -m "Initial commit - Batik & Thread e-commerce site"
```

## Step 4: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `batik-thread` (or any name you prefer)
4. Description: "Batik & Thread - Modern African Luxury E-commerce"
5. Choose: **Public** (for free) or **Private**
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click **"Create repository"**

## Step 5: Connect Local Repository to GitHub

GitHub will show you commands. Use these:

```bash
cd C:\Dev\BatikThread
git remote add origin https://github.com/YOUR_USERNAME/batik-thread.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 6: Deploy to Vercel from GitHub

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login (use GitHub for easiest setup)

2. **Import from GitHub:**
   - Click **"Add New Project"**
   - Click **"Import Git Repository"**
   - Select your `batik-thread` repository
   - Click **"Import"**

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add these:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     https://gbetxpvmtmnkbqtosjso.supabase.co
     
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4
     ```
   - (Optional) Add Gmail credentials if you want email:
     ```
     GMAIL_USER
     ddicservicellc@gmail.com
     
     GMAIL_PASS
     your_app_password
     ```

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Done! 🎉

## Step 7: Get Your Live URLs

After deployment, Vercel will show you:

- **🌐 Public Site:** `https://your-project.vercel.app`
- **🔐 Admin Dashboard:** `https://your-project.vercel.app/admin`
  - Login: `admin` / `batik2025`

## Step 8: Automatic Deployments (Bonus!)

Now whenever you push to GitHub:
- Vercel automatically detects changes
- Builds and deploys automatically
- You get a preview URL for each commit

## 🔄 Making Updates

After making changes:

```bash
cd C:\Dev\BatikThread
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically deploy the update! ✨

## 📋 Quick Command Reference

```bash
# Initial setup (one time)
cd C:\Dev\BatikThread
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/batik-thread.git
git push -u origin main

# Making updates (every time you change code)
git add .
git commit -m "Your update message"
git push
```

## ✅ That's It!

Your site is now:
- ✅ On GitHub (version controlled)
- ✅ Deployed to Vercel (live and shareable)
- ✅ Auto-deploying on every push

Share your URLs and start testing! 🚀

