-- ============================================
-- FINAL SECURITY CHECK
-- Quick check to confirm everything is fixed
-- ============================================

-- 1. Check for SECURITY DEFINER functions (should be 0)
SELECT 
  COUNT(*) AS security_definer_functions_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ FIXED - No SECURITY DEFINER functions'
    ELSE '❌ ISSUE - Still has ' || COUNT(*) || ' SECURITY DEFINER function(s)'
  END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true;

-- 2. Verify view exists (should be 1)
SELECT 
  COUNT(*) AS view_exists,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ View exists'
    ELSE '❌ View missing'
  END AS status
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- 3. Test view accessibility
SELECT 
  COUNT(*) AS row_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ View is accessible'
    ELSE '❌ View not accessible'
  END AS status
FROM public.blocked_submissions;

-- 4. Check RLS is enabled
SELECT 
  rowsecurity AS rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS is enabled'
    ELSE '❌ RLS is NOT enabled'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'custom_requests';

-- Summary: All checks should show ✅
-- If all show ✅, then Security Advisor should show no errors

