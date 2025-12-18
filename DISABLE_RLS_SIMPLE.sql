-- ============================================
-- SIMPLE FIX: DISABLE RLS FOR DEVELOPMENT
-- Run this if you want to quickly disable RLS
-- ============================================

-- Disable RLS on all tables (for development/testing)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'custom_requests', 'receipts', 'transactions')
ORDER BY tablename;

SELECT '✅ RLS disabled for all tables!' as status;

