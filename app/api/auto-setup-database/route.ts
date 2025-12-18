import { NextRequest, NextResponse } from 'next/server'

// ============================================
// AUTO DATABASE SETUP API
// Provides complete SQL for all required tables
// ============================================

export async function GET(request: NextRequest) {
  const completeSQL = `-- ============================================
-- COMPLETE DATABASE SETUP FOR BATIK & THREAD
-- Copy and paste this entire script in Supabase SQL Editor
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
  stock_by_size JSONB,
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
CREATE TABLE IF NOT EXISTS receipts (
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

-- 4. TRANSACTIONS TABLE
-- This handles both UUID and BIGINT receipt_id types
DO $$ 
DECLARE
  receipt_id_type TEXT;
BEGIN
  -- Get the data type of receipts.id column (if table exists)
  SELECT data_type INTO receipt_id_type
  FROM information_schema.columns
  WHERE table_name = 'receipts' AND column_name = 'id';
  
  -- Create transactions table with appropriate foreign key type
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    IF receipt_id_type = 'uuid' THEN
      -- Receipts table uses UUID
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
      -- Receipts table uses BIGINT (or doesn't exist yet)
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

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- ENABLE REALTIME (for automatic updates)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;`

  return NextResponse.json({
    success: true,
    sql: completeSQL,
    instructions: [
      '1. Go to your Supabase Dashboard',
      '2. Navigate to SQL Editor (left sidebar)',
      '3. Click "New Query"',
      '4. Copy the SQL below and paste it',
      '5. Click "Run" (or press Ctrl+Enter)',
      '6. Wait for "Success" message',
      '7. Go to Database → Replication and enable Realtime for receipts and transactions tables',
    ],
    tables: [
      'products - Store product catalog',
      'custom_requests - Store custom order requests',
      'receipts - Store all receipts',
      'transactions - Store all transactions for tracking',
    ],
    note: 'This will create all required tables. Existing tables will not be affected (IF NOT EXISTS).',
  })
}

