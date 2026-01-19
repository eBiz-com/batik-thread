# Reconnect Vercel to GitHub - Step by Step

## 🎯 Problem Confirmed
**No webhook exists** = Vercel is not connected to GitHub
**Solution**: Reconnect Vercel to GitHub (this will create the webhook automatically)

## 📋 Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard

1. Open: **https://vercel.com/dashboard**
2. Sign in if needed
3. Find and click on your project: **"Batik's projects"** or **"batiks-projects-61ebfe3a"**

### Step 2: Go to Git Settings

1. In your project, click **"Settings"** (top navigation or left sidebar)
2. Click **"Git"** in the left sidebar under Settings

### Step 3: Check Current Status

You'll see one of these:

**Option A: "No Git repository connected"**
- ✅ This is what we expect
- Proceed to Step 4

**Option B: Shows a repository (maybe wrong one)**
- Click **"Disconnect"** button
- Confirm disconnection
- Then proceed to Step 4

**Option C: Already shows `eBiz-com/batik-thread`**
- If it shows the correct repo but no deployments, click **"Disconnect"** then reconnect
- This refreshes the connection

### Step 4: Connect GitHub Repository

1. Click the **"Connect Git Repository"** button (or **"Add Git Repository"**)
2. You'll see a list of Git providers
3. Click **"GitHub"** (or the GitHub logo)
4. **Authorization Screen**:
   - You may be asked to authorize Vercel
   - Click **"Authorize Vercel"** or **"Grant Access"**
   - This gives Vercel permission to access your repositories
   - This also creates/refreshes the token
5. **Select Repository**:
   - You'll see a list of your repositories
   - Find and click: **"batik-thread"** (under `eBiz-com` organization)
   - Or search for: `eBiz-com/batik-thread`
6. Click **"Import"** or **"Connect"**

### Step 5: Verify Settings

After connecting, you should see:

- ✅ **Repository**: `eBiz-com/batik-thread`
- ✅ **Production Branch**: `main` (should auto-detect)
- ✅ **Framework**: `Next.js` (should auto-detect)
- ✅ **Root Directory**: `./` (default)
- ✅ **Build Command**: `npm run build` (should auto-detect)
- ✅ **Output Directory**: `.next` (should auto-detect)

**If anything looks wrong**, you can edit it, but defaults should be correct.

### Step 6: Verify Webhook Was Created

1. Go back to GitHub: **https://github.com/eBiz-com/batik-thread/settings/hooks**
2. Refresh the page
3. You should now see a webhook with:
   - **URL**: Contains `vercel.com` or `hooks.vercel.com`
   - **Status**: Green checkmark (✅ Active)
   - **Events**: Should include `push`

### Step 7: Trigger First Deployment

After reconnecting, Vercel should automatically:
- Detect the latest commit
- Start a deployment

**If it doesn't auto-deploy within 1-2 minutes:**

**Option A: Manual Redeploy**
1. Go to Vercel → **Deployments** tab
2. Click **"..."** on any deployment
3. Click **"Redeploy"**
4. Turn OFF **"Use existing Build Cache"**
5. Click **"Redeploy"**

**Option B: Push Empty Commit**
Run these commands:
```bash
git commit --allow-empty -m "Trigger Vercel deployment after reconnection"
git push origin main
```

Wait 1-2 minutes, then check Vercel → Deployments

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Webhook appears in GitHub → Settings → Webhooks
2. ✅ Webhook shows "Active" status
3. ✅ New deployment appears in Vercel → Deployments
4. ✅ Deployment shows commit hash: `6a02966` or latest
5. ✅ Build starts automatically

## 🐛 Troubleshooting

### Issue: "Repository not found" in Vercel

**Cause**: Vercel doesn't have access to your GitHub organization

**Fix**:
1. When authorizing, make sure to grant access to **organizations**
2. Or go to GitHub → Settings → Applications → Authorized OAuth Apps
3. Find "Vercel" and click "Configure"
4. Grant access to `eBiz-com` organization

### Issue: "No repositories available"

**Cause**: Vercel doesn't have permission to see your repositories

**Fix**:
1. Go to GitHub → Settings → Applications → Authorized OAuth Apps
2. Find "Vercel"
3. Click "Revoke" to remove old permissions
4. Reconnect in Vercel (Step 4) - this will ask for fresh authorization
5. Make sure to grant all requested permissions

### Issue: Webhook created but deployments not triggering

**Fix**:
1. Check webhook events - should include `push`
2. Test by pushing a commit (see Step 7, Option B)
3. Check webhook "Recent Deliveries" for errors
4. If errors, reconnect again (Step 4)

## 🔗 Direct Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Git Settings**: https://vercel.com/[your-project]/settings/git
- **GitHub Webhooks**: https://github.com/eBiz-com/batik-thread/settings/hooks
- **GitHub OAuth Apps**: https://github.com/settings/applications

## 📝 Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Went to Settings → Git
- [ ] Clicked "Connect Git Repository"
- [ ] Authorized Vercel (if prompted)
- [ ] Selected `eBiz-com/batik-thread`
- [ ] Clicked "Import"
- [ ] Verified webhook appears in GitHub
- [ ] Checked Vercel → Deployments for new deployment

---

**After completing these steps, your webhook will be created and deployments should start automatically!**

