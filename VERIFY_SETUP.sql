-- ============================================
-- VERIFY DATABASE SETUP
-- Run this to check if all tables are set up correctly
-- ============================================

-- Check if all required tables exist
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

-- Check transactions table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Check if Realtime is enabled for receipts and transactions
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('receipts', 'transactions');

