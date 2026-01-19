-- ============================================
-- COMPLETE FIX FOR ALL SECURITY DEFINER ISSUES
-- Fixes both the view and the handle_new_user function
-- ============================================

-- PART 1: Drop the handle_new_user function (it's unused template code)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- PART 2: Fix the blocked_submissions view
BEGIN;

-- Drop the view completely
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Recreate the view WITHOUT SECURITY DEFINER
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

-- Set owner and permissions
ALTER VIEW public.blocked_submissions OWNER TO postgres;

REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Clean up and recreate RLS policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "authenticated_select_all" ON public.custom_requests;
  DROP POLICY IF EXISTS "service_role_all" ON public.custom_requests;
  DROP POLICY IF EXISTS "Allow authenticated users to view custom requests" ON public.custom_requests;
  
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
-- VERIFICATION (run separately)
-- ============================================

-- Check for any remaining SECURITY DEFINER functions
-- SELECT 
--   'Remaining SECURITY DEFINER Functions:' AS check_type,
--   p.proname AS function_name,
--   n.nspname AS schema_name
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.prosecdef = true;

-- Verify view exists
-- SELECT 
--   'View Status:' AS check_type,
--   viewname,
--   viewowner
-- FROM pg_views
-- WHERE viewname = 'blocked_submissions'
--   AND schemaname = 'public';

