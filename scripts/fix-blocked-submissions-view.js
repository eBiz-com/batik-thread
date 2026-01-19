/**
 * Fix Blocked Submissions View Script
 * 
 * This script fixes the blocked_submissions view by removing SECURITY DEFINER
 * 
 * Usage:
 * 1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
 * 2. Run: node scripts/fix-blocked-submissions-view.js
 */

const { createClient } = require('@supabase/supabase-js')

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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const fixViewSQL = `
-- Drop the existing view
DROP VIEW IF EXISTS public.blocked_submissions CASCADE;

-- Recreate the view WITHOUT SECURITY DEFINER
CREATE VIEW public.blocked_submissions AS
SELECT 
  id,
  customer_email,
  customer_name,
  customer_phone,
  event_name,
  event_date,
  quantity,
  sizes,
  description,
  status,
  admin_notes,
  created_at,
  updated_at
FROM public.custom_requests
WHERE status = 'rejected'
   OR LOWER(customer_email) LIKE '%test%'
   OR LOWER(customer_email) LIKE '%fake%'
   OR LOWER(customer_email) LIKE '%example%'
   OR LOWER(customer_email) = 'test@test.com'
ORDER BY created_at DESC;

-- Grant permissions
GRANT SELECT ON public.blocked_submissions TO authenticated;
GRANT SELECT ON public.blocked_submissions TO anon;

-- Enable RLS on underlying table if not already enabled
ALTER TABLE IF EXISTS public.custom_requests ENABLE ROW LEVEL SECURITY;
`

async function fixView() {
  console.log('🔧 Fixing blocked_submissions view...\n')

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixViewSQL })

    if (error) {
      // If RPC doesn't exist, try direct query execution
      console.log('⚠️  RPC method not available, trying alternative approach...\n')
      
      // Split SQL into individual statements and execute
      const statements = fixViewSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' })
            if (stmtError) {
              console.log(`Executing: ${statement.substring(0, 50)}...`)
              // Try using the REST API directly
              const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SUPABASE_SERVICE_ROLE_KEY,
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ sql: statement + ';' })
              })
              
              if (!response.ok) {
                console.error(`❌ Error executing statement: ${statement.substring(0, 50)}`)
                console.error(`Response: ${await response.text()}`)
              } else {
                console.log('✅ Statement executed successfully')
              }
            }
          } catch (err) {
            console.error(`❌ Error: ${err.message}`)
          }
        }
      }
    } else {
      console.log('✅ View fixed successfully!')
    }

    // Verify the fix
    console.log('\n🔍 Verifying view...')
    const { data: viewData, error: viewError } = await supabase
      .from('blocked_submissions')
      .select('*')
      .limit(1)

    if (viewError) {
      console.error('❌ Error verifying view:', viewError.message)
    } else {
      console.log('✅ View is accessible and working correctly!')
      console.log(`📊 View contains ${viewData?.length || 0} sample rows`)
    }

    console.log('\n✨ Done! Please check Supabase Security Advisor to confirm the fix.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Alternative: Run the SQL script manually in Supabase SQL Editor:')
    console.log('   File: FIX_BLOCKED_SUBMISSIONS_VIEW_COMPLETE.sql')
    process.exit(1)
  }
}

fixView()

