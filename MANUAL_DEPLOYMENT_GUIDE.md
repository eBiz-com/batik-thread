# Manual Deployment Guide - Vercel Not Auto-Deploying

## Current Situation
- ✅ Latest commit: `e261a88` - "Fix Stripe imports with dynamic loading for server-side only"
- ❌ Vercel last deployed: `52DTkMDHU` (old deployment)
- ❌ Auto-deployment not working

## Solution: Manual Deployment

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com
2. Navigate to your project: **Batik & Thread** (or `batik-thread`)

### Step 2: Create Manual Deployment
1. Click on **"Deployments"** tab (top navigation)
2. Click the **"Create Deployment"** button (usually top right, purple button)
3. In the deployment dialog:
   - **Git Branch**: Select `main`
   - **Framework Preset**: Should auto-detect "Next.js"
   - **Root Directory**: Leave as `.` (default)
   - **Build Command**: Should show `npm run build` (default)
   - **Output Directory**: Should show `.next` (default)
4. Click **"Deploy"**

### Step 3: Monitor the Build
- Watch the build logs in real-time
- The build should:
  1. Install dependencies (including `stripe`)
  2. Run `npm run build`
  3. Deploy successfully

### Step 4: Verify Deployment
- Once deployment shows "Ready" (green checkmark)
- Click on the deployment to see details
- The commit hash should match: `e261a88`

## Alternative: Redeploy Latest

If "Create Deployment" doesn't work:

1. Go to **Deployments** tab
2. Find the latest deployment (even if it's old)
3. Click the **three dots (⋯)** menu on the right
4. Click **"Redeploy"**
5. Confirm by clicking **"Redeploy"** again

## Fix Auto-Deployment (For Future)

### Option 1: Reconnect Repository
1. Go to: **Settings** → **Git**
2. Click **"Disconnect"** next to the repository
3. Click **"Connect Git Repository"**
4. Select: `eBiz-com/batik-thread`
5. This will re-establish the webhook

### Option 2: Check GitHub Webhook
1. Go to: https://github.com/eBiz-com/batik-thread/settings/hooks
2. Look for a Vercel webhook
3. If missing or failed, Vercel auto-deploy won't work

### Option 3: Check Vercel Project Settings
1. Go to: **Settings** → **Git**
2. Verify:
   - **Production Branch**: Should be `main`
   - **Auto-deploy**: Should be enabled
   - **Repository**: Should show `eBiz-com/batik-thread`

## Quick Test After Deployment

Once deployed, test the Stripe integration:

1. Go to your live site
2. Add items to cart
3. Click checkout
4. You should be redirected to Stripe Checkout (not the demo payment page)
5. Use test card: `4242 4242 4242 4242`

## Troubleshooting

### If Manual Deployment Fails:
1. Check build logs for errors
2. Verify `STRIPE_SECRET_KEY` is set in environment variables
3. Try clearing build cache: **Settings** → **General** → **Clear Build Cache**

### If Build Succeeds But Site Doesn't Work:
1. Check that environment variables are set for **Production**
2. Verify Stripe keys are correct (test keys start with `sk_test_` and `pk_test_`)
3. Check browser console for errors

## Summary

**Immediate Action**: Manually create a deployment in Vercel dashboard
**Long-term Fix**: Reconnect the Git repository to restore auto-deployment

