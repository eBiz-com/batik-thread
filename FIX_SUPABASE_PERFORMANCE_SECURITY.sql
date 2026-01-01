-- ============================================
-- FIX SUPABASE PERFORMANCE & SECURITY ISSUES
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE MISSING INDEXES FOR PERFORMANCE
-- ============================================

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Custom requests table indexes
CREATE INDEX IF NOT EXISTS idx_custom_requests_customer_email ON custom_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_custom_requests_customer_phone ON custom_requests(customer_phone);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_event_date ON custom_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_custom_requests_event_name ON custom_requests(event_name);

-- Receipts table indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_name ON receipts(customer_name);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_phone ON receipts(customer_phone);

-- Transactions table indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_name ON transactions(customer_name);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_id ON transactions(receipt_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_source ON transactions(transaction_source);

-- Contact card settings indexes
CREATE INDEX IF NOT EXISTS idx_contact_card_settings_card_id ON contact_card_settings(card_id);
CREATE INDEX IF NOT EXISTS idx_contact_card_settings_created_at ON contact_card_settings(created_at DESC);

-- Submission logs indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_submission_logs_ip_address ON submission_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_submission_logs_email ON submission_logs(email);
CREATE INDEX IF NOT EXISTS idx_submission_logs_created_at ON submission_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_logs_success ON submission_logs(success);
CREATE INDEX IF NOT EXISTS idx_submission_logs_device_fingerprint ON submission_logs(device_fingerprint);

-- ============================================
-- 2. ADD MISSING FOREIGN KEY CONSTRAINTS
-- ============================================

-- Transactions -> Receipts foreign key (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_receipt_id_fkey'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_receipt_id_fkey 
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Submission logs -> Custom requests foreign key (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submission_logs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'submission_logs_request_id_fkey'
    ) THEN
      ALTER TABLE submission_logs 
      ADD CONSTRAINT submission_logs_request_id_fkey 
      FOREIGN KEY (request_id) REFERENCES custom_requests(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ============================================
-- 3. ADD MISSING UNIQUE CONSTRAINTS
-- ============================================

-- Receipt number should be unique (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'receipts_receipt_number_key'
  ) THEN
    ALTER TABLE receipts 
    ADD CONSTRAINT receipts_receipt_number_key UNIQUE (receipt_number);
  END IF;
END $$;

-- ============================================
-- 4. ADD MISSING NOT NULL CONSTRAINTS
-- ============================================

-- Products table
ALTER TABLE products 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN price SET NOT NULL;

-- Custom requests table
ALTER TABLE custom_requests 
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN customer_email SET NOT NULL,
  ALTER COLUMN customer_phone SET NOT NULL,
  ALTER COLUMN event_name SET NOT NULL,
  ALTER COLUMN event_date SET NOT NULL,
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN sizes SET NOT NULL,
  ALTER COLUMN description SET NOT NULL;

-- Receipts table
ALTER TABLE receipts 
  ALTER COLUMN receipt_number SET NOT NULL,
  ALTER COLUMN receipt_date SET NOT NULL,
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN items SET NOT NULL,
  ALTER COLUMN subtotal SET NOT NULL,
  ALTER COLUMN shipping SET NOT NULL,
  ALTER COLUMN tax_percent SET NOT NULL,
  ALTER COLUMN tax_amount SET NOT NULL,
  ALTER COLUMN grand_total SET NOT NULL;

-- Transactions table
ALTER TABLE transactions 
  ALTER COLUMN receipt_number SET NOT NULL,
  ALTER COLUMN transaction_date SET NOT NULL,
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN items SET NOT NULL,
  ALTER COLUMN product_total SET NOT NULL,
  ALTER COLUMN shipping_cost SET NOT NULL,
  ALTER COLUMN tax_percent SET NOT NULL,
  ALTER COLUMN tax_amount SET NOT NULL,
  ALTER COLUMN total_amount SET NOT NULL;

-- ============================================
-- 5. ADD DEFAULT VALUES WHERE NEEDED
-- ============================================

-- Products table
ALTER TABLE products 
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Custom requests table
ALTER TABLE custom_requests 
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Receipts table
ALTER TABLE receipts 
  ALTER COLUMN subtotal SET DEFAULT 0,
  ALTER COLUMN shipping SET DEFAULT 0,
  ALTER COLUMN tax_percent SET DEFAULT 0,
  ALTER COLUMN tax_amount SET DEFAULT 0,
  ALTER COLUMN grand_total SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Transactions table
ALTER TABLE transactions 
  ALTER COLUMN product_total SET DEFAULT 0,
  ALTER COLUMN shipping_cost SET DEFAULT 0,
  ALTER COLUMN tax_percent SET DEFAULT 0,
  ALTER COLUMN tax_amount SET DEFAULT 0,
  ALTER COLUMN total_amount SET DEFAULT 0,
  ALTER COLUMN payment_status SET DEFAULT 'completed',
  ALTER COLUMN transaction_source SET DEFAULT 'checkout',
  ALTER COLUMN created_at SET DEFAULT NOW();

-- ============================================
-- 6. ADD CHECK CONSTRAINTS FOR DATA VALIDITY
-- ============================================

-- Products price must be positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_price_positive'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_price_positive CHECK (price >= 0);
  END IF;
END $$;

-- Custom requests quantity must be positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'custom_requests_quantity_positive'
  ) THEN
    ALTER TABLE custom_requests 
    ADD CONSTRAINT custom_requests_quantity_positive CHECK (quantity > 0);
  END IF;
END $$;

-- Receipts amounts must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'receipts_amounts_non_negative'
  ) THEN
    ALTER TABLE receipts 
    ADD CONSTRAINT receipts_amounts_non_negative 
    CHECK (subtotal >= 0 AND shipping >= 0 AND tax_amount >= 0 AND grand_total >= 0);
  END IF;
END $$;

-- Transactions amounts must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_amounts_non_negative'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_amounts_non_negative 
    CHECK (product_total >= 0 AND shipping_cost >= 0 AND tax_amount >= 0 AND total_amount >= 0);
  END IF;
END $$;

-- ============================================
-- 7. OPTIMIZE JSONB COLUMNS (if using JSONB)
-- ============================================

-- Add GIN indexes for JSONB columns for faster queries
CREATE INDEX IF NOT EXISTS idx_receipts_items_gin ON receipts USING GIN (items);
CREATE INDEX IF NOT EXISTS idx_transactions_items_gin ON transactions USING GIN (items);

-- ============================================
-- 8. VACUUM AND ANALYZE FOR PERFORMANCE
-- ============================================

VACUUM ANALYZE products;
VACUUM ANALYZE custom_requests;
VACUUM ANALYZE receipts;
VACUUM ANALYZE transactions;
VACUUM ANALYZE contact_card_settings;

-- ============================================
-- 9. VERIFY ALL CHANGES
-- ============================================

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('products', 'custom_requests', 'receipts', 'transactions', 'contact_card_settings', 'submission_logs')
ORDER BY tablename, indexname;

-- Check constraints
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  conrelid::regclass AS table_name
FROM pg_constraint
WHERE conrelid::regclass::text IN ('products', 'custom_requests', 'receipts', 'transactions', 'contact_card_settings', 'submission_logs')
ORDER BY conrelid::regclass::text, conname;

