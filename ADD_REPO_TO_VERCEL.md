# Add batik-thread Repository to Vercel GitHub App

## Problem
Vercel GitHub app can only see `batik-and-thread` but needs access to `batik-thread` (the main app repository).

## Solution: Add Repository to Vercel App

### Step 1: Add Repository
1. **In the GitHub page you're on** (Vercel app settings)
2. **In the "Repository access" section**:
   - Make sure **"Only select repositories"** is selected (it is)
   - Click **"Select repositories"** button
   - In the search bar, type: `batik-thread`
   - OR scroll down to find `eBiz-com/batik-thread`
   - **Check the box** next to `eBiz-com/batik-thread`
   - Click **"Save"** button (green button at bottom)

### Step 2: Verify Both Repositories
After saving, you should see:
- ✅ `eBiz-com/batik-and-thread` (already there)
- ✅ `eBiz-com/batik-thread` (newly added)
- ✅ `batik-and-thread-receipt` (if needed)

### Step 3: Go Back to Vercel
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Go to project**: batik-thread
3. **Go to Settings → Git**
4. **Now you should be able to**:
   - See the repository connection
   - Or reconnect to `eBiz-com/batik-thread`
   - Trigger a deployment

### Step 4: Trigger Deployment
After adding the repository:
1. In Vercel → Settings → Git
2. Click **"Disconnect"** then **"Connect Git Repository"** again
3. Select `eBiz-com/batik-thread`
4. This will trigger a deployment with latest code

## Alternative: Select "All repositories"
If you want Vercel to have access to all repos:
1. Select **"All repositories"** radio button
2. Click **"Save"**
3. This gives Vercel access to all current and future repositories

