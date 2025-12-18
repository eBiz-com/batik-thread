-- ============================================
-- FIX PRODUCTS TABLE - ADD MISSING COLUMNS
-- This adds all required columns to your existing products table
-- ============================================

-- Add missing columns one by one (safe - won't error if column already exists)
DO $$ 
BEGIN
  -- Add color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'color'
  ) THEN
    ALTER TABLE products ADD COLUMN color TEXT;
    RAISE NOTICE 'Added color column';
  END IF;

  -- Add gender column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'gender'
  ) THEN
    ALTER TABLE products ADD COLUMN gender TEXT;
    RAISE NOTICE 'Added gender column';
  END IF;

  -- Add fabric column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'fabric'
  ) THEN
    ALTER TABLE products ADD COLUMN fabric TEXT;
    RAISE NOTICE 'Added fabric column';
  END IF;

  -- Add origin column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'origin'
  ) THEN
    ALTER TABLE products ADD COLUMN origin TEXT;
    RAISE NOTICE 'Added origin column';
  END IF;

  -- Add story column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'story'
  ) THEN
    ALTER TABLE products ADD COLUMN story TEXT;
    RAISE NOTICE 'Added story column';
  END IF;

  -- Add images column (as array)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images TEXT[];
    RAISE NOTICE 'Added images column';
  END IF;

  -- Add stock column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    RAISE NOTICE 'Added stock column';
  END IF;

  -- Add stock_by_size column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_by_size'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_by_size JSONB;
    RAISE NOTICE 'Added stock_by_size column';
  END IF;

  -- Add created_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added created_at column';
  END IF;
END $$;

-- Verify all columns now exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Products table columns updated successfully!' as status;

