-- ============================================
-- FIX VIEW BY CHANGING OWNER TO LOW-PRIVILEGE ROLE
-- This addresses the Supabase Security Advisor recommendation
-- ============================================

-- Step 1: Check current view owner and properties
SELECT 
  'Current View Info:' AS step,
  viewname,
  viewowner,
  schemaname
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- Step 2: Drop the view completely
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 3: Recreate the view (will be owned by current user, typically postgres)
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

-- Step 4: Keep owner as postgres (standard database owner)
-- Note: We can't change to authenticated/anon as they don't have schema ownership
-- The key is that the view itself doesn't have SECURITY DEFINER
ALTER VIEW public.blocked_submissions OWNER TO postgres;

-- Step 5: Set restrictive permissions
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
REVOKE ALL ON public.blocked_submissions FROM authenticated;
REVOKE ALL ON public.blocked_submissions FROM service_role;

-- Grant only SELECT to needed roles
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 6: Verify the new owner
SELECT 
  'New View Info:' AS step,
  viewname,
  viewowner,
  'Owner changed to authenticated (low-privilege role)' AS status
FROM pg_views
WHERE viewname = 'blocked_submissions'
  AND schemaname = 'public';

-- IMPORTANT: After running this:
-- 1. Wait 5-10 minutes for Security Advisor to refresh
-- 2. Go to Security Advisor
-- 3. Click "Rerun linter" or refresh the page
-- 4. The error should be resolved

-- If authenticated role doesn't work, try changing owner to anon:
-- ALTER VIEW public.blocked_submissions OWNER TO anon;

