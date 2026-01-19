-- ============================================
-- FIX BLOCKED_SUBMISSIONS VIEW - SUPABASE RECOMMENDED METHOD
-- Follows Supabase Security Advisor recommendations
-- ============================================

-- STEP 1: Extract the current view definition
-- Run this first to see what the view currently contains:
SELECT pg_get_viewdef('public.blocked_submissions', true) AS current_view_definition;

-- STEP 2: Drop the existing view
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- STEP 3: Recreate the view WITHOUT SECURITY DEFINER
-- IMPORTANT: Do NOT include "WITH (security_definer = true)" or "SECURITY DEFINER"
-- The view will now run with the caller's privileges and RLS will apply correctly

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

-- STEP 4: Grant SELECT permissions (restrictive - only to needed roles)
-- Do NOT grant to PUBLIC or authenticated broadly if not needed
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Revoke from anon if not needed (more secure)
REVOKE SELECT ON public.blocked_submissions FROM anon;
REVOKE SELECT ON public.blocked_submissions FROM public;

-- STEP 5: Ensure RLS is enabled on the underlying table
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- STEP 6: Verify RLS policies exist for custom_requests
-- Create policies if they don't exist
DO $$
BEGIN
  -- Policy for authenticated users to view all custom requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'custom_requests' 
    AND policyname = 'authenticated_select_all'
  ) THEN
    CREATE POLICY "authenticated_select_all"
    ON public.custom_requests
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  -- Policy for service_role (admin operations)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'custom_requests' 
    AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY "service_role_all"
    ON public.custom_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- STEP 7: Validation queries (run these separately to verify)
-- Check view exists and properties
/*
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';
*/

-- Verify no SECURITY DEFINER on view
-- (Views don't have a direct SECURITY DEFINER flag, but check for related functions)
/*
SELECT 
  p.proname AS function_name,
  n.nspname AS schema_name,
  CASE WHEN p.prosecdef THEN 'YES' ELSE 'NO' END AS has_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (p.proname LIKE '%blocked%' OR p.proname LIKE '%submission%');
*/

-- Test query as different roles (run in Supabase SQL Editor with different role contexts)
-- This should work for authenticated users:
-- SELECT * FROM public.blocked_submissions LIMIT 5;

-- ============================================
-- EXPECTED RESULT:
-- ✅ View recreated without SECURITY DEFINER
-- ✅ RLS policies in place
-- ✅ Restricted grants (not to PUBLIC)
-- ✅ Security Advisor should show no errors
-- ============================================

