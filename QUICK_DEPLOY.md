# 🚀 Quick Deploy to Vercel (5 Minutes)

## Step-by-Step Guide

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub (easiest) or email

### 2. Deploy Your Project

**Option A: Via Web Interface (Easiest)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Browse" or drag & drop your `C:\Dev\BatikThread` folder
3. Click "Deploy"
4. Wait 2-3 minutes
5. Done! You'll get a URL like `https://your-project.vercel.app`

**Option B: Via GitHub (Recommended)**
1. Push your code to GitHub:
   ```bash
   cd C:\Dev\BatikThread
   git init
   git add .
   git commit -m "Initial commit"
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/batik-thread.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Click "Deploy"

### 3. Add Environment Variables

After first deployment:
1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add these:

```
NEXT_PUBLIC_SUPABASE_URL
https://gbetxpvmtmnkbqtosjso.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4
```

4. Click "Save"
5. Go to "Deployments" tab
6. Click "..." on latest deployment → "Redeploy"

### 4. Get Your URLs

After deployment, you'll see:
- **Public Site:** `https://your-project.vercel.app`
- **Admin:** `https://your-project.vercel.app/admin`

### 5. Share & Test!

✅ **Public Site URL** - Share with customers/clients
✅ **Admin URL** - Share with team (login: `admin` / `batik2025`)

---

## 🔧 Troubleshooting

**Build fails?**
- Check the build logs in Vercel dashboard
- Make sure `package.json` has all dependencies

**Site loads but database doesn't work?**
- Verify environment variables are set correctly
- Check Supabase dashboard - tables should exist
- Make sure RLS is disabled (run `DISABLE_RLS_SIMPLE.sql`)

**Need to update?**
- Just push to GitHub (if using Git)
- Or redeploy from Vercel dashboard

---

## 🎯 That's It!

Your site is now live and shareable! 🎉

