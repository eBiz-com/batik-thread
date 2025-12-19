# 🤖 Automation Setup Guide

## Automatic Deployments from GitHub

Once your project is deployed on Vercel, it automatically deploys on every push to GitHub!

### How It Works

1. **Push to GitHub:**
   ```powershell
   cd C:\Dev\BatikThread
   git add .
   git commit -m "Your update message"
   git push
   ```

2. **Vercel Automatically:**
   - ✅ Detects the push
   - ✅ Builds your project
   - ✅ Deploys the new version
   - ✅ Updates your live site

### No Additional Setup Needed!

If you imported your repository from GitHub, automatic deployments are **already enabled** by default!

---

## Verify Automation is Enabled

1. Go to your project on Vercel dashboard
2. Go to **Settings** → **Git**
3. You should see:
   - ✅ Production Branch: `main`
   - ✅ Automatic deployments enabled

---

## Deployment Types

### Production Deployments
- Triggered by pushes to `main` branch
- URL: `https://your-project.vercel.app`

### Preview Deployments
- Triggered by pushes to other branches
- URL: `https://your-project-git-branch.vercel.app`
- Great for testing before merging

### Pull Request Previews
- Automatically creates preview for each PR
- Test changes before merging
- Share preview URL with team

---

## Environment Variables

Environment variables are automatically used in all deployments:
- Production deployments
- Preview deployments
- Pull request previews

Make sure you've added:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Workflow Example

```powershell
# 1. Make changes to your code
# (edit files, add features, etc.)

# 2. Commit and push
cd C:\Dev\BatikThread
git add .
git commit -m "Added new feature"
git push

# 3. Vercel automatically:
#    - Detects the push
#    - Builds the project
#    - Deploys to production
#    - Your site is updated! ✨
```

---

## Disable Automatic Deployments (if needed)

If you want to deploy manually:

1. Go to **Settings** → **Git**
2. Toggle off **"Automatic deployments from Git"**
3. Deploy manually using: `vercel --prod`

---

## Branch Protection

To prevent accidental deployments:

1. Go to **Settings** → **Git**
2. Enable **"Production Branch Protection"**
3. Requires pull request approval before deploying

---

## Notification Settings

Get notified about deployments:

1. Go to **Settings** → **Notifications**
2. Enable:
   - Email notifications
   - Slack notifications (if connected)
   - GitHub commit status

---

## That's It!

Your automation is already set up! Just push to GitHub and Vercel handles the rest. 🚀

