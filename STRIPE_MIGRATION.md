# Migrating to Stripe - Quick Guide

This guide will help you switch from the demo payment API to Stripe when you're ready for production.

## Current Setup

The website currently uses a **demo payment API** that simulates payment processing. All payments are simulated and no real charges are made.

## Steps to Migrate to Stripe

### 1. Install Stripe Package

```bash
npm install stripe
```

### 2. Get Stripe API Keys

1. Sign up at [stripe.com](https://stripe.com)
2. Get your test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

### 3. Replace `app/api/checkout/route.ts`

Replace the entire file with:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { items, total } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.story || `${item.fabric} from ${item.origin}`,
            images: item.images && item.images.length > 0 ? [item.images[0]] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/cart?canceled=true`,
      metadata: {
        order_total: total.toString(),
        item_count: items.length.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

### 4. Update `app/api/payment/process/route.ts`

Replace with Stripe payment intent confirmation, or delete this file if using Stripe Checkout (which handles payment processing automatically).

### 5. Update Components

**In `components/CartModal.tsx`**, change the redirect comment:
```typescript
// Redirect to Stripe Checkout
window.location.href = data.url
```

**In `components/ProductModal.tsx`**, same change:
```typescript
// Redirect to Stripe Checkout
window.location.href = data.url
```

### 6. Remove Demo Payment Page (Optional)

If using Stripe Checkout, you can delete `app/payment/page.tsx` since Stripe provides its own checkout page.

### 7. Update Success Page

The success page (`app/success/page.tsx`) should work as-is, but you may want to verify the session with Stripe:

```typescript
// Optional: Verify session with Stripe
const session = await stripe.checkout.sessions.retrieve(sessionId)
```

## Testing

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any 3-digit CVC

2. Monitor payments in [Stripe Dashboard](https://dashboard.stripe.com/test/payments)

## Notes

- Stripe Checkout handles the entire payment flow, so you may not need the custom payment page
- The demo payment API is kept simple to make migration easier
- All payment data should be handled securely - never log full card numbers

