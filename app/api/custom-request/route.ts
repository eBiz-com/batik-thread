import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  // If no secret key is set, skip verification (for development)
  // In production, you should always have a secret key
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not set, skipping CAPTCHA verification')
    return true // Allow in development
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customer_name,
      customer_email,
      customer_phone,
      event_name,
      event_date,
      quantity,
      sizes,
      description,
      style_images,
      captcha_token,
      form_fill_time,
      website, // Honeypot field
    } = body

    // Honeypot check - if filled, it's a bot
    if (website) {
      console.warn('Bot detected: honeypot field was filled')
      return NextResponse.json(
        { success: false, error: 'Invalid submission detected' },
        { status: 400 }
      )
    }

    // Check minimum form fill time (at least 3 seconds)
    if (form_fill_time && form_fill_time < 3000) {
      console.warn('Suspicious: Form submitted too quickly', form_fill_time)
      return NextResponse.json(
        { success: false, error: 'Form submitted too quickly. Please try again.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (customer_email && !emailRegex.test(customer_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Block known test/spam emails
    const blockedEmails = ['test@test.com', 'test@example.com', 'spam@spam.com']
    if (blockedEmails.includes(customer_email.toLowerCase())) {
      console.warn('Blocked email detected:', customer_email)
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !event_name || !event_date || !quantity || !sizes || !description) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Sanitize inputs - remove potential XSS
    const sanitize = (str: string) => str.trim().replace(/[<>]/g, '')
    const sanitizedData = {
      customer_name: sanitize(customer_name),
      customer_email: sanitize(customer_email).toLowerCase(),
      customer_phone: sanitize(customer_phone),
      event_name: sanitize(event_name),
      event_date: sanitize(event_date),
      sizes: sanitize(sizes),
      description: sanitize(description),
    }

    // Verify CAPTCHA
    if (captcha_token) {
      const isValidCaptcha = await verifyCaptcha(captcha_token)
      if (!isValidCaptcha) {
        return NextResponse.json(
          { success: false, error: 'CAPTCHA verification failed. Please try again.' },
          { status: 400 }
        )
      }
    } else {
      // In production, require CAPTCHA
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'CAPTCHA verification is required' },
          { status: 400 }
        )
      }
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('custom_requests')
      .insert([
        {
          customer_name: sanitizedData.customer_name,
          customer_email: sanitizedData.customer_email,
          customer_phone: sanitizedData.customer_phone,
          event_name: sanitizedData.event_name,
          event_date: sanitizedData.event_date,
          quantity: parseInt(quantity),
          sizes: sanitizedData.sizes,
          description: sanitizedData.description,
          style_images: style_images || [],
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Error inserting custom request:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to submit request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: 'Custom request submitted successfully',
    })
  } catch (error: any) {
    console.error('Error processing custom request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

