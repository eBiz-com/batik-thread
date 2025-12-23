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

// Log submission attempt
async function logSubmission(data: {
  ip_address: string
  user_agent: string | null
  email: string
  customer_name: string
  form_fill_time: number | undefined
  captcha_passed: boolean
  honeypot_triggered: boolean
  blocked_reason: string | null
  success: boolean
  request_id: number | null
  device_fingerprint: string | undefined
}) {
  try {
    await supabase.from('submission_logs').insert([{
      ...data,
      created_at: new Date().toISOString(),
    }])
  } catch (error) {
    console.error('Error logging submission:', error)
  }
}

// Check rate limiting
async function checkRateLimit(ip: string, email: string): Promise<{ allowed: boolean; reason: string | null }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  // Check IP-based rate limit (max 3 submissions per hour)
  const { count: ipCount } = await supabase
    .from('submission_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo)
  
  if (ipCount && ipCount >= 3) {
    return { allowed: false, reason: 'Too many submissions from this IP address. Please try again later.' }
  }

  // Check email-based rate limit (max 2 submissions per hour)
  const { count: emailCount } = await supabase
    .from('submission_logs')
    .select('*', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .gte('created_at', oneHourAgo)
  
  if (emailCount && emailCount >= 2) {
    return { allowed: false, reason: 'Too many submissions with this email. Please try again later.' }
  }

  // Check for blocked IPs (more than 5 failed attempts in last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: failedCount } = await supabase
    .from('submission_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('success', false)
    .gte('created_at', oneDayAgo)
  
  if (failedCount && failedCount >= 5) {
    return { allowed: false, reason: 'This IP address has been temporarily blocked due to suspicious activity.' }
  }

  return { allowed: true, reason: null }
}

async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  // ALWAYS require CAPTCHA - no exceptions
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not set - BLOCKING submission')
    return false // Block if no secret key
  }

  if (!token || token.length < 20) {
    console.warn('Invalid CAPTCHA token format')
    return false
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
    
    // Check score for v3 (if applicable) or success for v2
    if (data.success === true) {
      // Additional check: score should be > 0.5 for v3
      if (data.score !== undefined && data.score < 0.5) {
        console.warn('CAPTCHA score too low:', data.score)
        return false
      }
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error)
    return false
  }
}

// Check for duplicate submissions
async function checkDuplicateSubmission(email: string, phone: string, eventName: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data } = await supabase
      .from('custom_requests')
      .select('id')
      .eq('customer_email', email.toLowerCase())
      .eq('customer_phone', phone)
      .eq('event_name', eventName)
      .gte('created_at', oneHourAgo)
      .limit(1)
    
    return data ? data.length > 0 : false
  } catch (error) {
    console.error('Error checking duplicate:', error)
    return false // If check fails, allow submission but log it
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  const userAgent = request.headers.get('user-agent')
  let submissionData: any = {
    ip_address: clientIP,
    user_agent: userAgent,
    email: '',
    customer_name: '',
    form_fill_time: undefined,
    captcha_passed: false,
    honeypot_triggered: false,
    blocked_reason: null,
    success: false,
    request_id: null,
    device_fingerprint: undefined,
  }

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
      device_fingerprint,
    } = body

    submissionData.email = customer_email?.toLowerCase() || ''
    submissionData.customer_name = customer_name || ''
    submissionData.form_fill_time = form_fill_time
    submissionData.device_fingerprint = device_fingerprint

    // Honeypot check - if filled, it's a bot
    if (website) {
      console.warn('Bot detected: honeypot field was filled', { ip: clientIP, email: customer_email })
      submissionData.honeypot_triggered = true
      submissionData.blocked_reason = 'Honeypot field filled'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'Invalid submission detected' },
        { status: 400 }
      )
    }

    // Rate limiting check
    if (customer_email) {
      const rateLimit = await checkRateLimit(clientIP, customer_email)
      if (!rateLimit.allowed) {
        submissionData.blocked_reason = rateLimit.reason || 'Rate limit exceeded'
        await logSubmission(submissionData)
        return NextResponse.json(
          { success: false, error: rateLimit.reason },
          { status: 429 }
        )
      }
    }

    // Check minimum form fill time (at least 10 seconds - stricter)
    if (!form_fill_time || form_fill_time < 10000) {
      console.warn('Suspicious: Form submitted too quickly', { form_fill_time, ip: clientIP, email: customer_email })
      submissionData.blocked_reason = `Form submitted too quickly (${form_fill_time}ms, minimum 10000ms)`
      await logSubmission(submissionData)
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
      submissionData.blocked_reason = 'Suspicious user agent detected'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'Invalid submission detected' },
        { status: 400 }
      )
    }

    // Check for missing or suspicious headers
    const referer = request.headers.get('referer')
    const origin = request.headers.get('origin')
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://batik-thread.vercel.app'
    
    if (origin && !origin.includes('batik-thread') && !origin.includes('localhost')) {
      console.warn('Suspicious origin detected:', { origin, ip: clientIP, email: customer_email })
      submissionData.blocked_reason = 'Invalid origin header'
      await logSubmission(submissionData)
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
    const blockedEmails = ['test@test.com', 'test@example.com', 'spam@spam.com', 'admin@test.com', 'user@test.com']
    if (blockedEmails.includes(customer_email.toLowerCase())) {
      console.warn('Blocked email detected:', { email: customer_email, ip: clientIP })
      submissionData.blocked_reason = 'Blocked email address'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check for suspicious patterns in email
    const suspiciousPatterns = [
      /^test\d*@/i,
      /^admin\d*@/i,
      /^user\d*@/i,
      /@test\./i,
      /@example\./i,
    ]
    if (suspiciousPatterns.some(pattern => pattern.test(customer_email))) {
      console.warn('Suspicious email pattern detected:', { email: customer_email, ip: clientIP })
      submissionData.blocked_reason = 'Suspicious email pattern'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate required fields with stricter checks
    if (!customer_name || !customer_email || !customer_phone || !event_name || !event_date || !quantity || !sizes || !description) {
      submissionData.blocked_reason = 'Missing required fields'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Check for duplicate submissions (same email, phone, event within 1 hour)
    const isDuplicate = await checkDuplicateSubmission(customer_email, customer_phone, event_name)
    if (isDuplicate) {
      console.warn('Duplicate submission detected:', { email: customer_email, ip: clientIP })
      submissionData.blocked_reason = 'Duplicate submission detected'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'A similar request was recently submitted. Please wait before submitting again.' },
        { status: 400 }
      )
    }

    // Validate field lengths to prevent spam
    if (customer_name.length < 2 || customer_name.length > 100) {
      submissionData.blocked_reason = 'Invalid name length'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'Invalid name format' },
        { status: 400 }
      )
    }
    if (description.length < 10 || description.length > 5000) {
      submissionData.blocked_reason = 'Invalid description length'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'Description must be between 10 and 5000 characters' },
        { status: 400 }
      )
    }
    if (parseInt(quantity) < 1 || parseInt(quantity) > 10000) {
      submissionData.blocked_reason = 'Invalid quantity'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 10,000' },
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

    // ALWAYS require CAPTCHA - no exceptions
    if (!captcha_token) {
      console.warn('CAPTCHA token missing', { ip: clientIP, email: customer_email })
      submissionData.blocked_reason = 'CAPTCHA token missing'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'CAPTCHA verification is required. Please complete the CAPTCHA.' },
        { status: 400 }
      )
    }

    const isValidCaptcha = await verifyCaptcha(captcha_token)
    submissionData.captcha_passed = isValidCaptcha
    if (!isValidCaptcha) {
      console.warn('CAPTCHA verification failed', { ip: clientIP, email: customer_email })
      submissionData.blocked_reason = 'CAPTCHA verification failed'
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      )
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
      submissionData.blocked_reason = 'Database error: ' + error.message
      await logSubmission(submissionData)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to submit request' },
        { status: 500 }
      )
    }

    // Log successful submission
    submissionData.success = true
    submissionData.request_id = data?.[0]?.id || null
    await logSubmission(submissionData)

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: 'Custom request submitted successfully',
    })
  } catch (error: any) {
    console.error('Error processing custom request:', error)
    submissionData.blocked_reason = 'Server error: ' + error.message
    await logSubmission(submissionData).catch(() => {})
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

