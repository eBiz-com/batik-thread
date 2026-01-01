-- ============================================
-- FIX REMAINING SUPABASE ISSUES
-- Common issues after RLS is enabled
-- ============================================

-- ============================================
-- 1. ENSURE ALL TABLES HAVE RLS ENABLED
-- ============================================

ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_card_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submission_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- 2. ENSURE VIEW DOESN'T HAVE SECURITY DEFINER
-- ============================================

DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

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
-- 3. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
CREATE INDEX IF NOT EXISTS idx_products_color ON public.products(color);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Custom requests indexes
CREATE INDEX IF NOT EXISTS idx_custom_requests_customer_email ON public.custom_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_custom_requests_customer_phone ON public.custom_requests(customer_phone);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON public.custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON public.custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_event_date ON public.custom_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_custom_requests_event_name ON public.custom_requests(event_name);

-- Receipts indexes
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON public.receipts(receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_name ON public.receipts(customer_name);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON public.receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_phone ON public.receipts(customer_phone);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON public.transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON public.transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_name ON public.transactions(customer_name);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_id ON public.transactions(receipt_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_source ON public.transactions(transaction_source);

-- Contact card settings indexes
CREATE INDEX IF NOT EXISTS idx_contact_card_settings_card_id ON public.contact_card_settings(card_id);
CREATE INDEX IF NOT EXISTS idx_contact_card_settings_created_at ON public.contact_card_settings(created_at DESC);

-- Submission logs indexes
CREATE INDEX IF NOT EXISTS idx_submission_logs_ip_address ON public.submission_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_submission_logs_email ON public.submission_logs(email);
CREATE INDEX IF NOT EXISTS idx_submission_logs_created_at ON public.submission_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_logs_success ON public.submission_logs(success);
CREATE INDEX IF NOT EXISTS idx_submission_logs_device_fingerprint ON public.submission_logs(device_fingerprint);

-- JSONB indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_receipts_items_gin ON public.receipts USING GIN (items);
CREATE INDEX IF NOT EXISTS idx_transactions_items_gin ON public.transactions USING GIN (items);

-- ============================================
-- 4. ADD FOREIGN KEY CONSTRAINTS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_receipt_id_fkey'
  ) THEN
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_receipt_id_fkey 
    FOREIGN KEY (receipt_id) REFERENCES public.receipts(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'submission_logs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'submission_logs_request_id_fkey'
    ) THEN
      ALTER TABLE public.submission_logs 
      ADD CONSTRAINT submission_logs_request_id_fkey 
      FOREIGN KEY (request_id) REFERENCES public.custom_requests(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- 5. ADD UNIQUE CONSTRAINTS
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'receipts_receipt_number_key'
  ) THEN
    ALTER TABLE public.receipts 
    ADD CONSTRAINT receipts_receipt_number_key UNIQUE (receipt_number);
  END IF;
END $$;

-- ============================================
-- 6. ADD CHECK CONSTRAINTS FOR DATA VALIDITY
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_price_positive'
  ) THEN
    ALTER TABLE public.products 
    ADD CONSTRAINT products_price_positive CHECK (price >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'custom_requests_quantity_positive'
  ) THEN
    ALTER TABLE public.custom_requests 
    ADD CONSTRAINT custom_requests_quantity_positive CHECK (quantity > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'receipts_amounts_non_negative'
  ) THEN
    ALTER TABLE public.receipts 
    ADD CONSTRAINT receipts_amounts_non_negative 
    CHECK (subtotal >= 0 AND shipping >= 0 AND tax_amount >= 0 AND grand_total >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_amounts_non_negative'
  ) THEN
    ALTER TABLE public.transactions 
    ADD CONSTRAINT transactions_amounts_non_negative 
    CHECK (product_total >= 0 AND shipping_cost >= 0 AND tax_amount >= 0 AND total_amount >= 0);
  END IF;
END $$;

-- ============================================
-- 7. VACUUM AND ANALYZE FOR PERFORMANCE
-- ============================================

VACUUM ANALYZE public.products;
VACUUM ANALYZE public.custom_requests;
VACUUM ANALYZE public.receipts;
VACUUM ANALYZE public.transactions;
VACUUM ANALYZE public.contact_card_settings;
VACUUM ANALYZE public.submission_logs;

-- ============================================
-- 8. VERIFY RLS STATUS
-- ============================================

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

