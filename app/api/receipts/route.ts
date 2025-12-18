import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all receipts with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const receiptNumber = searchParams.get('receipt_number')
    const customerName = searchParams.get('customer_name')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const minAmount = searchParams.get('min_amount')
    const maxAmount = searchParams.get('max_amount')

    let query = supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (receiptNumber) {
      query = query.ilike('receipt_number', `%${receiptNumber}%`)
    }
    if (customerName) {
      query = query.ilike('customer_name', `%${customerName}%`)
    }
    if (startDate) {
      query = query.gte('receipt_date', startDate)
    }
    if (endDate) {
      query = query.lte('receipt_date', endDate)
    }
    if (minAmount) {
      query = query.gte('grand_total', parseFloat(minAmount))
    }
    if (maxAmount) {
      query = query.lte('grand_total', parseFloat(maxAmount))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching receipts:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch receipts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

// POST - Save a new receipt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      receipt_number,
      receipt_date,
      customer_name,
      customer_phone,
      customer_address,
      items,
      subtotal,
      shipping,
      tax_percent,
      tax_amount,
      grand_total,
    } = body

    // Validate required fields
    if (!receipt_number || !receipt_date || !customer_name || !items || grand_total === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('receipts')
      .insert([
        {
          receipt_number,
          receipt_date,
          customer_name,
          customer_phone: customer_phone || '',
          customer_address: customer_address || '',
          items: items, // Supabase will handle JSONB conversion
          subtotal: parseFloat(subtotal) || 0,
          shipping: parseFloat(shipping) || 0,
          tax_percent: parseFloat(tax_percent) || 0,
          tax_amount: parseFloat(tax_amount) || 0,
          grand_total: parseFloat(grand_total) || 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Error saving receipt:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to save receipt' },
        { status: 500 }
      )
    }

    const receiptData = data?.[0]

    // Note: Transactions are saved separately:
    // - Checkout payments: saved in /api/payment/process
    // - Admin receipts: saved in app/admin/receipt/page.tsx
    // This prevents duplicate entries

    return NextResponse.json({
      success: true,
      data: receiptData,
      message: 'Receipt saved successfully',
    })
  } catch (error: any) {
    console.error('Error processing receipt:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process receipt' },
      { status: 500 }
    )
  }
}

