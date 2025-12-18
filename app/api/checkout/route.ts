import { NextRequest, NextResponse } from 'next/server'

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

    // Generate a demo session ID
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return demo payment URL with breakdown
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const params = new URLSearchParams({
      session_id: sessionId,
      subtotal: (subtotal || total || 0).toString(),
      tax: (tax || 0).toString(),
      shipping: (shipping || 0).toString(),
      total: (total || subtotal || 0).toString(),
    })
    const paymentUrl = `${origin}/payment?${params.toString()}`

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
