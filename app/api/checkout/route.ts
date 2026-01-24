import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ============================================
// DEMO PAYMENT API - Simulates payment processing
// To switch to Stripe later, replace this file with Stripe integration
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { items, subtotal, tax, shipping, total } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Validate stock availability before checkout
    for (const item of items) {
      if (item.id) {
        const { data: product, error } = await supabase
          .from('products')
          .select('stock, stock_by_size')
          .eq('id', item.id)
          .single()

        if (error || !product) {
          return NextResponse.json(
            { error: `Product ${item.name || item.id} not found` },
            { status: 400 }
          )
        }

        const size = item.size || 'M'
        const quantity = item.quantity || 1

        // Check stock_by_size first
        if (product.stock_by_size && typeof product.stock_by_size === 'object') {
          const sizeStock = (product.stock_by_size as { [key: string]: number })[size] || 0
          if (sizeStock < quantity) {
            return NextResponse.json(
              { 
                error: `Insufficient stock for ${item.name || 'item'}. Only ${sizeStock} available in size ${size}.`,
                outOfStock: true,
                redirectTo: '/custom-request'
              },
              { status: 400 }
            )
          }
        } else if ((product.stock || 0) < quantity) {
          return NextResponse.json(
            { 
              error: `Insufficient stock for ${item.name || 'item'}. Only ${product.stock || 0} available.`,
              outOfStock: true,
              redirectTo: '/custom-request'
            },
            { status: 400 }
          )
        }
      }
    }

    // Generate a demo session ID
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Store items in database to avoid URL length limits (414 error)
    // Items will be fetched by session_id on the payment page
    // If table doesn't exist, sessionStorage will be used as fallback
    try {
      const { error: dbError } = await supabase
        .from('checkout_sessions')
        .insert({
          session_id: sessionId,
          items: items,
          subtotal: subtotal || total || 0,
          tax: tax || 0,
          shipping: shipping || 0,
          total: total || subtotal || 0,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour expiry
        })

      if (dbError) {
        // Check if it's a "table doesn't exist" error
        if (dbError.code === 'PGRST116' || dbError.message?.includes('does not exist') || dbError.message?.includes('relation') || dbError.message?.includes('table')) {
          console.warn('⚠️ Checkout sessions table does not exist. Using sessionStorage fallback.')
          console.warn('💡 To enable database storage, run CREATE_CHECKOUT_SESSIONS_TABLE.sql in Supabase SQL Editor')
        } else {
          console.error('Error storing checkout session:', dbError)
        }
        // Continue - sessionStorage will be used as fallback
      } else {
        console.log('✅ Checkout session stored in database:', sessionId)
      }
    } catch (dbErr: any) {
      // If table doesn't exist or any other error, continue with sessionStorage fallback
      if (dbErr?.code === 'PGRST116' || dbErr?.message?.includes('does not exist') || dbErr?.message?.includes('relation')) {
        console.warn('⚠️ Checkout sessions table does not exist. Using sessionStorage fallback.')
      } else {
        console.error('Error inserting checkout session:', dbErr)
      }
      // Continue anyway - sessionStorage will be used as fallback
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return demo payment URL with breakdown (no items in URL - fetched from DB)
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const baseParams = new URLSearchParams({
      session_id: sessionId,
      subtotal: (subtotal || total || 0).toString(),
      tax: (tax || 0).toString(),
      shipping: (shipping || 0).toString(),
      total: (total || subtotal || 0).toString(),
    })
    
    const paymentUrl = `${origin}/payment?${baseParams.toString()}`

    return NextResponse.json({ 
      sessionId,
      url: paymentUrl,
      demo: true // Flag to indicate this is a demo payment
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
