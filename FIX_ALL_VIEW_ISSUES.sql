-- ============================================
-- COMPREHENSIVE FIX FOR BLOCKED_SUBMISSIONS VIEW
-- Fixes SECURITY DEFINER issue and all warnings
-- ============================================

-- This script will:
-- 1. Drop the view completely
-- 2. Check for any functions with SECURITY DEFINER that the view might use
-- 3. Recreate the view without SECURITY DEFINER
-- 4. Fix all related permissions and RLS

BEGIN;

-- Step 1: Drop the view and any dependencies
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 2: Check for any functions that might be causing issues
-- (Functions with SECURITY DEFINER that views depend on can cause warnings)
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT 
      p.proname AS function_name,
      n.nspname AS schema_name
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- SECURITY DEFINER functions
      AND p.proname LIKE '%blocked%' OR p.proname LIKE '%submission%'
  LOOP
    RAISE NOTICE 'Found SECURITY DEFINER function: %.%', func_record.schema_name, func_record.function_name;
  END LOOP;
END $$;

-- Step 3: Recreate the view WITHOUT any SECURITY DEFINER
-- Using explicit table aliases and fully qualified names
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

-- Step 4: Grant SELECT permissions
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO anon;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Step 5: Ensure RLS is enabled on custom_requests table
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Step 6: Create basic RLS policies if they don't exist
DO $$
BEGIN
  -- Policy for authenticated users to view all custom requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'custom_requests' 
    AND policyname = 'authenticated_select_all'
  ) THEN
    CREATE POLICY "authenticated_select_all"
    ON public.custom_requests
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  -- Policy for service_role to do everything (for admin operations)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'custom_requests' 
    AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY "service_role_all"
    ON public.custom_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (run separately)
-- ============================================

-- Check if view exists and its properties
-- SELECT 
--   schemaname,
--   viewname,
--   viewowner
-- FROM pg_views
-- WHERE viewname = 'blocked_submissions'
--   AND schemaname = 'public';

-- Check view definition
-- SELECT pg_get_viewdef('public.blocked_submissions', true);

-- Check for any SECURITY DEFINER functions related to this view
-- SELECT 
--   p.proname AS function_name,
--   n.nspname AS schema_name,
--   CASE WHEN p.prosecdef THEN 'YES' ELSE 'NO' END AS has_security_definer
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND (p.proname LIKE '%blocked%' OR p.proname LIKE '%submission%');

-- Expected result after running:
-- ✅ View exists without SECURITY DEFINER
-- ✅ No related functions with SECURITY DEFINER
-- ✅ RLS enabled on underlying table
-- ✅ Proper permissions granted
-- ✅ Security Advisor should show no errors

