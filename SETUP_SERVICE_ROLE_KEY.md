# Setup Service Role Key for Admin Operations

## Problem
Custom request deletion is blocked by RLS (Row Level Security) because the app uses the anon key.

## Solution
I've created an admin API route that uses the service role key to bypass RLS. You need to add the service role key to your environment variables.

## Steps to Fix

### Step 1: Get Your Service Role Key
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find **"service_role"** key (NOT the anon key)
5. Copy it (it starts with `eyJ...`)

### Step 2: Add to Vercel Environment Variables
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `batik-thread`
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** (paste your service role key)
   - **Environment:** Select all (Production, Preview, Development)
6. Click **"Save"**

### Step 3: Redeploy
1. After adding the environment variable, go to **Deployments**
2. Click **"..."** on the latest deployment
3. Select **"Redeploy"**
4. Make sure **"Use existing Build Cache"** is OFF
5. Click **"Redeploy"**

### Step 4: Test
1. Go to admin panel
2. Try deleting a custom request
3. It should work now!

## Alternative: Fix RLS Policy (If you prefer)

If you don't want to use service role key, you can create an RLS policy instead:

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Allow anon role to delete custom_requests
CREATE POLICY "Allow anon delete custom_requests"
ON custom_requests
FOR DELETE
TO anon
USING (true);
```

**Note:** Using service role key is more secure for admin operations.

## Security Note

The service role key bypasses RLS and has full access. Keep it secret:
- ✅ Only use in server-side code (API routes)
- ✅ Never expose in client-side code
- ✅ Only add to environment variables (not in code)

---

**After adding the service role key and redeploying, deletion should work!**

