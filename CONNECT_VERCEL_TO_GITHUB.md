# Connect Vercel to GitHub Repository

## Current Status
❌ Vercel project is NOT connected to GitHub
✅ Code is on GitHub: `eBiz-com/batik-thread`

## Step-by-Step: Connect Repository

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/dashboard
   - Select "Batik's projects" (your team/account)
   - Click on project: **"batik-thread"**

2. **Click "Connect Git Repository" Button**
   - You should see this button on the Overview page
   - Or go to: Settings → Git

3. **Select GitHub**
   - Click "GitHub" as your Git provider
   - If not logged in, you'll be asked to authorize Vercel

4. **Authorize Vercel (if needed)**
   - GitHub will ask you to authorize Vercel
   - Click "Authorize Vercel" or "Install Vercel"
   - Make sure to grant access to `eBiz-com` organization (if it's an org repo)
   - Or grant access to your personal account if it's your repo

5. **Select Repository**
   - Search for: `batik-thread`
   - Or select: `eBiz-com/batik-thread`
   - Click on it

6. **Configure Project Settings**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-fill)
   - **Output Directory**: `.next` (should auto-fill)
   - **Install Command**: `npm install` (should auto-fill)

7. **Environment Variables** (if needed)
   - Add any required environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Any other env vars from your `.env.local`

8. **Deploy**
   - Click "Deploy" button
   - Vercel will:
     - Clone the repository
     - Install dependencies
     - Build the project
     - Deploy to production

### Method 2: Via Project Settings

1. **Go to Project Settings**
   - Vercel Dashboard → batik-thread → **Settings**

2. **Click "Git" in left sidebar**

3. **Click "Connect Git Repository"**

4. **Follow steps 3-8 from Method 1 above**

## After Connection

Once connected:
- ✅ Vercel will auto-deploy on every push to `main` branch
- ✅ You'll see new deployments for each commit
- ✅ Latest commits (`11ca948`, `e843d21`) will be deployed

## Verify Connection

After connecting:
1. Go to **Settings → Git**
2. Should show:
   - **Repository**: `eBiz-com/batik-thread`
   - **Production Branch**: `main`
   - **Auto-deploy**: Enabled

## Troubleshooting

### If you can't find the repository:
- Make sure you're logged into the correct GitHub account
- If it's an organization repo (`eBiz-com`), make sure:
  - You have access to the organization
  - Vercel has access to the organization
  - You may need to install Vercel app for the organization

### If authorization fails:
1. Go to GitHub → Settings → Applications → Authorized OAuth Apps
2. Find "Vercel" and check permissions
3. Re-authorize if needed

### If deployment fails:
- Check build logs in Vercel
- Make sure all environment variables are set
- Check that `package.json` has correct build scripts

