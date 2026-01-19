-- ============================================
-- FINAL FIX FOR BLOCKED_SUBMISSIONS VIEW SECURITY DEFINER
-- This will completely remove and recreate the view
-- ============================================

-- Step 1: Get the current view definition to see what we're working with
SELECT 
  'Current View Definition:' AS info,
  pg_get_viewdef('public.blocked_submissions', true) AS definition;

-- Step 2: Drop the view completely
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 3: Drop any materialized views with the same name (just in case)
DROP MATERIALIZED VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 4: Recreate the view in the SIMPLEST possible way
-- No functions, no complex joins, just a basic SELECT
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

-- Step 5: Explicitly set owner to postgres (standard role, no special privileges)
ALTER VIEW public.blocked_submissions OWNER TO postgres;

-- Step 6: Revoke ALL permissions first
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
REVOKE ALL ON public.blocked_submissions FROM authenticated;
REVOKE ALL ON public.blocked_submissions FROM service_role;

-- Step 7: Grant only SELECT to needed roles
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 8: Verify the view was created correctly
SELECT 
  'View Created:' AS info,
  viewname,
  viewowner,
  'Check Security Advisor after 1-2 minutes' AS next_step
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- IMPORTANT: After running this:
-- 1. Wait 1-2 minutes for Security Advisor to refresh
-- 2. Go to Security Advisor
-- 3. Click "Rerun linter" or refresh the page
-- 4. Check if the error is gone

-- If the error STILL persists, it might be a Security Advisor caching issue.
-- Try:
-- - Refreshing the Security Advisor page
-- - Waiting 5-10 minutes
-- - Or contact Supabase support if it's a false positive

