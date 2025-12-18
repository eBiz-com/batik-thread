-- ============================================
-- FIX/UPDATE PRODUCTS TABLE
-- Adds missing stock_by_size column if it doesn't exist
-- ============================================

-- Add stock_by_size column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'stock_by_size'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_by_size JSONB;
    RAISE NOTICE 'Added stock_by_size column to products table';
  ELSE
    RAISE NOTICE 'stock_by_size column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('stock', 'stock_by_size')
ORDER BY column_name;

