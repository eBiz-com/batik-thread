-- ============================================
-- HERITAGECARD™ CONTACT CARD TABLE
-- ============================================
-- This table stores all contact card settings
-- that can be managed from the admin dashboard

CREATE TABLE IF NOT EXISTS contact_card_settings (
  id BIGSERIAL PRIMARY KEY,
  
  -- Basic Company Information
  company_name TEXT NOT NULL DEFAULT 'Batik & Thread',
  company_theme TEXT NOT NULL DEFAULT 'Modern African Luxury Boutique',
  company_tagline TEXT NOT NULL DEFAULT 'Smart Signage. Bold. Refined. Rooted in Heritage.',
  company_logo_url TEXT, -- URL to uploaded logo image
  
  -- Contact Information
  location_city TEXT NOT NULL DEFAULT 'Kissimmee',
  location_state TEXT NOT NULL DEFAULT 'FL',
  phone_number TEXT NOT NULL DEFAULT '+1 (321) 961-6566',
  whatsapp_number TEXT NOT NULL DEFAULT '+1 (321) 961-6566',
  
  -- Optional Sections (with toggle flags)
  show_website BOOLEAN DEFAULT false,
  website_url TEXT,
  
  show_event BOOLEAN DEFAULT false,
  event_name TEXT,
  event_address TEXT, -- Full address for map integration
  
  show_stand_number BOOLEAN DEFAULT false,
  stand_number TEXT,
  
  -- QR Code Configuration
  qr_code_url TEXT, -- The URL that the QR code points to (e.g., /heritage-card/1)
  card_id TEXT UNIQUE, -- Unique identifier for the card (used in URL)
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_card_card_id ON contact_card_settings(card_id);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE contact_card_settings;

-- Insert default record (if none exists)
INSERT INTO contact_card_settings (
  company_name,
  company_theme,
  company_tagline,
  location_city,
  location_state,
  phone_number,
  whatsapp_number,
  card_id
) VALUES (
  'Batik & Thread',
  'Modern African Luxury Boutique',
  'Smart Signage. Bold. Refined. Rooted in Heritage.',
  'Kissimmee',
  'FL',
  '+1 (321) 961-6566',
  '+1 (321) 961-6566',
  'default'
) ON CONFLICT (card_id) DO NOTHING;

