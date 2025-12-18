/**
 * Database Setup Script
 * 
 * This script helps set up the database tables for Batik & Thread
 * 
 * Usage:
 * 1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
 * 2. Run: node scripts/setup-database.js
 * 
 * Or use the web interface at /admin/setup
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbetxpvmtmnkbqtosjso.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
  console.log('\n📝 To set it up:')
  console.log('1. Go to Supabase Dashboard > Settings > API')
  console.log('2. Copy the "service_role" key (NOT the anon key)')
  console.log('3. Add it to your .env.local file:')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  console.log('\n⚠️  Keep this key secret! Never commit it to version control.')
  process.exit(1)
}

const sqlCommands = `
-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  gender TEXT,
  color TEXT,
  fabric TEXT,
  origin TEXT,
  story TEXT,
  images TEXT[],
  stock INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create custom_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS custom_requests (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_event_date ON custom_requests(event_date);
`.trim()

console.log('🚀 Starting database setup...\n')
console.log('📋 SQL Commands to execute:')
console.log('─'.repeat(50))
console.log(sqlCommands)
console.log('─'.repeat(50))
console.log('\n⚠️  Note: Supabase REST API does not support DDL operations directly.')
console.log('📝 Please run these SQL commands manually in Supabase SQL Editor:')
console.log('   1. Go to https://supabase.com/dashboard')
console.log('   2. Select your project')
console.log('   3. Click "SQL Editor" > "New Query"')
console.log('   4. Paste the SQL above and click "Run"\n')
console.log('💡 Alternatively, use the web interface at /admin/setup\n')

