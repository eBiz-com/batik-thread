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
    } = body

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !event_name || !event_date || !quantity || !sizes || !description) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      )
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
          customer_name,
          customer_email,
          customer_phone,
          event_name,
          event_date,
          quantity: parseInt(quantity),
          sizes,
          description,
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

