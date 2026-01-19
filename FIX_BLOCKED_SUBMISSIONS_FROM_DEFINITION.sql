-- ============================================
-- FIX BLOCKED_SUBMISSIONS VIEW
-- Based on actual view definition
-- ============================================

-- STEP 1: First, get the full definition by running this:
-- SELECT pg_get_viewdef('public.blocked_submissions', true);

-- STEP 2: Drop the existing view
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- STEP 3: Recreate WITHOUT SECURITY DEFINER
-- Replace the SELECT below with the actual definition from STEP 1
-- Just make sure to remove any "WITH (security_definer = true)" or "SECURITY DEFINER" clauses

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

-- STEP 4: Restrictive grants (Supabase recommended)
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- STEP 5: Ensure RLS is enabled
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "authenticated_select_all" ON public.custom_requests;
  DROP POLICY IF EXISTS "service_role_all" ON public.custom_requests;
  
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

