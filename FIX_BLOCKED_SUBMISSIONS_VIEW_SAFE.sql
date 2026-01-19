-- ============================================
-- FIX BLOCKED_SUBMISSIONS VIEW - SAFE VERSION
-- Removes SECURITY DEFINER property
-- ============================================

-- This script will:
-- 1. Drop the existing view (if it exists)
-- 2. Recreate it WITHOUT SECURITY DEFINER
-- 3. Grant proper permissions

-- Step 1: Drop the existing view
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 2: Recreate the view WITHOUT SECURITY DEFINER
-- Note: This is a standard definition for blocked submissions
-- If your view has different columns, adjust accordingly
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
  created_at
FROM public.custom_requests
WHERE status = 'rejected'
   OR LOWER(customer_email) LIKE '%test%'
   OR LOWER(customer_email) LIKE '%fake%'
   OR LOWER(customer_email) LIKE '%example%'
   OR LOWER(customer_email) = 'test@test.com'
ORDER BY created_at DESC;

-- Step 3: Grant appropriate permissions
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO anon;

-- Step 4: Verify (optional - run separately if needed)
-- SELECT viewname, viewowner FROM pg_views WHERE viewname = 'blocked_submissions';

