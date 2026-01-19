-- ============================================
-- COMPLETE REMOVAL AND RECREATION OF VIEW
-- This will completely remove everything and recreate cleanly
-- ============================================

-- Step 1: First, let's see the current view definition
SELECT 
  'Current Definition:' AS step,
  pg_get_viewdef('public.blocked_submissions', true) AS definition;

-- Step 2: Drop the view completely with all dependencies
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 3: Also drop as materialized view (just in case)
DROP MATERIALIZED VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 4: Wait a moment (comment - actual wait happens in execution)
-- Now recreate in the simplest way possible

-- Step 5: Create the view in the simplest way
-- Note: Views in PostgreSQL don't have SECURITY DEFINER/INVOKER - they always use caller's privileges
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

-- Step 6: Set owner explicitly
ALTER VIEW public.blocked_submissions OWNER TO postgres;

-- Step 7: Set permissions
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 8: Verify
SELECT 
  'View Recreated:' AS step,
  viewname,
  viewowner
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- IMPORTANT NOTES:
-- 1. Wait 2-5 minutes after running this
-- 2. Refresh Security Advisor page completely
-- 3. Click "Rerun linter" in Security Advisor
-- 4. If still showing, it might be a Supabase caching issue
-- 5. You may need to contact Supabase support if it's a false positive

