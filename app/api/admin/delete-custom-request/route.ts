import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbetxpvmtmnkbqtosjso.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export async function DELETE(request: NextRequest) {
  try {
    // Check if service role key is configured
    if (!supabaseAdmin) {
      const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
      const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      const keyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'none'
      
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured', {
        hasKey,
        keyLength,
        keyPrefix,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SERVICE'))
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Admin operations not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable in Vercel and redeploy.

Current status:
- Key exists: ${hasKey}
- Key length: ${keyLength}
- Key prefix: ${keyPrefix}

Steps to fix:
1. Go to Vercel → Settings → Environment Variables
2. Add: SUPABASE_SERVICE_ROLE_KEY = (your service role key from Supabase)
3. Make sure it's set for ALL environments
4. Redeploy (turn OFF build cache)`,
          debug: {
            hasKey,
            keyLength,
            keyPrefix
          }
        },
        { status: 500 }
      )
    }

    // Get request ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const requestId = parseInt(id, 10)
    if (isNaN(requestId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request ID' },
        { status: 400 }
      )
    }

    console.log('Admin deleting custom request:', requestId)

    // Delete using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('custom_requests')
      .delete()
      .eq('id', requestId)
      .select()

    if (error) {
      console.error('Error deleting custom request:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      )
    }

    console.log('Custom request deleted successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Custom request deleted successfully',
      deleted: data[0]
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

