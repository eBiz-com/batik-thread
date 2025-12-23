-- Add all missing columns to contact_card_settings table
-- Run this in Supabase SQL Editor to fix the error

ALTER TABLE contact_card_settings
ADD COLUMN IF NOT EXISTS event_website_url TEXT,
ADD COLUMN IF NOT EXISTS event_website_name TEXT,
ADD COLUMN IF NOT EXISTS website_name TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contact_card_settings' 
AND column_name IN ('event_website_url', 'event_website_name', 'website_name');

