-- ============================================
-- COMPLETE DIAGNOSIS & FIX FOR BLOCKED_SUBMISSIONS VIEW
-- This script diagnoses the issue and fixes it completely
-- ============================================

-- ============================================
-- PART 1: DIAGNOSIS - Run this first to understand the issue
-- ============================================

-- 1.1: Get the current view definition
SELECT 
  'Current View Definition:' AS info,
  pg_get_viewdef('public.blocked_submissions', true) AS definition;

-- 1.2: Check view properties in pg_views
SELECT 
  'View Properties:' AS info,
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- 1.3: Check for SECURITY DEFINER functions that might be related
SELECT 
  'SECURITY DEFINER Functions:' AS info,
  p.proname AS function_name,
  n.nspname AS schema_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true  -- SECURITY DEFINER
  AND (
    p.proname LIKE '%blocked%' 
    OR p.proname LIKE '%submission%'
    OR p.proname LIKE '%custom_request%'
  );

-- 1.4: Check for triggers on custom_requests that might affect the view
SELECT 
  'Triggers on custom_requests:' AS info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'custom_requests';

-- 1.5: Check current grants on the view
SELECT 
  'Current Grants:' AS info,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'blocked_submissions';

-- ============================================
-- PART 2: FIX - Run this to fix the issue
-- ============================================

BEGIN;

-- 2.1: Drop the view completely
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- 2.2: If there are any SECURITY DEFINER functions related, drop them too
-- (Uncomment if Step 1.3 found any functions)
/*
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT p.proname, n.nspname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND (p.proname LIKE '%blocked%' OR p.proname LIKE '%submission%')
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', func_record.nspname, func_record.proname);
    RAISE NOTICE 'Dropped function: %.%', func_record.nspname, func_record.proname;
  END LOOP;
END $$;
*/

-- 2.3: Recreate the view WITHOUT SECURITY DEFINER
-- This is the standard way - views run with caller's privileges by default
CREATE VIEW public.blocked_submissions AS
SELECT 
  cr.id,
  cr.customer_email,
  cr.customer_name,
  cr.customer_phone,
  cr.event_name,
  cr.event_date,
  cr.quantity,
  cr.sizes,
  cr.description,
  cr.status,
  cr.admin_notes,
  cr.created_at,
  cr.updated_at
FROM public.custom_requests cr
WHERE cr.status = 'rejected'
   OR LOWER(cr.customer_email) LIKE '%test%'
   OR LOWER(cr.customer_email) LIKE '%fake%'
   OR LOWER(cr.customer_email) LIKE '%example%'
   OR LOWER(cr.customer_email) = 'test@test.com'
ORDER BY cr.created_at DESC;

-- 2.4: Set restrictive grants (following Supabase best practices)
-- Revoke everything from PUBLIC first
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;

-- Grant only to needed roles
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- 2.5: Ensure RLS is enabled
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- 2.6: Create RLS policies
DO $$
BEGIN
  -- Drop existing policies if they exist (to avoid conflicts)
  DROP POLICY IF EXISTS "authenticated_select_all" ON public.custom_requests;
  DROP POLICY IF EXISTS "service_role_all" ON public.custom_requests;
  
  -- Create policy for authenticated users
  CREATE POLICY "authenticated_select_all"
  ON public.custom_requests
  FOR SELECT
  TO authenticated
  USING (true);

  -- Create policy for service_role
  CREATE POLICY "service_role_all"
  ON public.custom_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
END $$;

COMMIT;

-- ============================================
-- PART 3: VERIFICATION - Run these after the fix
-- ============================================

-- 3.1: Verify view was created
SELECT 
  'Verification - View Exists:' AS info,
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- 3.2: Verify view definition (should be clean, no SECURITY DEFINER)
SELECT 
  'Verification - View Definition:' AS info,
  pg_get_viewdef('public.blocked_submissions', true) AS definition;

-- 3.3: Verify grants
SELECT 
  'Verification - Grants:' AS info,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'blocked_submissions';

-- 3.4: Test the view
SELECT 
  'Verification - Test Query:' AS info,
  COUNT(*) AS row_count
FROM public.blocked_submissions;

-- ============================================
-- INSTRUCTIONS:
-- 1. Run PART 1 first to see what's causing the issue
-- 2. Review the results, especially any SECURITY DEFINER functions
-- 3. Run PART 2 to fix the issue
-- 4. Run PART 3 to verify the fix
-- 5. Check Supabase Security Advisor - error should be gone
-- ============================================

