-- ============================================
-- FIX CUSTOM_REQUESTS TABLE
-- Run this in Supabase SQL Editor if you get column errors
-- ============================================

-- First, check if the table exists and what columns it has
-- You can run this to see the current structure:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'custom_requests';

-- Option 1: If table doesn't exist or is empty, drop and recreate
DROP TABLE IF EXISTS custom_requests CASCADE;

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_event_date ON custom_requests(event_date);

-- Option 2: If you want to keep existing data, add missing columns instead
-- (Uncomment and modify as needed)
/*
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'customer_email') THEN
    ALTER TABLE custom_requests ADD COLUMN customer_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'customer_name') THEN
    ALTER TABLE custom_requests ADD COLUMN customer_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'customer_phone') THEN
    ALTER TABLE custom_requests ADD COLUMN customer_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'event_name') THEN
    ALTER TABLE custom_requests ADD COLUMN event_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'event_date') THEN
    ALTER TABLE custom_requests ADD COLUMN event_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'quantity') THEN
    ALTER TABLE custom_requests ADD COLUMN quantity INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'sizes') THEN
    ALTER TABLE custom_requests ADD COLUMN sizes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'description') THEN
    ALTER TABLE custom_requests ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'style_images') THEN
    ALTER TABLE custom_requests ADD COLUMN style_images TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'status') THEN
    ALTER TABLE custom_requests ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'admin_notes') THEN
    ALTER TABLE custom_requests ADD COLUMN admin_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'created_at') THEN
    ALTER TABLE custom_requests ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'custom_requests' AND column_name = 'updated_at') THEN
    ALTER TABLE custom_requests ADD COLUMN updated_at TIMESTAMP;
  END IF;
END $$;
*/

-- After running, refresh Supabase schema cache by:
-- 1. Go to Supabase Dashboard > Settings > API
-- 2. Click "Reload" or wait a few minutes for auto-refresh
-- OR
-- 3. Restart your Next.js dev server

