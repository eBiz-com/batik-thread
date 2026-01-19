-- ============================================
-- VERIFICATION QUERIES
-- Run this to confirm all security issues are fixed
-- ============================================

-- 1. Check for any remaining SECURITY DEFINER functions
SELECT 
  'SECURITY DEFINER Functions:' AS check_type,
  p.proname AS function_name,
  n.nspname AS schema_name,
  CASE WHEN p.prosecdef THEN 'YES - STILL HAS ISSUE!' ELSE 'NO - FIXED!' END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true;

-- 2. Verify the view exists and is owned correctly
SELECT 
  'View Status:' AS check_type,
  viewname,
  viewowner,
  'View exists' AS status
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- 3. Test that the view works
SELECT 
  'View Test:' AS check_type,
  COUNT(*) AS row_count,
  'View is accessible' AS status
FROM public.blocked_submissions;

-- 4. Check RLS is enabled on custom_requests
SELECT 
  'RLS Status:' AS check_type,
  tablename,
  rowsecurity AS rls_enabled,
  CASE WHEN rowsecurity THEN 'YES - ENABLED' ELSE 'NO - NOT ENABLED' END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'custom_requests';

-- 5. Check RLS policies exist
SELECT 
  'RLS Policies:' AS check_type,
  policyname,
  tablename,
  'Policy exists' AS status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'custom_requests';

-- Expected Results:
-- ✅ No SECURITY DEFINER functions (query 1 should return 0 rows)
-- ✅ View exists (query 2 should return 1 row)
-- ✅ View is accessible (query 3 should return a count)
-- ✅ RLS is enabled (query 4 should show rowsecurity = true)
-- ✅ RLS policies exist (query 5 should return at least 2 rows)

