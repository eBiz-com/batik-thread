import { NextRequest, NextResponse } from 'next/server'

// ============================================
// TEST MAILGUN CONFIGURATION
// This endpoint helps verify Mailgun setup
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || ''
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || ''
    const MAILGUN_BASE_URL = process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net'
    const MAILGUN_FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || `postmaster@${MAILGUN_DOMAIN}`

    const config = {
      MAILGUN_API_KEY: {
        present: !!MAILGUN_API_KEY,
        length: MAILGUN_API_KEY.length,
        preview: MAILGUN_API_KEY ? `${MAILGUN_API_KEY.substring(0, 10)}...` : 'NOT SET',
      },
      MAILGUN_DOMAIN: {
        present: !!MAILGUN_DOMAIN,
        value: MAILGUN_DOMAIN || 'NOT SET',
      },
      MAILGUN_BASE_URL: {
        present: !!MAILGUN_BASE_URL,
        value: MAILGUN_BASE_URL || 'NOT SET',
      },
      MAILGUN_FROM_EMAIL: {
        present: !!MAILGUN_FROM_EMAIL,
        value: MAILGUN_FROM_EMAIL || 'NOT SET',
      },
    }

    // Determine if Mailgun REST API is configured
    const USE_MAILGUN_REST = MAILGUN_API_KEY && MAILGUN_DOMAIN && MAILGUN_BASE_URL
    const isConfigured = USE_MAILGUN_REST

    // Test Mailgun API connection if configured
    let apiTest: any = null
    if (isConfigured) {
      try {
        const mailgunUrl = `${MAILGUN_BASE_URL}/v3/${MAILGUN_DOMAIN}`
        
        const response = await fetch(mailgunUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
          },
        })

        const contentType = response.headers.get('content-type')
        let responseData: any = {}

        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json()
        } else {
          responseData = { text: await response.text() }
        }

        apiTest = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: responseData,
        }
      } catch (error: any) {
        apiTest = {
          error: error.message,
          failed: true,
        }
      }
    }

    return NextResponse.json({
      configured: isConfigured,
      config,
      apiTest,
      message: isConfigured
        ? 'Mailgun appears to be configured. Check apiTest for connection status.'
        : 'Mailgun is not fully configured. Missing required environment variables.',
      instructions: {
        required: [
          'MAILGUN_API_KEY - Your Mailgun API key',
          'MAILGUN_DOMAIN - Your Mailgun domain (e.g., sandbox7451ed674a964e049495e86c65396791.mailgun.org)',
          'MAILGUN_BASE_URL - Mailgun API base URL (usually https://api.mailgun.net)',
          'MAILGUN_FROM_EMAIL - Email address to send from (usually postmaster@your-domain.mailgun.org)',
        ],
        whereToAdd: 'Vercel Dashboard → Your Project → Settings → Environment Variables',
        afterAdding: 'Redeploy your project for changes to take effect',
        sandboxNote: 'Sandbox domains can only send to authorized recipients. Add recipients in Mailgun Dashboard → Sending → Authorized Recipients',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to test Mailgun configuration',
        configured: false,
      },
      { status: 500 }
    )
  }
}

