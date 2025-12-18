-- ============================================
-- CHECK PRODUCTS TABLE STRUCTURE
-- Run this to see what columns your products table has
-- ============================================

-- Check if products table exists
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'products' THEN '✅ Table exists'
    ELSE '❌ Table missing'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'products';

-- Check products table columns and data types
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if stock_by_size column exists
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name = 'stock_by_size';

