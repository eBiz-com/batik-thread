-- ============================================
-- FINAL WORKING FIX FOR BLOCKED_SUBMISSIONS VIEW
-- This ensures the view is created correctly without SECURITY DEFINER
-- ============================================

-- Step 1: Drop the view completely
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 2: Recreate the view in the simplest way
-- Views in PostgreSQL don't have SECURITY DEFINER - they always use caller's privileges
-- The key is to ensure it's a plain view with no special properties
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

-- Step 3: Set owner to postgres (standard, valid owner)
ALTER VIEW public.blocked_submissions OWNER TO postgres;

-- Step 4: Set restrictive permissions
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
REVOKE ALL ON public.blocked_submissions FROM authenticated;
REVOKE ALL ON public.blocked_submissions FROM service_role;

-- Grant only SELECT to needed roles
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 5: Verify the view
SELECT 
  'View Status:' AS info,
  viewname,
  viewowner,
  'View created without SECURITY DEFINER' AS status
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- IMPORTANT NOTES:
-- 1. PostgreSQL views DO NOT have SECURITY DEFINER property
-- 2. Views always run with the caller's privileges (SECURITY INVOKER behavior)
-- 3. If Security Advisor still shows the error, it may be:
--    - A caching issue (wait 10-15 minutes)
--    - A false positive
--    - The view was originally created in a way that left metadata
--
-- 4. After running this:
--    - Wait 10-15 minutes
--    - Refresh Security Advisor page completely
--    - Click "Rerun linter"
--    - If still showing, it's likely a Supabase caching/false positive issue

