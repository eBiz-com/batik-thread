# Troubleshoot Repository Connection Issue

## Problem
Repository `eBiz-com/batik-thread` is not showing up when trying to connect from Vercel.

## Possible Causes

### 1. Repository Name Mismatch
- Check if the repository name is exactly `batik-thread` (not `batik-and-thread`)
- Verify the organization is `eBiz-com`

### 2. Repository Visibility
- If the repository is **private**, Vercel needs explicit access
- Make sure Vercel GitHub app has access to private repositories

### 3. Organization Permissions
- If it's an organization repo, you need:
  - Admin access to the organization
  - Or organization owner needs to grant Vercel access

## Solutions

### Solution 1: Grant Access to All Repositories
1. Go to GitHub → Settings → Applications → Vercel
2. Select **"All repositories"** radio button
3. Click **"Save"**
4. Go back to Vercel and try connecting again

### Solution 2: Check Repository Exists
1. Go to: https://github.com/eBiz-com/batik-thread
2. Verify the repository exists and you have access
3. Check if it's private or public

### Solution 3: Use Vercel CLI Instead
If web interface doesn't work, use CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### Solution 4: Create New Project in Vercel
1. Go to Vercel Dashboard
2. Click **"Add New..."** → **"Project"**
3. Import from GitHub
4. Search for `batik-thread`
5. Select `eBiz-com/batik-thread`
6. Configure and deploy

## Verify Repository Name
Run this command to check the exact repository name:
```bash
git remote get-url origin
```

This will show the exact repository path.

