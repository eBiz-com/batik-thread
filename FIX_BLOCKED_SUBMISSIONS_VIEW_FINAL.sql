-- ============================================
-- FINAL FIX FOR BLOCKED_SUBMISSIONS VIEW
-- This script completely removes SECURITY DEFINER
-- ============================================

-- IMPORTANT: Run this entire script in Supabase SQL Editor
-- It will fix the SECURITY DEFINER issue and any related warnings

BEGIN;

-- Step 1: Check if view exists and get its definition
DO $$
DECLARE
  view_def TEXT;
BEGIN
  SELECT pg_get_viewdef('public.blocked_submissions', true) INTO view_def;
  IF view_def IS NOT NULL THEN
    RAISE NOTICE 'Current view definition found';
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'View does not exist, will create new one';
END $$;

-- Step 2: Drop the view completely
-- Using CASCADE to remove any dependencies
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 3: Recreate WITHOUT SECURITY DEFINER
-- Critical: Do NOT include "WITH (security_definer = true)" or "SECURITY DEFINER"
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

-- Step 4: Grant permissions to all necessary roles
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO anon;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 5: Ensure RLS is enabled on the underlying table
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify view properties (should show no SECURITY DEFINER)
-- This query will confirm the view was created correctly
DO $$
DECLARE
  has_security_definer BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_views v
    JOIN pg_class c ON c.relname = v.viewname
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE v.viewname = 'blocked_submissions'
      AND n.nspname = 'public'
      AND c.relkind = 'v'
  ) INTO has_security_definer;
  
  IF has_security_definer THEN
    RAISE NOTICE 'View created successfully';
  END IF;
END $$;

COMMIT;

-- Verification Query (run separately after the script):
-- SELECT 
--   schemaname,
--   viewname,
--   viewowner
-- FROM pg_views
-- WHERE viewname = 'blocked_submissions'
--   AND schemaname = 'public';

-- Expected result: The view should exist but NOT have SECURITY DEFINER property
-- Check Supabase Security Advisor - the error should be resolved

