-- ============================================
-- FIX CATEGORY COLUMN IN PRODUCTS TABLE
-- Make category nullable or set a default value
-- ============================================

-- Option 1: Make category nullable (Recommended)
ALTER TABLE products ALTER COLUMN category DROP NOT NULL;

-- Option 2: If you want to keep it required, set a default value instead
-- ALTER TABLE products ALTER COLUMN category SET DEFAULT 'General';

-- Verify the change
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name = 'category';

SELECT '✅ Category column fixed!' as status;

