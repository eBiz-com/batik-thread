# 🚀 Deploy Your Site for Testing & Demo

## Quick Start (5 Minutes)

### Method 1: Vercel Web Interface (Easiest - No Code)

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login (use GitHub for easiest setup)

2. **Deploy:**
   - Click "Add New Project"
   - Drag & drop your `C:\Dev\BatikThread` folder
   - OR connect your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables:**
   - After deployment, go to Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://gbetxpvmtmnkbqtosjso.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4`
   - Click "Redeploy" after adding variables

4. **Get Your URLs:**
   - Public Site: `https://your-project.vercel.app`
   - Admin: `https://your-project.vercel.app/admin`

---

### Method 2: Vercel CLI (Command Line)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd C:\Dev\BatikThread
   vercel
   ```
   Follow the prompts!

3. **Add Environment Variables:**
   - Go to vercel.com dashboard
   - Settings → Environment Variables
   - Add the variables listed above

---

## 📋 Before Deploying

Make sure you've run these SQL scripts in Supabase:

1. ✅ `COMPLETE_DATABASE_SETUP.sql` - Creates all tables
2. ✅ `DISABLE_RLS_SIMPLE.sql` - Disables RLS (for testing)
3. ✅ `AUTO_FIX_PRODUCTS_TABLE.sql` - Fixes product table columns

---

## 🔗 Your URLs After Deployment

Once deployed, you'll get:

- **🌐 Public Website:** 
  - `https://your-project.vercel.app`
  - Share this for customers to browse and shop

- **🔐 Admin Dashboard:**
  - `https://your-project.vercel.app/admin`
  - Login: `admin` / `batik2025`
  - Share this for team/admin access

---

## 🎯 What You Can Share

### For Customers/Clients:
- Public website URL
- They can browse products, add to cart, checkout

### For Team/Admin:
- Admin dashboard URL
- Login credentials: `admin` / `batik2025`
- They can manage products, view orders, receipts

---

## 🔄 Updating Your Site

After making changes:

**If using Git:**
```bash
git add .
git commit -m "Update"
git push
```
Vercel auto-deploys on push!

**If not using Git:**
- Go to Vercel dashboard
- Click "Redeploy" or upload new files

---

## ✅ That's It!

Your site is now live and shareable! 🎉

For detailed instructions, see `DEPLOYMENT_GUIDE.md`

