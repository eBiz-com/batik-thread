-- ============================================
-- ALTERNATIVE: CONVERT VIEW TO SECURITY INVOKER FUNCTION
-- If changing owner doesn't work, use this approach
-- ============================================

-- This creates a function (SECURITY INVOKER - default, safe) instead of a view
-- The function runs with the caller's privileges, not elevated privileges

-- Step 1: Drop the view
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Step 2: Create a function that returns the same data
-- This function uses SECURITY INVOKER (default, safe) - caller's privileges
CREATE OR REPLACE FUNCTION public.get_blocked_submissions()
RETURNS TABLE (
  id BIGINT,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  event_name TEXT,
  event_date DATE,
  quantity INTEGER,
  sizes TEXT,
  description TEXT,
  status TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
LANGUAGE sql
-- NO SECURITY DEFINER - uses caller's privileges (SECURITY INVOKER is default)
STABLE
AS $$
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
$$;

-- Step 3: Set owner to low-privilege role
ALTER FUNCTION public.get_blocked_submissions() OWNER TO authenticated;

-- Step 4: Set restrictive permissions
REVOKE EXECUTE ON FUNCTION public.get_blocked_submissions() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_blocked_submissions() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_blocked_submissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_blocked_submissions() TO service_role;

-- Step 5: Create a view that calls the function (for compatibility)
-- This view will use the function, which uses SECURITY INVOKER
CREATE VIEW public.blocked_submissions AS
SELECT * FROM public.get_blocked_submissions();

-- Step 6: Set view owner
ALTER VIEW public.blocked_submissions OWNER TO authenticated;

-- Step 7: Set view permissions
REVOKE ALL ON public.blocked_submissions FROM PUBLIC;
REVOKE ALL ON public.blocked_submissions FROM anon;
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO service_role;

-- Usage: SELECT * FROM public.blocked_submissions;
-- Or: SELECT * FROM public.get_blocked_submissions();

-- This approach ensures:
-- ✅ No SECURITY DEFINER
-- ✅ Uses caller's privileges (SECURITY INVOKER)
-- ✅ Low-privilege owner
-- ✅ Restricted permissions

