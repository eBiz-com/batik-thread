import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// ============================================
// EMAIL RECEIPT API
// Sends receipt via email using Gmail SMTP or Demo Mode
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { email, receiptData } = await request.json()

    if (!email || !receiptData) {
      return NextResponse.json(
        { success: false, error: 'Email and receipt data are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if demo mode is enabled or if Gmail credentials are missing
    const DEMO_MODE = process.env.EMAIL_DEMO_MODE === 'true' || !process.env.GMAIL_PASS
    const GMAIL_USER = process.env.GMAIL_USER || 'ddicservicellc@gmail.com'
    const GMAIL_PASS = process.env.GMAIL_PASS || ''

    // Generate HTML email content with watermark (used in both demo and production)
    const itemsHtml = receiptData.items.map((item: any) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.qty}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.total.toFixed(2)}</td>
      </tr>
    `).join('')

    const customerName = receiptData.customerInfo?.name || 'Valued Customer'
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            position: relative;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(0, 0, 0, 0.08);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
            white-space: nowrap;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            position: relative;
            z-index: 1;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #d4af37; 
            padding-bottom: 20px; 
            margin-bottom: 20px; 
          }
          .header h1 { 
            color: #d4af37; 
            margin: 0; 
          }
          .greeting {
            margin: 20px 0;
            font-size: 16px;
          }
          .info { 
            background: #f9f9f9; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          th { 
            background: #f0f0f0; 
            padding: 10px; 
            text-align: left; 
            border: 1px solid #ddd; 
          }
          td { 
            padding: 8px; 
            border: 1px solid #ddd; 
          }
          .total { 
            background: #d4af37; 
            color: #000; 
            font-size: 24px; 
            font-weight: bold; 
            text-align: center; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 5px; 
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #666; 
            font-size: 12px; 
          }
          .signature {
            margin-top: 20px;
            font-style: italic;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="watermark">TEST RECEIPT</div>
        <div class="container">
          <div class="header">
            <h1>Batik & Thread</h1>
            <p>Location: Kissimmee, FL<br>Phone: (321) 961-6566</p>
          </div>
          
          <div class="greeting">
            <p>Dear ${customerName},</p>
            <p>Thank you for your purchase! Please find your receipt below.</p>
          </div>
          
          <div class="info">
            <p><strong>Receipt #:</strong> ${receiptData.receiptNumber}</p>
            <p><strong>Date:</strong> ${new Date(receiptData.date).toLocaleDateString()}</p>
          </div>

          <div class="info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${receiptData.customerInfo.name}</p>
            ${receiptData.customerInfo.phone ? `<p><strong>Phone:</strong> ${receiptData.customerInfo.phone}</p>` : ''}
            ${receiptData.customerInfo.address ? `<p><strong>Address:</strong> ${receiptData.customerInfo.address}</p>` : ''}
          </div>

          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="info">
            <p><strong>Subtotal:</strong> $${receiptData.subtotal.toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${receiptData.shipping.toFixed(2)}</p>
            <p><strong>Tax (${receiptData.taxPercent.toFixed(1)}%):</strong> $${receiptData.tax.toFixed(2)}</p>
            <div class="total">Total: $${receiptData.total.toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Batik & Thread!</p>
            <p>Please keep this receipt for your records.</p>
            <div class="signature">
              <p>Best regards,<br>Batik & Thread Admin</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Email subject with receipt number
    const subject = `Your Receipt from Batik & Thread - ${receiptData.receiptNumber}`

    // Demo Mode - Simulate email sending without actual SMTP
    if (DEMO_MODE) {
      console.log('=== EMAIL RECEIPT (DEMO MODE) ===')
      console.log('To:', email)
      console.log('Subject:', subject)
      console.log('Receipt Number:', receiptData.receiptNumber)
      console.log('Customer Name:', receiptData.customerInfo?.name)
      console.log('Total:', receiptData.total)
      console.log('===========================')

      // Simulate email delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: 'Receipt email sent successfully (Demo Mode - Email simulated)',
        demo: true,
        emailPreview: {
          to: email,
          subject: subject,
          html: emailHtml,
        },
      })
    }

    // Production Mode - Send actual email via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    })

    // Send email
    const mailOptions = {
      from: `"Batik & Thread" <${GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: emailHtml,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully:', {
      to: email,
      subject: subject,
      messageId: info.messageId,
    })

    return NextResponse.json({
      success: true,
      message: 'Receipt email sent successfully',
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
