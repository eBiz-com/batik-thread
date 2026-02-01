import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

// ============================================
// STRIPE WEBHOOK HANDLER
// Processes successful payments and reduces stock
// ============================================

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Initialize Stripe (only runs server-side in API routes)
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  // Initialize Stripe with default API version (latest stable)
  return new Stripe(secretKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      
      console.log('✅ Payment successful for session:', session.id)

      // Retrieve items from checkout_sessions table
      const { data: checkoutData, error: checkoutError } = await supabase
        .from('checkout_sessions')
        .select('items')
        .eq('session_id', session.id)
        .single()

      if (checkoutError || !checkoutData) {
        console.error('Error fetching checkout session:', checkoutError)
        // Try to get items from payment intent metadata as fallback
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent as string
          )
          if (paymentIntent.metadata?.items) {
            try {
              const items = JSON.parse(paymentIntent.metadata.items)
              await processStockReduction(items, session.id)
            } catch (parseError) {
              console.error('Error parsing items from metadata:', parseError)
            }
          }
        }
      } else {
        await processStockReduction(checkoutData.items, session.id)
      }

      // Create transaction record
      await createTransactionRecord(session)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function processStockReduction(items: any[], sessionId: string) {
  console.log(`📦 Processing stock reduction for ${items.length} items (session: ${sessionId})`)

  for (const item of items) {
    if (!item.id) {
      console.warn('⚠️ Item missing ID, skipping stock reduction:', item)
      continue
    }

    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock, stock_by_size')
        .eq('id', item.id)
        .single()

      if (fetchError || !product) {
        console.error(`❌ Product ${item.id} not found:`, fetchError)
        continue
      }

      const size = item.size || 'M'
      const quantity = item.quantity || 1

      // Reduce stock_by_size if it exists
      if (product.stock_by_size && typeof product.stock_by_size === 'object') {
        const stockBySize = product.stock_by_size as { [key: string]: number }
        const currentStock = stockBySize[size] || 0

        if (currentStock < quantity) {
          console.warn(`⚠️ Insufficient stock for ${item.name} (${size}): ${currentStock} < ${quantity}`)
        }

        const newStock = Math.max(0, currentStock - quantity)
        stockBySize[size] = newStock

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_by_size: stockBySize })
          .eq('id', item.id)

        if (updateError) {
          console.error(`❌ Error updating stock_by_size for ${item.id}:`, updateError)
        } else {
          console.log(`✅ Reduced stock for ${item.name} (${size}): ${currentStock} → ${newStock}`)
        }
      } else {
        // Fallback to legacy stock field
        const currentStock = product.stock || 0
        const newStock = Math.max(0, currentStock - quantity)

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.id)

        if (updateError) {
          console.error(`❌ Error updating stock for ${item.id}:`, updateError)
        } else {
          console.log(`✅ Reduced stock for ${item.name}: ${currentStock} → ${newStock}`)
        }
      }
    } catch (error: any) {
      console.error(`❌ Error processing stock for item ${item.id}:`, error)
    }
  }
}

async function createTransactionRecord(session: any) {
  try {
    const amount = session.amount_total ? session.amount_total / 100 : 0 // Convert from cents

    const transactionData = {
      receipt_number: `RCP-${Date.now().toString().slice(-6)}`,
      customer_name: session.customer_details?.name || 'Customer',
      customer_email: session.customer_details?.email || '',
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: amount,
      payment_status: 'completed',
      payment_method: 'stripe',
      stripe_session_id: session.id,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('transactions')
      .insert(transactionData)

    if (error) {
      console.error('Error creating transaction record:', error)
    } else {
      console.log('✅ Transaction record created')
    }
  } catch (error: any) {
    console.error('Error creating transaction record:', error)
  }
}

