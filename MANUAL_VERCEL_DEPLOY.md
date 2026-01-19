# Manual Vercel Deployment - Force Deploy Latest Code

## Issue
Vercel is connected but not auto-deploying on new commits.

## Solution: Manual Deployment

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Select project: **batik-thread**
3. Go to **"Deployments"** tab

### Step 2: Create New Deployment
1. Click **"Create Deployment"** button (top right, next to "Deployments" title)
2. In the modal that appears:
   - **Git Repository**: Select `eBiz-com/batik-thread`
   - **Branch**: Select `main`
   - **Commit**: Either:
     - Select "Latest" from dropdown, OR
     - Enter commit hash: `378a1bd` or `e843d21`
3. Click **"Deploy"** button
4. Wait 1-2 minutes for deployment to complete

### Step 3: Verify Deployment
After deployment:
- Check commit hash - should be `378a1bd` or `e843d21`
- Status should be "Ready" (green)
- Should show "Production" environment

## Alternative: Check Auto-Deploy Settings

If manual deployment works but auto-deploy doesn't:

1. Go to **Settings** → **Git**
2. Verify:
   - **Production Branch**: Should be `main`
   - **Auto-deploy**: Should be enabled (toggle ON)
3. If disabled, enable it and save

## Verify Latest Commits on GitHub

The latest commits should be:
- `378a1bd` - Test Vercel auto-deployment connection
- `11ca948` - Trigger Vercel deployment for stock reduction fix
- `e843d21` - Fix stock reduction: Include product id and size

If Vercel shows older commits, use "Create Deployment" to manually select the latest.

