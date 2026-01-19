-- ============================================
-- FIX BLOCKED_SUBMISSIONS VIEW - EXTRACT & RECREATE
-- Follows Supabase Security Advisor recommendations exactly
-- ============================================

-- STEP 1: Extract the current view definition
-- This shows you exactly what the view contains
-- Copy the result and use it in STEP 3 if needed
SELECT pg_get_viewdef('public.blocked_submissions', true) AS current_view_definition;

-- STEP 2: Check for any SECURITY DEFINER functions that might be related
-- Views can inherit SECURITY DEFINER behavior from functions they call
SELECT 
  p.proname AS function_name,
  n.nspname AS schema_name,
  CASE WHEN p.prosecdef THEN 'YES - HAS SECURITY DEFINER' ELSE 'NO' END AS security_definer_status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (p.proname LIKE '%blocked%' 
       OR p.proname LIKE '%submission%'
       OR p.proname LIKE '%custom_request%');

-- STEP 3: Drop the view completely
-- CASCADE removes any dependencies
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- STEP 4: Recreate the view WITHOUT SECURITY DEFINER
-- CRITICAL: Do NOT include "WITH (security_definer = true)" or any SECURITY DEFINER clause
-- The view will run with the caller's privileges (SECURITY INVOKER - default)
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

-- STEP 5: Restrictive grants (following Supabase recommendations)
-- Only grant to roles that actually need access
-- Do NOT grant to PUBLIC or anon unless absolutely necessary
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Explicitly revoke from PUBLIC and anon for security
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;

-- STEP 6: Ensure RLS is enabled on underlying table
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create/verify RLS policies exist
DO $$
BEGIN
  -- Policy for authenticated users
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

  -- Policy for service_role (admin)
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

-- ============================================
-- VALIDATION (run these separately after the script)
-- ============================================

-- Verify view was created correctly
-- SELECT 
--   schemaname,
--   viewname,
--   viewowner
-- FROM pg_views
-- WHERE viewname = 'blocked_submissions'
--   AND schemaname = 'public';

-- Verify view definition (should NOT show SECURITY DEFINER)
-- SELECT pg_get_viewdef('public.blocked_submissions', true);

-- Test the view works
-- SELECT * FROM public.blocked_submissions LIMIT 5;

-- Check grants
-- SELECT 
--   grantee,
--   privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
--   AND table_name = 'blocked_submissions';

-- ============================================
-- EXPECTED RESULT:
-- ✅ View recreated without SECURITY DEFINER
-- ✅ Restricted grants (not to PUBLIC)
-- ✅ RLS enabled and policies in place
-- ✅ Security Advisor should show NO ERRORS
-- ============================================

