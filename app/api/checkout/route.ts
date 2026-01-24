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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return demo payment URL with breakdown
    // Include items in URL as primary method (sessionStorage can be unreliable)
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    
    // Build URL with items encoded properly
    const baseParams = new URLSearchParams({
      session_id: sessionId,
      subtotal: (subtotal || total || 0).toString(),
      tax: (tax || 0).toString(),
      shipping: (shipping || 0).toString(),
      total: (total || subtotal || 0).toString(),
    })
    
    // Encode items in URL (primary method - more reliable than sessionStorage)
    // Use encodeURIComponent to properly encode the JSON string
    try {
      const itemsJson = JSON.stringify(items)
      const encodedItems = encodeURIComponent(itemsJson)
      baseParams.append('items', encodedItems)
      console.log('✅ Items encoded in URL, length:', encodedItems.length)
    } catch (e) {
      console.error('❌ Error encoding items in URL:', e)
    }
    
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
