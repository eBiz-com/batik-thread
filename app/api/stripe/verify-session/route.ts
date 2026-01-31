import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

// ============================================
// VERIFY STRIPE SESSION
// Verifies a Stripe checkout session and returns receipt data
// ============================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

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

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Get checkout session data from database
    const { data: checkoutData, error: checkoutError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (checkoutError || !checkoutData) {
      return NextResponse.json(
        { error: 'Checkout session not found' },
        { status: 404 }
      )
    }

    // Get or create receipt
    const { data: existingReceipt } = await supabase
      .from('receipts')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    let receiptData = existingReceipt

    // If receipt doesn't exist, create it (webhook might not have run yet)
    if (!receiptData) {
      const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`
      const receiptItems = (checkoutData.items || []).map((item: any) => ({
        description: item.name || 'Product',
        qty: item.quantity || 1,
        unitPrice: item.price || 0,
        total: (item.quantity || 1) * (item.price || 0),
      }))

      const { data: newReceipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          receipt_number: receiptNumber,
          receipt_date: new Date().toISOString().split('T')[0],
          customer_name: session.customer_details?.name || 'Customer',
          customer_email: session.customer_details?.email || '',
          customer_phone: session.customer_details?.phone || '',
          items: receiptItems,
          subtotal: checkoutData.subtotal || 0,
          tax: checkoutData.tax || 0,
          shipping: checkoutData.shipping || 0,
          grand_total: checkoutData.total || 0,
          stripe_session_id: sessionId,
        })
        .select()
        .single()

      if (receiptError) {
        console.error('Error creating receipt:', receiptError)
      } else {
        receiptData = newReceipt
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total ? session.amount_total / 100 : 0,
      },
      receipt: receiptData,
      checkout: checkoutData,
    })
  } catch (error: any) {
    console.error('Error verifying Stripe session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    )
  }
}

