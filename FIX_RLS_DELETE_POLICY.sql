-- ============================================
-- FIX RLS POLICY FOR DELETING CUSTOM_REQUESTS
-- Run this in Supabase SQL Editor
-- ============================================

-- First, check current policies
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

-- Option 1: Allow service role to delete (if using service role key)
-- This should work if your app uses service role key
CREATE POLICY IF NOT EXISTS "Allow service role delete custom_requests"
ON custom_requests
FOR DELETE
TO service_role
USING (true);

-- Option 2: Allow authenticated users to delete (if using anon key with auth)
-- Uncomment if you're using authenticated users
-- CREATE POLICY IF NOT EXISTS "Allow authenticated delete custom_requests"
-- ON custom_requests
-- FOR DELETE
-- TO authenticated
-- USING (true);

-- Option 3: Disable RLS temporarily for testing (NOT RECOMMENDED FOR PRODUCTION)
-- Only use this if you want to disable RLS completely
-- ALTER TABLE custom_requests DISABLE ROW LEVEL SECURITY;

-- Option 4: Allow all operations if RLS is too restrictive
-- This allows anyone with the service role key to perform all operations
-- DROP POLICY IF EXISTS "Allow service role delete custom_requests" ON custom_requests;
-- CREATE POLICY "Allow service role all operations custom_requests"
-- ON custom_requests
-- FOR ALL
-- TO service_role
-- USING (true)
-- WITH CHECK (true);

-- After running, verify the policy was created:
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'custom_requests' AND cmd = 'DELETE';

