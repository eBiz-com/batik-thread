import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ============================================
// GET CHECKOUT SESSION
// Fetches checkout session data from database
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Fetch checkout session from database
    const { data, error } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .gt('expires_at', new Date().toISOString()) // Only get non-expired sessions
      .single()

    if (error) {
      console.error('Error fetching checkout session:', error)
      // If table doesn't exist, return 404 (will trigger fallback to sessionStorage)
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Checkout sessions table not found. Please run CREATE_CHECKOUT_SESSIONS_TABLE.sql' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Failed to fetch checkout session' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Checkout session not found or expired' },
        { status: 404 }
      )
    }

    // Return session data
    return NextResponse.json({
      session_id: data.session_id,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      created_at: data.created_at,
      expires_at: data.expires_at
    })
  } catch (error: any) {
    console.error('Unexpected error fetching checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

