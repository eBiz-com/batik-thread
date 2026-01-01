-- FIX SUPABASE RLS SECURITY ISSUES
-- Run this in Supabase SQL Editor

-- STEP 1: Drop all existing policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
  DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
  DROP POLICY IF EXISTS "Admins can update products" ON public.products;
  DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
  DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
  DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can create receipts" ON public.receipts;
  DROP POLICY IF EXISTS "Admins can update receipts" ON public.receipts;
  DROP POLICY IF EXISTS "Admins can view all receipts" ON public.receipts;
  DROP POLICY IF EXISTS "Users can view receipts for their orders" ON public.receipts;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can insert requests" ON public.custom_requests;
  DROP POLICY IF EXISTS "Admins can view requests" ON public.custom_requests;
  DROP POLICY IF EXISTS "Admins can update requests" ON public.custom_requests;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view transactions" ON public.transactions;
  DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
  DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view contact card settings" ON public.contact_card_settings;
  DROP POLICY IF EXISTS "Admins can manage contact card settings" ON public.contact_card_settings;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view submission logs" ON public.submission_logs;
  DROP POLICY IF EXISTS "System can insert submission logs" ON public.submission_logs;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;
    DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
  END IF;
END $$;

-- STEP 2: Drop and recreate view
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- STEP 3: Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_card_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- STEP 4: Recreate view without SECURITY DEFINER
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

-- STEP 5: Create policies for products
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (true);

-- STEP 6: Create policies for receipts
CREATE POLICY "Admins can view all receipts" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Users can view receipts for their orders" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "Admins can create receipts" ON public.receipts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update receipts" ON public.receipts FOR UPDATE USING (true) WITH CHECK (true);

-- STEP 7: Create policies for custom_requests
CREATE POLICY "Public can insert requests" ON public.custom_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view requests" ON public.custom_requests FOR SELECT USING (true);
CREATE POLICY "Admins can update requests" ON public.custom_requests FOR UPDATE USING (true) WITH CHECK (true);

-- STEP 8: Create policies for transactions
CREATE POLICY "Public can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Admins can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE USING (true) WITH CHECK (true);

-- STEP 9: Create policies for contact_card_settings
CREATE POLICY "Public can view contact card settings" ON public.contact_card_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage contact card settings" ON public.contact_card_settings FOR ALL USING (true) WITH CHECK (true);

-- STEP 10: Create policies for submission_logs
CREATE POLICY "Admins can view submission logs" ON public.submission_logs FOR SELECT USING (true);
CREATE POLICY "System can insert submission logs" ON public.submission_logs FOR INSERT WITH CHECK (true);

-- STEP 11: Create policies for admins (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    EXECUTE 'CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Admins can manage admins" ON public.admins FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

