# 🚀 Deploy Using Vercel CLI (Bypass Web Login)

Since the web login is redirecting, we'll deploy using the command line instead.

## Step 1: Login to Vercel via CLI

```powershell
cd C:\Dev\BatikThread
vercel login
```

This will:
- Open your browser for authentication
- Ask you to authorize
- Complete login in the terminal

## Step 2: Deploy Your Project

```powershell
cd C:\Dev\BatikThread
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time)
- **Project name?** → `batik-thread` (or press Enter for default)
- **Directory?** → `./` (press Enter)
- **Override settings?** → No (press Enter)

## Step 3: Add Environment Variables

After first deployment, add environment variables:

```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL
# When prompted, paste: https://gbetxpvmtmnkbqtosjso.supabase.co
# Select: Production, Preview, Development (all three)

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# When prompted, paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4
# Select: Production, Preview, Development (all three)
```

## Step 4: Redeploy with Environment Variables

```powershell
vercel --prod
```

## Step 5: Get Your URL

After deployment, Vercel will show you:
- **Preview URL:** `https://batik-thread-xxxxx.vercel.app`
- **Production URL:** `https://batik-thread.vercel.app` (after first deployment)

---

## Alternative: Deploy and Link to GitHub

If you want automatic deployments from GitHub:

```powershell
vercel link
```

This will:
- Ask to link to existing project or create new
- Connect to your GitHub repository
- Enable automatic deployments on push

---

## Quick Commands Reference

```powershell
# Login
vercel login

# Deploy (preview)
vercel

# Deploy (production)
vercel --prod

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Link to GitHub repo
vercel link
```

