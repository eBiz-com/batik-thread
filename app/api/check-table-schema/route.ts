import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This endpoint helps diagnose table schema issues
export async function GET(request: NextRequest) {
  try {
    // Try to query the table structure
    const { data, error } = await supabase
      .from('custom_requests')
      .select('*')
      .limit(0) // Just get schema, no data

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        suggestion: 'Run the SQL in FIX_CUSTOM_REQUESTS_TABLE.sql to fix the table structure',
      })
    }

    // Try to get column information via a test insert (will fail but show us the schema)
    const testInsert = await supabase
      .from('custom_requests')
      .insert([{
        customer_name: 'test',
        customer_email: 'test@test.com',
        customer_phone: '123',
        event_name: 'test',
        event_date: '2025-01-01',
        quantity: 1,
        sizes: 'M',
        description: 'test',
      }])
      .select()

    return NextResponse.json({
      success: true,
      message: 'Table structure appears correct',
      testInsert: testInsert.error ? {
        error: testInsert.error.message,
        code: testInsert.error.code,
      } : 'Success',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

