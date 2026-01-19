# Connect Repository from Vercel Dashboard

## Connect from Vercel Side (Easier Method)

Instead of adding the repo in GitHub settings, connect it directly from Vercel:

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on project: **batik-thread**

### Step 2: Go to Settings → Git
1. Click **"Settings"** tab (in top navigation)
2. Click **"Git"** in the left sidebar

### Step 3: Connect Repository
1. You should see:
   - Current connection (if any)
   - OR **"Connect Git Repository"** button
2. Click **"Connect Git Repository"** (or **"Disconnect"** then reconnect)
3. Select **"GitHub"** as provider
4. If prompted, authorize Vercel
5. **Search for**: `batik-thread`
6. **Select**: `eBiz-com/batik-thread`
7. Click **"Connect"** or **"Deploy"**

### Step 4: Configure (if needed)
- Framework: Next.js (auto-detected)
- Root Directory: `./`
- Build Command: `npm run build`
- Click **"Deploy"**

### Step 5: Grant Access (if prompted)
If GitHub asks for permission:
- Click **"Authorize Vercel"**
- Select **"Only select repositories"** or **"All repositories"**
- Add `eBiz-com/batik-thread` to the list
- Click **"Install"** or **"Authorize"**

## This Will:
- ✅ Connect Vercel to `eBiz-com/batik-thread`
- ✅ Trigger a deployment with latest code
- ✅ Enable auto-deploy for future commits

## After Connection:
1. Go to **Deployments** tab
2. You should see a new deployment starting
3. Commit should be `378a1bd` or `e843d21`
4. Wait for "Ready" status

