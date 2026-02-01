import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

// Removed submission_logs - using simple rate limiting instead

// Simple in-memory rate limiting (max 3 requests per IP per hour)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): { allowed: boolean; reason: string | null } {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  
  const record = rateLimitMap.get(ip)
  
  if (record) {
    // Check if rate limit window has expired
    if (now > record.resetTime) {
      // Reset the counter
      rateLimitMap.set(ip, { count: 1, resetTime: now + oneHour })
      return { allowed: true, reason: null }
    }
    
    // Check if limit exceeded
    if (record.count >= 3) {
      const minutesLeft = Math.ceil((record.resetTime - now) / 60000)
      return { 
        allowed: false, 
        reason: `Too many requests. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` 
      }
    }
    
    // Increment counter
    record.count++
    rateLimitMap.set(ip, record)
  } else {
    // First request from this IP
    rateLimitMap.set(ip, { count: 1, resetTime: now + oneHour })
  }
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    const keysToDelete: string[] = []
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => rateLimitMap.delete(key))
  }
  
  return { allowed: true, reason: null }
}

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not set - using test mode')
    // In test mode, allow if token exists (for development)
    return !!(token && token.length > 10)
  }

  if (!token || token.length < 10) {
    return false
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Error verifying Turnstile:', error)
    return false
  }
}

// Removed duplicate check - rate limiting is sufficient

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent')

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
      form_fill_time,
      company, // Honeypot field
      turnstile_token,
    } = body

    // Honeypot check - if filled, it's a bot
    if (company) {
      console.warn('Bot detected: honeypot field was filled', { ip: clientIP, email: customer_email })
      return NextResponse.json(
        { success: false, error: 'Invalid submission detected' },
        { status: 400 }
      )
    }

    // Rate limiting check (max 3 requests per IP per hour)
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      console.warn('Rate limit exceeded', { ip: clientIP, email: customer_email })
      return NextResponse.json(
        { success: false, error: rateLimit.reason },
        { status: 429 }
      )
    }

    // Verify Turnstile token (only if TURNSTILE_SECRET_KEY is configured)
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecretKey) {
      // Turnstile is configured - require valid token
      if (!turnstile_token) {
        console.warn('Turnstile token missing but secret key is configured', { ip: clientIP, email: customer_email })
        return NextResponse.json(
          { success: false, error: 'Security verification is required. Please refresh and try again.' },
          { status: 400 }
        )
      }

      const isValidTurnstile = await verifyTurnstile(turnstile_token, clientIP)
      if (!isValidTurnstile) {
        console.warn('Turnstile verification failed', { ip: clientIP, email: customer_email })
        return NextResponse.json(
          { success: false, error: 'Security verification failed. Please refresh the page and try again.' },
          { status: 400 }
        )
      }
    } else {
      // Turnstile not configured - allow submission without verification
      console.warn('TURNSTILE_SECRET_KEY not configured - allowing submission without Turnstile verification')
    }

    // Check minimum form fill time (at least 3 seconds)
    if (!form_fill_time || form_fill_time < 3000) {
      console.warn('Suspicious: Form submitted too quickly', { form_fill_time, ip: clientIP, email: customer_email })
      return NextResponse.json(
        { success: false, error: 'Please take more time to fill out the form completely.' },
        { status: 400 }
      )
    }

    // Check for suspicious user agents (bots, scrapers, etc.)
    const suspiciousUserAgents = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /postman/i,
      /insomnia/i,
      /httpie/i,
    ]
    if (userAgent && suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
      console.warn('Suspicious user agent detected:', { userAgent, ip: clientIP, email: customer_email })
      return NextResponse.json(
        { success: false, error: 'Invalid submission detected' },
        { status: 400 }
      )
    }

    // Check for missing or suspicious headers
    const origin = request.headers.get('origin')
    
    if (origin && !origin.includes('batik-thread') && !origin.includes('localhost')) {
      console.warn('Suspicious origin detected:', { origin, ip: clientIP, email: customer_email })
      return NextResponse.json(
        { success: false, error: 'Invalid submission source' },
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
    const blockedEmails = [
      'test@test.com',
      'test@example.com',
      'spam@spam.com',
      'admin@test.com',
      'user@test.com',
    ]
    
    const emailLower = customer_email.toLowerCase().trim()
    
    // Exact match blocking
    if (blockedEmails.includes(emailLower)) {
      console.warn('Blocked email detected:', { email: customer_email, ip: clientIP })
      return NextResponse.json(
        { success: false, error: 'This email address is not allowed. Please use a valid email address.' },
        { status: 400 }
      )
    }

    // Check for suspicious patterns in email
    const suspiciousPatterns = [
      /^test\d*@/i,           // test, test1, test2, etc.
      /^admin\d*@/i,         // admin, admin1, etc.
      /^user\d*@/i,          // user, user1, etc.
      /@test\./i,             // anything@test.com, anything@test.org, etc.
      /@example\./i,          // anything@example.com
    ]
    
    if (suspiciousPatterns.some(pattern => pattern.test(emailLower))) {
      console.warn('Suspicious email pattern detected:', { email: customer_email, ip: clientIP })
      return NextResponse.json(
        { success: false, error: 'This email address is not allowed. Please use a valid email address.' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !event_date || !quantity || !sizes || !description) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Validate field lengths
    if (customer_name.length < 2 || customer_name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid name format' },
        { status: 400 }
      )
    }
    if (description.length < 10 || description.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Description must be between 10 and 5000 characters' },
        { status: 400 }
      )
    }
    if (parseInt(quantity) < 1 || parseInt(quantity) > 10000) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 10,000' },
        { status: 400 }
      )
    }

    // Validate and limit image sizes
    let validatedStyleImages: string[] = []
    if (style_images && Array.isArray(style_images)) {
      const maxImageSize = 5 * 1024 * 1024 // 5MB per image (base64)
      const maxTotalSize = 20 * 1024 * 1024 // 20MB total for all images
      
      let totalSize = 0
      
      for (let i = 0; i < style_images.length; i++) {
        const image = style_images[i]
        if (typeof image === 'string') {
          const imageSize = new Blob([image]).size
          
          if (imageSize > maxImageSize) {
            console.warn(`Image ${i + 1} too large: ${(imageSize / 1024 / 1024).toFixed(2)}MB, skipping`)
            continue
          }
          
          if (totalSize + imageSize > maxTotalSize) {
            console.warn(`Total image size limit reached, skipping remaining ${style_images.length - i} images`)
            break
          }
          
          validatedStyleImages.push(image)
          totalSize += imageSize
        }
      }
      
      console.log(`Image validation: ${validatedStyleImages.length}/${style_images.length} images accepted, total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
    }

    // Sanitize inputs - remove potential XSS
    const sanitize = (str: string) => str.trim().replace(/[<>]/g, '')
    const sanitizedData = {
      customer_name: sanitize(customer_name),
      customer_email: sanitize(customer_email).toLowerCase(),
      customer_phone: sanitize(customer_phone),
      event_name: event_name ? sanitize(event_name) : null, // Allow null for optional field
      event_date: sanitize(event_date),
      sizes: sanitize(sizes),
      description: sanitize(description),
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
          style_images: validatedStyleImages,
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

