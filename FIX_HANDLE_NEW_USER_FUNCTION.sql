-- ============================================
-- FIX handle_new_user SECURITY DEFINER FUNCTION
-- This function is causing security warnings
-- ============================================

-- Step 1: Check if this function is actually being used
-- Run this first to see if there are any triggers using it
SELECT 
  'Triggers using handle_new_user:' AS check_type,
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE action_statement LIKE '%handle_new_user%'
  AND trigger_schema = 'public';

-- Step 2: Check what the function actually does
SELECT 
  'Function Details:' AS check_type,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS full_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'handle_new_user';

-- Step 3: If the function is NOT being used, drop it
-- (Uncomment if Step 1 shows no triggers using it)
/*
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
*/

-- Step 4: If the function IS being used, recreate it WITHOUT SECURITY DEFINER
-- (Only if you need to keep the function)
-- Replace the logic below with the actual logic from Step 2
/*
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
-- NO SECURITY DEFINER - uses caller's privileges
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  -- Your actual logic here
  -- Use fully qualified table names
  -- This will now run with the caller's privileges (more secure)
  
  RETURN NEW;
END;
$$;
*/

