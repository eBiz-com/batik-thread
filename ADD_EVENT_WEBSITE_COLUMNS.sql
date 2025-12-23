-- Add event website columns to contact_card_settings table
-- Run this in Supabase SQL Editor

ALTER TABLE contact_card_settings
ADD COLUMN IF NOT EXISTS event_website_url TEXT,
ADD COLUMN IF NOT EXISTS event_website_name TEXT;

