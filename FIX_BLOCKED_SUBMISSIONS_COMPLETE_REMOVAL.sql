-- ============================================
-- COMPLETE REMOVAL AND RECREATION
-- This removes EVERYTHING related and recreates cleanly
-- ============================================

BEGIN;

-- Step 1: Drop the view completely with all dependencies
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 2: Check for and remove any functions that might be related
-- (Functions with SECURITY DEFINER that views use can cause this issue)
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT 
      p.proname AS function_name,
      n.nspname AS schema_name,
      pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- SECURITY DEFINER
      AND (
        p.proname LIKE '%blocked%' 
        OR p.proname LIKE '%submission%'
        OR p.proname LIKE '%custom_request%'
      )
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
      func_record.schema_name, 
      func_record.function_name,
      func_record.args);
    RAISE NOTICE 'Dropped SECURITY DEFINER function: %.%', func_record.schema_name, func_record.function_name;
  END LOOP;
END $$;

-- Step 3: Recreate the view in the SIMPLEST way possible
-- No functions, no complex logic, just a plain SELECT
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

-- Step 4: Explicitly set the view owner to postgres (default, no special privileges)
ALTER VIEW public.blocked_submissions OWNER TO postgres;

-- Step 5: Revoke ALL permissions first, then grant only what's needed
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
REVOKE ALL ON public.blocked_submissions FROM authenticated;
REVOKE ALL ON public.blocked_submissions FROM service_role;

-- Now grant only SELECT to needed roles
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 6: Ensure RLS is enabled on the table
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop and recreate RLS policies cleanly
DROP POLICY IF EXISTS "authenticated_select_all" ON public.custom_requests;
DROP POLICY IF EXISTS "service_role_all" ON public.custom_requests;
DROP POLICY IF EXISTS "Allow authenticated users to view custom requests" ON public.custom_requests;
DROP POLICY IF EXISTS "Allow service_role to manage custom requests" ON public.custom_requests;

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

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (run separately)
-- ============================================

-- Check view exists and owner
-- SELECT 
--   schemaname,
--   viewname,
--   viewowner
-- FROM pg_views
-- WHERE viewname = 'blocked_submissions'
--   AND schemaname = 'public';

-- Check for any remaining SECURITY DEFINER functions
-- SELECT 
--   p.proname AS function_name,
--   CASE WHEN p.prosecdef THEN 'YES' ELSE 'NO' END AS has_security_definer
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND (p.proname LIKE '%blocked%' OR p.proname LIKE '%submission%');

-- Test the view
-- SELECT COUNT(*) FROM public.blocked_submissions;

