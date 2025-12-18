import { NextRequest, NextResponse } from 'next/server'

// ============================================
// DATABASE SETUP API
// This endpoint creates the required database tables
// Requires SUPABASE_SERVICE_ROLE_KEY in environment variables
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbetxpvmtmnkbqtosjso.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXR4cHZtdG1ua2JxdG9zanNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTAyMDUsImV4cCI6MjA3OTYyNjIwNX0.ElEuXxPWZTe3nXhYN4wwh6hgTRGv-Nh7Bg0haaPz4x4'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    // Use anon key for checking tables (works for read operations)
    const keyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY

    // SQL commands to create tables
    const setupSQL = `
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
    `

    // Note: Supabase REST API doesn't support DDL operations (CREATE TABLE) directly
    // We can only check if tables exist, then provide SQL for manual execution
    
    // Check if tables exist by querying them (using anon key is fine for read operations)
    const checkTablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
      headers: {
        'apikey': keyToUse,
        'Authorization': `Bearer ${keyToUse}`,
      },
    })

    const checkRequestsResponse = await fetch(`${SUPABASE_URL}/rest/v1/custom_requests?select=id&limit=1`, {
      headers: {
        'apikey': keyToUse,
        'Authorization': `Bearer ${keyToUse}`,
      },
    })

    const productsExists = checkTablesResponse.status !== 404 && checkTablesResponse.status !== 400
    const requestsExists = checkRequestsResponse.status !== 404 && checkRequestsResponse.status !== 400

    if (productsExists && requestsExists) {
      return NextResponse.json({
        success: true,
        message: 'Database tables already exist!',
        tables: {
          products: true,
          custom_requests: true,
        },
      })
    }

    // If tables don't exist, return SQL for manual execution
    // (Supabase REST API doesn't support DDL operations directly)
    return NextResponse.json({
      success: false,
      message: 'Tables need to be created. Use the SQL provided below.',
      sql: setupSQL,
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Navigate to SQL Editor',
        '3. Click "New Query"',
        '4. Copy and paste the SQL above',
        '5. Click "Run" to execute',
      ],
      tables: {
        products: productsExists,
        custom_requests: requestsExists,
      },
      note: SUPABASE_SERVICE_ROLE_KEY 
        ? 'Service role key is configured.' 
        : 'Using anon key for table checks. Service role key is optional for this operation.',
    })
  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to set up database',
        message: 'Please set up the database manually using the SQL in DATABASE_SETUP.md',
        instructions: [
          'Go to your Supabase Dashboard',
          'Navigate to SQL Editor',
          'Click "New Query"',
          'Copy and paste the SQL from DATABASE_SETUP.md',
          'Click "Run" to execute',
        ],
      },
      { status: 500 }
    )
  }
}

