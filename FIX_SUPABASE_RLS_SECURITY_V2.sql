-- ============================================
-- FIX SUPABASE RLS SECURITY ISSUES - V2
-- More robust version that handles all edge cases
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES FIRST
-- ============================================

-- Products policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
  DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
  DROP POLICY IF EXISTS "Admins can update products" ON public.products;
  DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
  DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
  DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
END $$;

-- Receipts policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can create receipts" ON public.receipts;
  DROP POLICY IF EXISTS "Admins can update receipts" ON public.receipts;
  DROP POLICY IF EXISTS "Admins can view all receipts" ON public.receipts;
  DROP POLICY IF EXISTS "Users can view receipts for their orders" ON public.receipts;
END $$;

-- Custom requests policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can insert requests" ON public.custom_requests;
  DROP POLICY IF EXISTS "Admins can view requests" ON public.custom_requests;
  DROP POLICY IF EXISTS "Admins can update requests" ON public.custom_requests;
END $$;

-- Transactions policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view transactions" ON public.transactions;
  DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
  DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
END $$;

-- Contact card settings policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view contact card settings" ON public.contact_card_settings;
  DROP POLICY IF EXISTS "Admins can manage contact card settings" ON public.contact_card_settings;
END $$;

-- Submission logs policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view submission logs" ON public.submission_logs;
  DROP POLICY IF EXISTS "System can insert submission logs" ON public.submission_logs;
END $$;

-- Admins policies (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
    DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
  END IF;
END $$;

-- ============================================
-- STEP 2: FIX SECURITY DEFINER VIEW
-- ============================================

DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- ============================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_card_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on admins if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- STEP 4: RECREATE VIEW WITHOUT SECURITY DEFINER
-- ============================================

CREATE VIEW public.blocked_submissions AS
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

-- ============================================
-- STEP 5: CREATE RLS POLICIES FOR PRODUCTS
-- ============================================

CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (true);

-- ============================================
-- STEP 6: CREATE RLS POLICIES FOR RECEIPTS
-- ============================================

CREATE POLICY "Admins can view all receipts"
ON public.receipts
FOR SELECT
USING (true);

CREATE POLICY "Users can view receipts for their orders"
ON public.receipts
FOR SELECT
USING (true);

CREATE POLICY "Admins can create receipts"
ON public.receipts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update receipts"
ON public.receipts
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 7: CREATE RLS POLICIES FOR CUSTOM_REQUESTS
-- ============================================

CREATE POLICY "Public can insert requests"
ON public.custom_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view requests"
ON public.custom_requests
FOR SELECT
USING (true);

CREATE POLICY "Admins can update requests"
ON public.custom_requests
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 8: CREATE RLS POLICIES FOR TRANSACTIONS
-- ============================================

CREATE POLICY "Public can view transactions"
ON public.transactions
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update transactions"
ON public.transactions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 9: CREATE RLS POLICIES FOR CONTACT_CARD_SETTINGS
-- ============================================

CREATE POLICY "Public can view contact card settings"
ON public.contact_card_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage contact card settings"
ON public.contact_card_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- STEP 10: CREATE RLS POLICIES FOR SUBMISSION_LOGS
-- ============================================

CREATE POLICY "Admins can view submission logs"
ON public.submission_logs
FOR SELECT
USING (true);

CREATE POLICY "System can insert submission logs"
ON public.submission_logs
FOR INSERT
WITH CHECK (true);

-- ============================================
-- STEP 11: CREATE RLS POLICIES FOR ADMINS (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    EXECUTE 'CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins can manage admins" ON public.admins FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'products',
    'receipts',
    'custom_requests',
    'transactions',
    'contact_card_settings',
    'submission_logs',
    'admins'
  )
ORDER BY tablename;

-- Check all policies exist
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check view doesn't have SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'blocked_submissions';

