-- ============================================
-- FIX BLOCKED_SUBMISSIONS VIEW SECURITY DEFINER
-- This explicitly removes SECURITY DEFINER property
-- ============================================

-- Step 1: Drop the view completely
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 2: Recreate without SECURITY DEFINER
-- Note: By default, views are created as SECURITY INVOKER (not SECURITY DEFINER)
CREATE VIEW public.blocked_submissions
WITH (security_invoker=true) AS
SELECT 
  ip_address,
  email,
  COUNT(*) as attempt_count,
  MAX(created_at) as last_attempt,
  STRING_AGG(DISTINCT blocked_reason, ', ') as reasons
FROM public.submission_logs
WHERE success = false
GROUP BY ip_address, email
ORDER BY attempt_count DESC;

-- Step 3: Verify the view doesn't have SECURITY DEFINER
-- Run this query to check:
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'blocked_submissions';

-- Alternative: If the above doesn't work, try this approach:
-- First, check if the view exists and get its definition
-- Then recreate it explicitly as SECURITY INVOKER

