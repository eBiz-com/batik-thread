-- ============================================
-- COMPLETE DATABASE SETUP FOR BATIK & THREAD
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  gender TEXT,
  color TEXT,
  fabric TEXT,
  origin TEXT,
  story TEXT,
  images TEXT[],
  stock INTEGER DEFAULT 0,
  stock_by_size JSONB, -- New: stock by size, e.g., {"S": 5, "M": 10, "L": 8, "XL": 2}
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. CUSTOM_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS custom_requests (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  sizes TEXT NOT NULL,
  description TEXT NOT NULL,
  style_images TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- 3. RECEIPTS TABLE
-- Note: If receipts table already exists with UUID, it will use that structure
-- Otherwise, this creates it with BIGSERIAL
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'receipts') THEN
    CREATE TABLE receipts (
      id BIGSERIAL PRIMARY KEY,
      receipt_number TEXT NOT NULL UNIQUE,
      receipt_date DATE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      items JSONB NOT NULL,
      subtotal DECIMAL NOT NULL DEFAULT 0,
      shipping DECIMAL NOT NULL DEFAULT 0,
      tax_percent DECIMAL NOT NULL DEFAULT 0,
      tax_amount DECIMAL NOT NULL DEFAULT 0,
      grand_total DECIMAL NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      created_by TEXT
    );
  END IF;
END $$;

-- 4. TRANSACTIONS TABLE
-- Check if receipts table uses UUID or BIGINT and create foreign key accordingly
DO $$ 
DECLARE
  receipt_id_type TEXT;
BEGIN
  -- Get the data type of receipts.id column
  SELECT data_type INTO receipt_id_type
  FROM information_schema.columns
  WHERE table_name = 'receipts' AND column_name = 'id';
  
  -- Create transactions table with appropriate foreign key type
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    IF receipt_id_type = 'uuid' THEN
      CREATE TABLE transactions (
        id BIGSERIAL PRIMARY KEY,
        receipt_number TEXT NOT NULL,
        receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
        transaction_date DATE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_address TEXT,
        items JSONB NOT NULL,
        product_total DECIMAL NOT NULL DEFAULT 0,
        shipping_cost DECIMAL NOT NULL DEFAULT 0,
        tax_percent DECIMAL NOT NULL DEFAULT 0,
        tax_amount DECIMAL NOT NULL DEFAULT 0,
        total_amount DECIMAL NOT NULL DEFAULT 0,
        payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('completed', 'refunded', 'transaction_closed')),
        refund_amount DECIMAL,
        refund_date TIMESTAMP,
        refund_reason TEXT,
        transaction_source TEXT DEFAULT 'checkout' CHECK (transaction_source IN ('checkout', 'admin_receipt')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    ELSE
      CREATE TABLE transactions (
        id BIGSERIAL PRIMARY KEY,
        receipt_number TEXT NOT NULL,
        receipt_id BIGINT REFERENCES receipts(id) ON DELETE SET NULL,
        transaction_date DATE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_address TEXT,
        items JSONB NOT NULL,
        product_total DECIMAL NOT NULL DEFAULT 0,
        shipping_cost DECIMAL NOT NULL DEFAULT 0,
        tax_percent DECIMAL NOT NULL DEFAULT 0,
        tax_amount DECIMAL NOT NULL DEFAULT 0,
        total_amount DECIMAL NOT NULL DEFAULT 0,
        payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('completed', 'refunded', 'transaction_closed')),
        refund_amount DECIMAL,
        refund_date TIMESTAMP,
        refund_reason TEXT,
        transaction_source TEXT DEFAULT 'checkout' CHECK (transaction_source IN ('checkout', 'admin_receipt')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    END IF;
  END IF;
END $$;
  transaction_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB NOT NULL,
  product_total DECIMAL NOT NULL DEFAULT 0,
  shipping_cost DECIMAL NOT NULL DEFAULT 0,
  tax_percent DECIMAL NOT NULL DEFAULT 0,
  tax_amount DECIMAL NOT NULL DEFAULT 0,
  total_amount DECIMAL NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('completed', 'refunded', 'transaction_closed')),
  refund_amount DECIMAL,
  refund_date TIMESTAMP,
  refund_reason TEXT,
  transaction_source TEXT DEFAULT 'checkout' CHECK (transaction_source IN ('checkout', 'admin_receipt')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Custom requests indexes
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_event_date ON custom_requests(event_date);

-- Receipts indexes
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_name ON receipts(customer_name);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_name ON transactions(customer_name);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_id ON transactions(receipt_id);

-- ============================================
-- ENABLE REALTIME (for automatic updates)
-- ============================================

-- Enable Realtime for receipts table
ALTER PUBLICATION supabase_realtime ADD TABLE receipts;

-- Enable Realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('products', 'custom_requests', 'receipts', 'transactions') 
    THEN '✅ Required table'
    ELSE '⚠️ Additional table'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'custom_requests', 'receipts', 'transactions')
ORDER BY table_name;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All required tables have been created.
-- You can now use the admin dashboard to manage products,
-- view receipts, and track transactions.
-- ============================================

