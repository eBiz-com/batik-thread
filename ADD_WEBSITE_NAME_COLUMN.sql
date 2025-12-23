-- Add website_name column to contact_card_settings table
-- Run this in Supabase SQL Editor

ALTER TABLE contact_card_settings
ADD COLUMN IF NOT EXISTS website_name TEXT;

