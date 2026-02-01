import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

// ============================================
// STRIPE CHECKOUT API
// Creates Stripe Checkout sessions with stock validation
// ============================================

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
    const { items, subtotal, tax, shipping, total } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 500 }
      )
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

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Get Stripe instance
    let stripe: Stripe
    try {
      stripe = getStripe()
    } catch (stripeError: any) {
      console.error('Error initializing Stripe:', stripeError)
      return NextResponse.json(
        { error: 'Payment service configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Create Stripe Checkout Session
    let session: Stripe.Checkout.Session
    try {
      // Build line items: products + tax + shipping
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        // Product items
        ...items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name || 'Product',
              description: item.story || `${item.fabric || ''} ${item.origin || ''}`.trim() || `Size: ${item.size || 'M'}`,
              // Don't include base64 images - they're too large and not valid URLs
              // Images are stored in database and can be displayed from there
            },
            unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
          },
          quantity: item.quantity || 1,
        })),
      ]

      // Add tax as a line item if applicable
      const calculatedTax = tax || 0
      if (calculatedTax > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Tax',
              description: 'Sales tax',
            },
            unit_amount: Math.round(calculatedTax * 100), // Convert to cents
          },
          quantity: 1,
        })
      }

      // Add shipping as a line item if applicable
      const calculatedShipping = shipping || 0
      if (calculatedShipping > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping',
              description: 'Shipping fee',
            },
            unit_amount: Math.round(calculatedShipping * 100), // Convert to cents
          },
          quantity: 1,
        })
      }

      session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        subtotal: (subtotal || total || 0).toString(),
        tax: (tax || 0).toString(),
        shipping: (shipping || 0).toString(),
        total: (total || subtotal || 0).toString(),
        item_count: items.length.toString(),
      },
      // Store minimal item data in payment intent metadata (for webhook fallback)
      // Only store essential fields to stay under Stripe's 500 char limit per value
      payment_intent_data: {
        metadata: {
          // Store only essential item data (id, name, quantity, size) - no images
          items: JSON.stringify(
            items.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity || 1,
              size: item.size || 'M',
              price: item.price || 0,
            }))
          ),
        },
      },
      })
    } catch (stripeError: any) {
      console.error('Stripe API error:', {
        type: stripeError.type,
        message: stripeError.message,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
      })
      
      // Provide user-friendly error messages
      if (stripeError.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: `Payment processing error: ${stripeError.message}` },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create payment session. Please try again.' },
        { status: 500 }
      )
    }

    // Store checkout session data in database for webhook processing
    try {
      const { error: dbError } = await supabase
        .from('checkout_sessions')
        .insert({
          session_id: session.id,
          items: items,
          subtotal: subtotal || total || 0,
          tax: tax || 0,
          shipping: shipping || 0,
          total: total || subtotal || 0,
          expires_at: new Date(session.expires_at * 1000).toISOString(), // Stripe expiry timestamp
        })

      if (dbError) {
        console.error('Error storing checkout session in database:', dbError)
        // Continue anyway - webhook can still process payment
      } else {
        console.log('✅ Checkout session stored in database:', session.id)
      }
    } catch (dbErr: any) {
      console.error('Error inserting checkout session:', dbErr)
      // Continue anyway
    }

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Unexpected error in checkout:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again or contact support.' },
      { status: 500 }
    )
  }
}
