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

    // Check minimum form fill time (at least 3 seconds)
    if (form_fill_time && form_fill_time < 3000) {
      console.warn('Suspicious: Form submitted too quickly', { form_fill_time, ip: clientIP, email: customer_email })
      submissionData.blocked_reason = 'Form submitted too quickly'
      await logSubmission(submissionData)
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
    } else {
      // In production, require CAPTCHA
      if (process.env.NODE_ENV === 'production') {
        submissionData.blocked_reason = 'CAPTCHA token missing'
        await logSubmission(submissionData)
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

