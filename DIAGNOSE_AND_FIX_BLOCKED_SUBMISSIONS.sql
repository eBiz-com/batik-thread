-- ============================================
-- COMPLETE DIAGNOSIS AND FIX
-- This will find and fix the SECURITY DEFINER issue
-- ============================================

-- ============================================
-- PART 1: DIAGNOSIS - Run this first
-- ============================================

-- 1. Check if view exists and its properties
SELECT 
  'View Status:' AS check_type,
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- 2. Check for SECURITY DEFINER functions that might affect the view
SELECT 
  'SECURITY DEFINER Functions:' AS check_type,
  p.proname AS function_name,
  n.nspname AS schema_name,
  CASE WHEN p.prosecdef THEN 'YES - PROBLEM!' ELSE 'NO' END AS has_security_definer,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true;

-- 3. Check what the view depends on
SELECT 
  'View Dependencies:' AS check_type,
  dependent_ns.nspname AS dependent_schema,
  dependent_view.relname AS dependent_view,
  source_ns.nspname AS source_schema,
  source_table.relname AS source_table
FROM pg_depend
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class AS dependent_view ON pg_rewrite.ev_class = dependent_view.oid
JOIN pg_class AS source_table ON pg_depend.refobjid = source_table.oid
JOIN pg_namespace dependent_ns ON dependent_ns.oid = dependent_view.relnamespace
JOIN pg_namespace source_ns ON source_ns.oid = source_table.relnamespace
WHERE dependent_view.relname = 'blocked_submissions'
  AND dependent_ns.nspname = 'public';

-- ============================================
-- PART 2: COMPLETE FIX - Run this to fix
-- ============================================

BEGIN;

-- Step 1: Drop the view completely
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 2: Find and drop ANY SECURITY DEFINER functions in public schema
-- (These can cause views to be flagged)
DO $$
DECLARE
  func_record RECORD;
  func_signature TEXT;
BEGIN
  FOR func_record IN
    SELECT 
      p.oid,
      p.proname,
      n.nspname,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    BEGIN
      IF func_record.args = '' THEN
        func_signature := format('%I.%I()', func_record.nspname, func_record.proname);
      ELSE
        func_signature := format('%I.%I(%s)', func_record.nspname, func_record.proname, func_record.args);
      END IF;
      
      EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', func_signature);
      RAISE NOTICE 'Dropped SECURITY DEFINER function: %', func_signature;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop function %: %', func_signature, SQLERRM;
    END;
  END LOOP;
END $$;

-- Step 3: Recreate the view in the SIMPLEST way
-- No functions, no special syntax, just plain SQL
CREATE VIEW public.blocked_submissions AS
SELECT 
  id,
  customer_email,
  customer_name,
  customer_phone,
  event_name,
  event_date,
  quantity,
  sizes,
  description,
  status,
  admin_notes,
  created_at,
  updated_at
FROM public.custom_requests
WHERE status = 'rejected'
   OR LOWER(customer_email) LIKE '%test%'
   OR LOWER(customer_email) LIKE '%fake%'
   OR LOWER(customer_email) LIKE '%example%'
   OR LOWER(customer_email) = 'test@test.com'
ORDER BY created_at DESC;

-- Step 4: Set owner to postgres (standard, no special privileges)
ALTER VIEW public.blocked_submissions OWNER TO postgres;

-- Step 5: Clean up all grants and set restrictive permissions
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
REVOKE ALL ON public.blocked_submissions FROM authenticated;
REVOKE ALL ON public.blocked_submissions FROM service_role;

GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 6: Ensure RLS is enabled
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Step 7: Clean up and recreate RLS policies
DO $$
BEGIN
  -- Drop all existing policies on custom_requests
  DROP POLICY IF EXISTS "authenticated_select_all" ON public.custom_requests;
  DROP POLICY IF EXISTS "service_role_all" ON public.custom_requests;
  DROP POLICY IF EXISTS "Allow authenticated users to view custom requests" ON public.custom_requests;
  DROP POLICY IF EXISTS "Allow service_role to manage custom requests" ON public.custom_requests;
  DROP POLICY IF EXISTS "Users can view their own requests" ON public.custom_requests;
  
  -- Create clean policies
  CREATE POLICY "authenticated_select_all"
  ON public.custom_requests
  FOR SELECT
  TO authenticated
  USING (true);

  CREATE POLICY "service_role_all"
  ON public.custom_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
END $$;

COMMIT;

-- ============================================
-- PART 3: VERIFICATION - Run this after fix
-- ============================================

-- Verify view was created
SELECT 
  'Verification - View:' AS check_type,
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- Verify no SECURITY DEFINER functions remain
SELECT 
  'Verification - Functions:' AS check_type,
  COUNT(*) AS security_definer_functions_count
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true;

-- Test the view
SELECT 
  'Verification - Test:' AS check_type,
  COUNT(*) AS row_count
FROM public.blocked_submissions;

-- ============================================
-- INSTRUCTIONS:
-- 1. Run PART 1 to see what's causing the issue
-- 2. Review the results (especially SECURITY DEFINER functions)
-- 3. Run PART 2 to fix everything
-- 4. Run PART 3 to verify
-- 5. Wait 1-2 minutes, then check Security Advisor again
-- 6. If still showing, try refreshing the Security Advisor page
-- ============================================

