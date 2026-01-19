# Fix Vercel Deployment - Deploy Latest Commits

## Problem
Vercel is redeploying old commits instead of the latest code with stock reduction fixes.

## Latest Commits on GitHub
- `11ca948` - Trigger Vercel deployment for stock reduction fix
- `e843d21` - Fix stock reduction: Include product id and size
- `20fe6ad` - Implement automatic stock management

## Solution: Manual Deployment

### Option 1: Create New Deployment (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select project**: `batik-thread`
3. **Click "Deployments" tab**
4. **Click "Create Deployment" button** (top right, next to "Deployments" title)
5. **Select**:
   - **Git Repository**: `eBiz-com/batik-thread`
   - **Branch**: `main`
   - **Commit**: Leave as "Latest" or select commit `11ca948`
6. **Click "Deploy"**
7. **Wait for deployment** (1-2 minutes)

### Option 2: Reconnect GitHub Integration

If Option 1 doesn't work:

1. **Go to Vercel Dashboard** → Your Project → **Settings**
2. **Click "Git"** in left sidebar
3. **Check current connection**:
   - Repository: Should be `eBiz-com/batik-thread`
   - Branch: Should be `main`
4. **If wrong or disconnected**:
   - Click **"Disconnect"** (if needed)
   - Click **"Connect Git Repository"**
   - Select `eBiz-com/batik-thread`
   - Authorize Vercel (if prompted)
   - Select branch: `main`
   - Enable "Auto-deploy"
   - Click **"Deploy"**

### Option 3: Use Vercel CLI (If you have it installed)

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from current directory
vercel --prod
```

## Verify Deployment

After deployment:
1. **Check deployment commit hash** - should be `11ca948` or `e843d21`
2. **Check build logs** - should show no errors
3. **Status should be "Ready"** (green)
4. **Test the website** - stock reduction should work

## No Token Needed

Vercel connects to GitHub via OAuth (not tokens). You just need to:
- Make sure Vercel has access to your GitHub account
- Make sure the repository is connected in Vercel settings

## Quick Check

To verify Vercel can see your latest commits:
1. Vercel Dashboard → Settings → Git
2. Click "View on GitHub" - should show latest commits
3. If commits are there but not deploying, use Option 1 above

