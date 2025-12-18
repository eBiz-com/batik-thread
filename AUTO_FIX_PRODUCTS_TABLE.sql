-- ============================================
-- AUTO FIX PRODUCTS TABLE - COMPREHENSIVE
-- This fixes all column issues at once
-- ============================================

DO $$ 
BEGIN
  -- Make all non-essential columns nullable
  -- (This prevents NOT NULL constraint errors)
  
  -- Make category nullable if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
    ALTER TABLE products ALTER COLUMN category DROP NOT NULL;
    RAISE NOTICE 'Made category nullable';
  END IF;

  -- Make quality nullable if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'quality') THEN
    ALTER TABLE products ALTER COLUMN quality DROP NOT NULL;
    RAISE NOTICE 'Made quality nullable';
  END IF;

  -- Make description nullable if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
    ALTER TABLE products ALTER COLUMN description DROP NOT NULL;
    RAISE NOTICE 'Made description nullable';
  END IF;

  -- Add missing columns that the app needs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'color') THEN
    ALTER TABLE products ADD COLUMN color TEXT;
    RAISE NOTICE 'Added color column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'gender') THEN
    ALTER TABLE products ADD COLUMN gender TEXT;
    RAISE NOTICE 'Added gender column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fabric') THEN
    ALTER TABLE products ADD COLUMN fabric TEXT;
    RAISE NOTICE 'Added fabric column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'origin') THEN
    ALTER TABLE products ADD COLUMN origin TEXT;
    RAISE NOTICE 'Added origin column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'story') THEN
    ALTER TABLE products ADD COLUMN story TEXT;
    RAISE NOTICE 'Added story column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
    ALTER TABLE products ADD COLUMN images TEXT[];
    RAISE NOTICE 'Added images column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
    ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    RAISE NOTICE 'Added stock column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_by_size') THEN
    ALTER TABLE products ADD COLUMN stock_by_size JSONB;
    RAISE NOTICE 'Added stock_by_size column';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
    ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE 'Added created_at column';
  END IF;

  -- Make name and price nullable if they're causing issues (unlikely, but just in case)
  -- Actually, name and price should stay NOT NULL, so we won't change those
  
END $$;

-- Show final table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '✅ Products table auto-fixed successfully!' as status;

