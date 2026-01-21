# Verify SUPABASE_SERVICE_ROLE_KEY is Set Correctly

## The Error
```
Admin operations not configured. Please set SUPABA…_SERVICE_ROLE_KEY environment variable in Vercel.
```

This means Vercel can't find the environment variable.

## Step-by-Step Fix

### Step 1: Verify in Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select your project: **batik-thread**
3. Go to **Settings** → **Environment Variables**
4. Look for: `SUPABASE_SERVICE_ROLE_KEY`
5. Check:
   - ✅ Name is EXACTLY: `SUPABASE_SERVICE_ROLE_KEY` (case-sensitive)
   - ✅ Value is the actual key from Supabase (long string starting with `eyJ...`)
   - ✅ Environment is set to **ALL** (Production, Preview, Development)

### Step 2: If It's Missing or Wrong
1. **Delete the old one** (if it exists with wrong name)
2. Click **"Add New"**
3. Enter:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY` (exactly this, no spaces, case-sensitive)
   - **Value:** Your service role key from Supabase
   - **Environment:** Select **ALL** (Production, Preview, Development)
4. Click **"Save"**

### Step 3: CRITICAL - Redeploy
**Environment variables only take effect after redeploy!**

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Select **"Redeploy"**
4. **IMPORTANT:** Turn OFF **"Use existing Build Cache"**
5. Click **"Redeploy"**
6. Wait for deployment to complete (2-3 minutes)

### Step 4: Verify It's Working
1. After redeploy completes, go to admin panel
2. Try deleting a custom request
3. Check browser console (F12)
4. Should see: "Delete API response status: 200" (not 500)

## Common Mistakes

❌ **Wrong name:**
- `SUPABASE_SERVICE_KEY` (missing `_ROLE`)
- `supabase_service_role_key` (wrong case)
- `SUPABASE_SERVICE_ROLE_KEY ` (extra space)

✅ **Correct name:**
- `SUPABASE_SERVICE_ROLE_KEY` (exactly this)

❌ **Not redeploying after adding**
- Environment variables only work after redeploy

❌ **Only added to one environment**
- Must add to ALL (Production, Preview, Development)

## How to Get Service Role Key

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find **"service_role"** key (NOT "anon" key)
5. Click **"Reveal"** to show it
6. Copy the entire key (very long string)

---

**After adding the variable and redeploying, deletion should work!**

