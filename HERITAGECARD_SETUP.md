# HeritageCard™ Setup Guide

## Overview
HeritageCard™ is a dynamic digital contact card system that allows you to create beautiful, scannable contact cards for your business. The QR code on the card links to a mobile-optimized page with all your contact information.

## Features
- ✅ Dynamic contact card management from admin dashboard
- ✅ QR code generation that links to your contact information
- ✅ Click-to-call phone functionality
- ✅ Click-to-chat WhatsApp integration
- ✅ Optional website link
- ✅ Optional event information with map integration
- ✅ Optional stand number display
- ✅ Print-ready card generator (front and back)
- ✅ Mobile-first responsive design
- ✅ Luxury UI with African heritage theme

## Database Setup

### Step 1: Create the Contact Card Table

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL from `CREATE_CONTACT_CARD_TABLE.sql`
4. Run the SQL command

Alternatively, you can run this SQL directly:

```sql
-- Create contact_card_settings table
CREATE TABLE IF NOT EXISTS contact_card_settings (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Batik & Thread',
  company_theme TEXT NOT NULL DEFAULT 'Modern African Luxury Boutique',
  company_tagline TEXT NOT NULL DEFAULT 'Smart Signage. Bold. Refined. Rooted in Heritage.',
  company_logo_url TEXT,
  location_city TEXT NOT NULL DEFAULT 'Kissimmee',
  location_state TEXT NOT NULL DEFAULT 'FL',
  phone_number TEXT NOT NULL DEFAULT '+1 (321) 961-6566',
  whatsapp_number TEXT NOT NULL DEFAULT '+1 (321) 961-6566',
  show_website BOOLEAN DEFAULT false,
  website_url TEXT,
  show_event BOOLEAN DEFAULT false,
  event_name TEXT,
  event_address TEXT,
  show_stand_number BOOLEAN DEFAULT false,
  stand_number TEXT,
  qr_code_url TEXT,
  card_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_contact_card_card_id ON contact_card_settings(card_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE contact_card_settings;

-- Insert default record
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
```

## Usage

### Accessing the Admin Panel

1. Navigate to `/admin/heritage-card` in your browser
2. Login with admin credentials:
   - Username: `admin`
   - Password: `batik2025`

### Managing Your Contact Card

1. **Company Information**
   - Update company name, theme, and tagline
   - Upload your company logo

2. **Contact Information**
   - Set your location (city, state)
   - Add phone number (for click-to-call)
   - Add WhatsApp number (for click-to-chat)

3. **Optional Sections**
   - Toggle website link on/off
   - Toggle event information on/off
   - Toggle stand number on/off

4. **Save Settings**
   - Click "Save Settings" to update your card
   - The QR code will automatically update

### Generating Print-Ready Cards

1. Fill in all your contact information
2. Click "Generate Print Preview"
3. Your browser's print dialog will open
4. Print the front and back of the card
5. Recommended card size: 3.5" x 2" (standard business card)

### Viewing Your Live Card

1. Click "View Live Card" in the admin panel
2. Or visit: `/heritage-card/default` (or your custom card_id)
3. Share this URL or the QR code with customers

## QR Code Usage

- The QR code automatically points to: `https://yourdomain.com/heritage-card/{card_id}`
- When scanned, it opens a beautiful mobile-optimized contact card
- All contact information is interactive:
  - Phone: Tap to call
  - WhatsApp: Tap to start chat
  - Website: Tap to visit (if enabled)
  - Event: Tap to open in maps (if enabled)

## File Structure

```
app/
├── admin/
│   └── heritage-card/
│       └── page.tsx          # Admin management page
└── heritage-card/
    └── [id]/
        └── page.tsx          # Public contact card page

lib/
└── supabase.ts               # ContactCardSettings interface

C:\Dev\BatikThread\
└── CREATE_CONTACT_CARD_TABLE.sql  # Database setup SQL
```

## Troubleshooting

### Card not loading
- Check that the database table exists
- Verify the `card_id` matches in the database
- Check browser console for errors

### QR code not working
- Ensure you've saved your settings first
- Verify the `qr_code_url` is generated correctly
- Check that the public page route is accessible

### Print preview not showing
- Make sure all required fields are filled
- Check browser print settings
- Try a different browser if issues persist

## Support

For issues or questions, check:
- Admin dashboard: `/admin`
- Database setup: `/admin/setup`
- Main admin: `/admin/heritage-card`

