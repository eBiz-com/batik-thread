# Deploy Latest Code to Vercel - Step by Step

## Method 1: Reconnect Repository (Easiest - No CLI Needed)

This will trigger a fresh deployment with latest code:

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Click on project: **batik-thread**

2. **Go to Settings → Git**
   - Click **"Settings"** tab (in navigation bar)
   - Click **"Git"** in the left sidebar

3. **Reconnect Repository**
   - Look for **"Disconnect"** button (if shown) - click it
   - OR look for **"Redeploy"** or **"Deploy Latest"** button
   - OR click **"Connect Git Repository"** again
   - Select `eBiz-com/batik-thread`
   - This will trigger a new deployment automatically

## Method 2: Use Vercel CLI (If Method 1 Doesn't Work)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
- This will open a browser window
- Authorize Vercel CLI

### Step 3: Deploy to Production
```bash
vercel --prod
```
- This will deploy the latest code from your current directory
- Make sure you're in the project directory first

## Method 3: Check Auto-Deploy Settings

1. **Go to Settings → Git**
2. **Check these settings**:
   - **Production Branch**: Should be `main`
   - **Auto-deploy**: Should be **enabled** (toggle ON)
3. **If auto-deploy is OFF**:
   - Turn it ON
   - Save
   - Push a new commit to trigger deployment

## Method 4: Click on a Deployment

1. **Go to Deployments tab**
2. **Click on any deployment** (opens details page)
3. **Look for buttons**:
   - **"Redeploy"** - redeploys same commit
   - **"Deploy Latest"** - might be here
   - **"..." menu** → might have deployment options

## What to Look For

After any method:
- Go to **Deployments** tab
- You should see a new deployment starting
- Commit should be `378a1bd` or `e843d21`
- Status: "Building" → "Ready"

## Verify Latest Code is Deployed

Once deployment is "Ready":
1. Check commit hash in deployment details
2. Should show: `378a1bd` or `e843d21`
3. Hard refresh your website
4. Test stock reduction - make a purchase

