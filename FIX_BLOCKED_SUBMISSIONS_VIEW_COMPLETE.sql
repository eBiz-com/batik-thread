-- ============================================
-- COMPLETE FIX FOR BLOCKED_SUBMISSIONS VIEW
-- Removes SECURITY DEFINER and fixes all warnings
-- ============================================

-- IMPORTANT: This script must be run in Supabase SQL Editor
-- It will fix the SECURITY DEFINER issue on the view

-- Step 1: Get current view definition (for reference - run separately if needed)
-- SELECT pg_get_viewdef('public.blocked_submissions', true) AS current_definition;

-- Step 2: Drop the view completely (CASCADE removes any dependencies)
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 3: Recreate the view WITHOUT SECURITY DEFINER
-- The key is: NO "WITH (security_definer = true)" or "SECURITY DEFINER" clause
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

-- Step 4: Grant appropriate permissions
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO anon;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 5: Ensure RLS is enabled on underlying table
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify the view (run this separately to confirm)
-- SELECT viewname, viewowner FROM pg_views WHERE viewname = 'blocked_submissions' AND schemaname = 'public';

-- DONE! The view should now be created without SECURITY DEFINER
-- Check Supabase Security Advisor to confirm the fix

