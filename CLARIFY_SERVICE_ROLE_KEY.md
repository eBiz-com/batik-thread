# Clarify Service Role Key Setup

## ❌ WRONG (What you showed):
```javascript
const SERVICE_KEY = 'SUPABASE_SERVICE_KEY'  // This is just a string, not the actual key!
```

## ✅ CORRECT (What you need to do):

### Step 1: Get the ACTUAL Service Role Key Value
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find **"service_role"** key (it's a long string starting with `eyJ...`)
5. **Copy the entire key value** (it's very long, like 200+ characters)

### Step 2: Add to Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY` (exactly this name)
   - **Value:** Paste the ACTUAL key value you copied from Supabase (the long `eyJ...` string)
   - **Environment:** Select all (Production, Preview, Development)
4. Click **"Save"**

### Step 3: The Code Already Uses It Correctly
The code I wrote already uses:
```typescript
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
```

So you DON'T need to change any code. Just add the environment variable in Vercel.

## Example of What the Key Looks Like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA1MDIwNSwiZXhwIjoyMDc5NjI2MjA1fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

It's a JWT token (very long string).

## Important Notes:
- ✅ The environment variable NAME is: `SUPABASE_SERVICE_ROLE_KEY`
- ✅ The VALUE is the actual key from Supabase (long string)
- ✅ Add it in Vercel, NOT in your code
- ✅ Never commit the actual key to GitHub
- ✅ The code already reads it from `process.env.SUPABASE_SERVICE_ROLE_KEY`

---

**You just need to add the environment variable in Vercel with the actual key value from Supabase!**

