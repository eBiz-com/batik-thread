# Reconnect Vercel Project After GitHub Settings Change

## What Happened
After changing GitHub settings, the Vercel project may have lost its connection. We need to reconnect it.

## Step-by-Step: Reconnect Project

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Look for project: **batik-thread**

### Step 2: If Project Still Exists
1. Click on **batik-thread** project
2. Go to **Settings** → **Git**
3. Click **"Connect Git Repository"** (or **"Disconnect"** then reconnect)
4. Select **GitHub**
5. Search for: `batik-thread`
6. Select: `eBiz-com/batik-thread`
7. Click **"Connect"** or **"Deploy"**

### Step 3: If Project Doesn't Exist
1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. Click **"Import Git Repository"**
4. Select **GitHub**
5. Search for: `batik-thread`
6. Select: `eBiz-com/batik-thread`
7. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
8. Click **"Deploy"**

### Step 4: Add Environment Variables (if needed)
After deployment starts:
1. Go to **Settings** → **Environment Variables**
2. Add any required variables from your `.env.local`

## Alternative: Use Vercel CLI

If web interface isn't working:

```bash
# Make sure you're in the project directory
cd "c:\Users\Dapo Satiregun\OneDrive\Desktop\Batik_Thread\Batik and Thread Website Development"

# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Link project (this will connect to existing or create new)
vercel link

# Deploy
vercel --prod
```

## What to Check
1. **Project exists?** - Look in Vercel dashboard
2. **Repository connected?** - Settings → Git should show the repo
3. **Deployments visible?** - Deployments tab should show new deployment

