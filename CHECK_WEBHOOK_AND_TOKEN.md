# Check Webhook and Token Status - Step by Step

## 🔍 Where to Check GitHub Webhook

### Step 1: Check GitHub Webhooks

1. Go to your GitHub repository:
   **https://github.com/eBiz-com/batik-thread**

2. Click on **"Settings"** (top right of the repository page)

3. In the left sidebar, click **"Webhooks"**

4. Look for a webhook with:
   - **URL**: Contains `vercel.com` or `hooks.vercel.com`
   - **Status**: Should show a green checkmark (✅ Active)
   - **Recent Deliveries**: Should show recent push events

### Step 2: Check Webhook Status

**If you see a Vercel webhook:**

1. Click on the webhook to see details
2. Check **"Recent Deliveries"** tab
3. Look for recent pushes - should show:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed
   - ⏳ Pending = In progress

**If webhook shows errors:**
- Click on a failed delivery
- Check the "Response" tab for error message
- Common issues:
  - 401/403 = Token expired or invalid
  - 404 = Webhook URL changed
  - 500 = Vercel service issue

**If NO webhook exists:**
- Vercel is not connected to GitHub
- You need to reconnect (see Step 3)

## 🔑 Check Vercel Connection and Token

### Step 3: Check Vercel GitHub Integration

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard

2. Click on your project: **"Batik's projects"**

3. Go to **Settings** → **Git**

4. Check what you see:

   **Option A: Repository Connected**
   - Shows: `eBiz-com/batik-thread`
   - Production Branch: `main`
   - ✅ Connection is active
   - **If deployments not triggering**: Webhook might be broken (see Step 4)

   **Option B: No Repository Connected**
   - Shows: "No Git repository connected"
   - ❌ This is the problem!
   - **Solution**: Reconnect (see Step 5)

### Step 4: Test Webhook Manually

If webhook exists but not working:

1. In GitHub → Settings → Webhooks
2. Click on the Vercel webhook
3. Click **"Recent Deliveries"**
4. Click **"Redeliver"** on the latest push event
5. Check if it succeeds

**If redelivery fails:**
- Token might be expired
- Need to reconnect Vercel (Step 5)

### Step 5: Reconnect Vercel to GitHub

**This will refresh the token and recreate the webhook:**

1. In **Vercel** → **Settings** → **Git**
2. If repository is connected, click **"Disconnect"**
3. Click **"Connect Git Repository"**
4. Select **"GitHub"**
5. You'll be asked to authorize Vercel:
   - Click **"Authorize Vercel"** or **"Grant Access"**
   - This refreshes the token
6. Select repository: **eBiz-com/batik-thread**
7. Click **"Import"** or **"Connect"**
8. Verify settings:
   - Production Branch: `main`
   - Framework: `Next.js`
   - Build Command: `npm run build`

**After reconnecting:**
- Vercel will create a new webhook automatically
- Token will be refreshed
- Check GitHub → Settings → Webhooks to see the new webhook

## 🔄 Force a Deployment After Reconnecting

After reconnecting, trigger a deployment:

### Option 1: Push Empty Commit (Recommended)

```bash
git commit --allow-empty -m "Trigger Vercel deployment after reconnection"
git push origin main
```

Wait 1-2 minutes, then check Vercel dashboard.

### Option 2: Manual Redeploy in Vercel

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** on any deployment
3. Select **"Redeploy"**
4. Turn OFF **"Use existing Build Cache"**
5. Click **"Redeploy"**

## 🐛 Common Issues and Solutions

### Issue: "Webhook not found" in GitHub

**Cause**: Vercel never created the webhook or it was deleted

**Fix**: Reconnect Vercel to GitHub (Step 5)

### Issue: "Webhook shows 401 Unauthorized"

**Cause**: Token expired or invalid

**Fix**: Reconnect Vercel to GitHub (Step 5) - this refreshes the token

### Issue: "Webhook shows 404 Not Found"

**Cause**: Vercel project URL changed or webhook URL is wrong

**Fix**: Reconnect Vercel to GitHub (Step 5)

### Issue: "Webhook exists but no deployments trigger"

**Possible causes:**
1. Webhook is listening to wrong branch
2. Webhook events not configured correctly
3. Vercel project settings issue

**Fix**: 
1. Check webhook events - should include `push`
2. Check Vercel → Settings → Git → Production Branch = `main`
3. Reconnect if needed (Step 5)

## 📋 Quick Checklist

- [ ] Checked GitHub → Settings → Webhooks
- [ ] Found Vercel webhook (or confirmed it's missing)
- [ ] Checked webhook status (Active/Inactive)
- [ ] Checked Recent Deliveries for errors
- [ ] Checked Vercel → Settings → Git for connection
- [ ] Reconnected Vercel if needed
- [ ] Triggered test deployment
- [ ] Verified new deployment appears in Vercel

## 🔗 Direct Links

- **GitHub Webhooks**: https://github.com/eBiz-com/batik-thread/settings/hooks
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Project Settings**: https://vercel.com/[your-project]/settings/git
- **GitHub OAuth Apps**: https://github.com/settings/applications

## 💡 Pro Tip

**If webhook is broken and reconnecting doesn't work:**

1. Go to GitHub → Settings → Applications → Authorized OAuth Apps
2. Find "Vercel"
3. Click "Revoke" to remove old permissions
4. Reconnect in Vercel (this will ask for fresh authorization)
5. This ensures a completely fresh token and webhook

---

**Next Step**: Follow Step 1-5 above, then check if deployments start appearing in Vercel.

