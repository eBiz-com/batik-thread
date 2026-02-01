# Fix Custom Request Deletion Issue

## Problem
Custom requests cannot be deleted - confirmation appears but deletion doesn't happen.

## Possible Causes

### 1. RLS (Row Level Security) Policy
Supabase might have RLS policies that block DELETE operations. Check:
1. Go to Supabase Dashboard → Authentication → Policies
2. Find `custom_requests` table
3. Check if there's a DELETE policy
4. If missing or too restrictive, add/update it

### 2. ID Type Mismatch
The ID might be a string instead of number, or vice versa.

### 3. Silent Errors
Errors might be happening but not being displayed.

## What I Fixed

1. **Better Error Handling:**
   - Added detailed console logging
   - Shows full error details (message, code, hint)
   - Validates ID type before deletion

2. **ID Validation:**
   - Converts string IDs to numbers
   - Validates ID is not NaN
   - Shows clear error if ID is invalid

3. **Result Checking:**
   - Checks if any rows were actually deleted
   - Shows warning if deletion was blocked
   - Refreshes list even if deletion fails

## How to Check RLS Policies

### Option 1: Check in Supabase Dashboard
1. Go to: Supabase Dashboard → Authentication → Policies
2. Find `custom_requests` table
3. Check DELETE policies

### Option 2: Run SQL in Supabase SQL Editor
```sql
-- Check current RLS policies for custom_requests
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'custom_requests';
```

### Option 3: Disable RLS (Temporary - for testing only)
```sql
-- WARNING: Only for testing! Re-enable after fixing
ALTER TABLE custom_requests DISABLE ROW LEVEL SECURITY;
```

### Option 4: Add DELETE Policy (Recommended)
```sql
-- Allow authenticated users (or service role) to delete custom_requests
CREATE POLICY "Allow delete custom_requests"
ON custom_requests
FOR DELETE
USING (true); -- Or add your specific condition

-- Or if you want to allow anyone with service role key:
-- This is usually handled by service role key, but check your setup
```

## Testing After Fix

1. **Open Browser Console (F12)**
2. **Try to delete a custom request**
3. **Check console for:**
   - "Attempting to delete custom request with ID: X"
   - Any error messages
   - "Delete result: [...]"

4. **If you see RLS error:**
   - Follow steps above to fix RLS policies
   - Or contact me with the error message

## Common Error Messages

- **"new row violates row-level security policy"** → RLS policy blocking deletion
- **"permission denied for table custom_requests"** → No DELETE permission
- **"column 'id' does not exist"** → Table structure issue

---

**The fix has been deployed. Check the browser console (F12) when trying to delete to see detailed error messages.**

