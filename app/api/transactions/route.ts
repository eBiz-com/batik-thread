import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch all transactions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const receiptNumber = searchParams.get('receipt_number')
    const customerName = searchParams.get('customer_name')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const minAmount = searchParams.get('min_amount')
    const maxAmount = searchParams.get('max_amount')

    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (receiptNumber) {
      query = query.ilike('receipt_number', `%${receiptNumber}%`)
    }
    if (customerName) {
      query = query.ilike('customer_name', `%${customerName}%`)
    }
    if (status) {
      query = query.eq('payment_status', status)
    }
    if (startDate) {
      query = query.gte('transaction_date', startDate)
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate)
    }
    if (minAmount) {
      query = query.gte('total_amount', parseFloat(minAmount))
    }
    if (maxAmount) {
      query = query.lte('total_amount', parseFloat(maxAmount))
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch transactions' },
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

// POST - Create a new transaction (usually called automatically from payment/receipt)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      receipt_number,
      receipt_id,
      transaction_date,
      customer_name,
      customer_phone,
      customer_address,
      items,
      product_total,
      shipping_cost,
      tax_percent,
      tax_amount,
      total_amount,
      transaction_source,
    } = body

    // Validate required fields
    if (!receipt_number || !transaction_date || !customer_name || !items || total_amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          receipt_number,
          receipt_id: receipt_id || null,
          transaction_date,
          customer_name,
          customer_phone: customer_phone || '',
          customer_address: customer_address || '',
          items: items,
          product_total: parseFloat(product_total) || 0,
          shipping_cost: parseFloat(shipping_cost) || 0,
          tax_percent: parseFloat(tax_percent) || 0,
          tax_amount: parseFloat(tax_amount) || 0,
          total_amount: parseFloat(total_amount) || 0,
          payment_status: 'completed',
          transaction_source: transaction_source || 'checkout',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Error saving transaction:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to save transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: 'Transaction saved successfully',
    })
  } catch (error: any) {
    console.error('Error processing transaction:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process transaction' },
      { status: 500 }
    )
  }
}

