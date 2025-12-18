-- ============================================
-- FIX TRANSACTIONS TABLE FOR EXISTING RECEIPTS
-- Use this if receipts table already exists with UUID
-- ============================================

-- Drop transactions table if it exists (to recreate with correct foreign key)
DROP TABLE IF EXISTS transactions CASCADE;

-- Create transactions table with UUID foreign key (matching receipts.id)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_name ON transactions(customer_name);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_id ON transactions(receipt_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

