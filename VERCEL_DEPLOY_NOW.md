# 🚀 Deploy to Vercel - Step by Step

Your code is now on GitHub! Let's deploy it to Vercel to get your live URLs.

## Step 1: Sign Up / Login to Vercel

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** or **"Log In"**
3. **Choose "Continue with GitHub"** (easiest option)
4. Authorize Vercel to access your GitHub account

## Step 2: Import Your Repository

1. In Vercel dashboard, click **"Add New Project"** (or "Import Project")
2. You'll see your GitHub repositories listed
3. Find **`eBiz-com/batik-thread`** and click **"Import"**

## Step 3: Configure Project

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** `Next.js` ✅
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

**Click "Deploy" to continue** (we'll add environment variables after)

## Step 4: Add Environment Variables (IMPORTANT!)

**Before the build completes**, or right after:

1. Click on your project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

### Variable 1:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://gbetxpvmtmnkbqtosjso.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Variable 2:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Variable 3 (Optional - for email receipts):
- **Name:** `GMAIL_USER`
- **Value:** `ddicservicellc@gmail.com`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Variable 4 (Optional - for email receipts):
- **Name:** `GMAIL_PASS`
- **Value:** `your_gmail_app_password` (if you have one)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

4. **Click "Save"** for each variable

## Step 5: Redeploy (if needed)

If you added environment variables after the first deployment:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

## Step 6: Get Your Live URLs! 🎉

After deployment completes, Vercel will show you:

- **🌐 Public Site:** `https://your-project-name.vercel.app`
- **🔐 Admin Dashboard:** `https://your-project-name.vercel.app/admin`
  - Username: `admin`
  - Password: `batik2025`

**Share these URLs for testing!** 🚀

---

## ✅ What Happens Next?

- ✅ Every time you push to GitHub, Vercel automatically deploys
- ✅ You get preview URLs for each commit
- ✅ Your site is live and shareable!

---

## 🔄 Making Updates

After making code changes:

```powershell
cd C:\Dev\BatikThread
git add .
git commit -m "Your update description"
git push
```

Vercel will automatically detect and deploy! ✨

