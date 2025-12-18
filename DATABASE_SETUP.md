# Database Setup Guide

This guide will help you set up the Supabase database tables for the Batik & Thread e-commerce website.

## Quick Setup Options

### Option 1: Automated Web Setup (Recommended)
1. Start your development server: `npm run dev`
2. Go to `/admin/setup` in your browser
3. Click "Check & Setup Database"
4. Follow the instructions provided

### Option 2: Manual SQL Setup
Follow the instructions below to manually run SQL commands.

## Required Tables

### 1. Products Table

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  gender TEXT,
  color TEXT,
  fabric TEXT,
  origin TEXT,
  story TEXT,
  images TEXT[],
  stock INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Custom Requests Table

```sql
CREATE TABLE custom_requests (
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
```

### 3. Receipts Table

```sql
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

-- Create indexes for better performance
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_receipt_date ON receipts(receipt_date DESC);
CREATE INDEX idx_receipts_customer_name ON receipts(customer_name);
CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);
```

### 4. Transactions Table

```sql
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  receipt_id BIGINT REFERENCES receipts(id),
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

-- Create indexes for better performance
CREATE INDEX idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_customer_name ON transactions(customer_name);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

## Setup Instructions

1. **Go to your Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the SQL Commands**
   - Copy and paste the SQL commands above
   - Click "Run" to execute

4. **Set Up Row Level Security (RLS) - Optional but Recommended**

   For Products (Public Read, Admin Write):
   ```sql
   -- Enable RLS
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;

   -- Allow public read access
   CREATE POLICY "Public can read products" ON products
     FOR SELECT USING (true);

   -- Only authenticated admins can insert/update/delete
   -- (You'll need to set up authentication for this)
   ```

   For Custom Requests (Public Insert, Admin Read/Update):
   ```sql
   -- Enable RLS
   ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

   -- Allow public to insert requests
   CREATE POLICY "Public can insert requests" ON custom_requests
     FOR INSERT WITH CHECK (true);

   -- Only admins can read/update
   -- (You'll need to set up authentication for this)
   ```

## Notes

- The `style_images` field stores image data as base64 strings (for demo purposes)
- In production, consider using Supabase Storage for images instead
- The `status` field uses a CHECK constraint to ensure valid values
- `created_at` and `updated_at` are automatically managed by the database

## Testing

After setting up the tables, you can test by:

1. Adding a product through the admin dashboard
2. Submitting a custom request through the custom request page
3. Viewing requests in the admin dashboard

## Troubleshooting

If you encounter errors:

1. **Table already exists**: Drop the table first with `DROP TABLE IF EXISTS table_name;`
2. **Permission errors**: Check your Supabase project settings and RLS policies
3. **Connection errors**: Verify your Supabase URL and anon key in `.env.local`

