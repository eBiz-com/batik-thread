# Reconnect Vercel to GitHub - Step by Step Guide

## Problem
Vercel is not detecting new commits from GitHub, causing deployments to fail or not trigger automatically.

## Solution: Reconnect GitHub Integration

### Step 1: Disconnect Current Connection (if needed)

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **"Batik's projects"** or **"batiks-projects-61ebfe3a"**
3. Go to **Settings** → **Git**
4. If you see a connected repository, click **"Disconnect"** or **"Remove"**
5. Confirm the disconnection

### Step 2: Reconnect via GitHub Integration

**Option A: From Project Settings (Recommended)**

1. In your project, go to **Settings** → **Git**
2. Click **"Connect Git Repository"** or **"Add Git Repository"**
3. You'll be redirected to GitHub to authorize Vercel
4. Select the repository: **eBiz-com/batik-thread**
5. Choose the branch: **main**
6. Click **"Connect"** or **"Import"**

**Option B: From Vercel Dashboard**

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **"GitHub"** as your Git provider
5. Authorize Vercel if prompted
6. Find and select: **eBiz-com/batik-thread**
7. Click **"Import"**
8. Configure:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `.next` (should auto-detect)
9. Click **"Deploy"**

### Step 3: Verify Connection

1. After connecting, go to **Settings** → **Git**
2. You should see:
   - **Repository**: `eBiz-com/batik-thread`
   - **Production Branch**: `main`
   - **Deploy Hooks**: Should show webhook URL

### Step 4: Test Auto-Deployment

1. Make a small change to any file (or use the existing commits)
2. Push to GitHub:
   ```bash
   git push origin main
   ```
3. Go to Vercel Dashboard → **Deployments**
4. Within 1-2 minutes, you should see a new deployment automatically start

### Step 5: Verify GitHub Webhook (if auto-deploy still doesn't work)

1. Go to your GitHub repository: https://github.com/eBiz-com/batik-thread
2. Go to **Settings** → **Webhooks**
3. Look for a webhook from Vercel (should have `vercel.com` in the URL)
4. If missing, Vercel should create it automatically, but you can check:
   - Click on the webhook
   - Check "Recent Deliveries" to see if it's receiving events
   - If it shows errors, you may need to reconnect

## Alternative: Manual Deployment (Temporary Solution)

If auto-deployment still doesn't work:

1. Go to Vercel Dashboard → **Deployments**
2. Click on any deployment
3. Click **"..."** (three dots) → **"Redeploy"**
4. Select **"Use existing Build Cache"** = OFF (to force fresh build)
5. Click **"Redeploy"**

## Troubleshooting

### Issue: "Repository not found" or "Access denied"
- **Solution**: Make sure you authorized Vercel to access your GitHub account
- Go to GitHub → Settings → Applications → Authorized OAuth Apps
- Find "Vercel" and ensure it has access to your repositories

### Issue: Deployments not triggering
- **Solution**: Check GitHub webhook is active
- Go to GitHub repo → Settings → Webhooks
- Ensure Vercel webhook is there and shows "Active" status

### Issue: Wrong branch deploying
- **Solution**: Check Vercel project settings
- Go to Settings → Git → Production Branch
- Ensure it's set to `main`

## Current Status

✅ All TypeScript errors have been fixed
✅ Code is pushed to GitHub (commit: f3fcebf)
✅ Git remote is configured correctly (without token)

**Next Step**: Reconnect Vercel to GitHub using the steps above.

