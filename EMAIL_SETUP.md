# Email Setup Guide

This guide explains how to set up email sending for receipt emails. You can use Demo Mode (no setup required) or configure Gmail SMTP for actual email sending.

## Quick Start - Demo Mode (No Setup Required)

**Demo Mode is enabled by default** - No configuration needed! The system will simulate email sending without actually sending emails.

To use Demo Mode:
- Just start the server - no environment variables needed
- Emails will be logged to the console
- Perfect for testing and development

## Gmail SMTP Configuration (For Actual Email Sending)

If you want to send actual emails, you can configure Gmail SMTP.

### Step 1: Get Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Go to **App passwords**: https://myaccount.google.com/apppasswords
4. Select **Mail** and **Other (Custom name)**
5. Enter "Batik & Thread Receipts" as the name
6. Click **Generate**
7. Copy the 16-character app password (you'll use this instead of your regular Gmail password)

### Step 2: Set Environment Variables

Add the following to your `.env.local` file:

```env
# For Demo Mode (default - no setup needed)
EMAIL_DEMO_MODE=true

# For Gmail SMTP (actual email sending)
GMAIL_USER=ddicservicellc@gmail.com
GMAIL_PASS=your_16_character_app_password_here
```

**Note:** 
- If `EMAIL_DEMO_MODE=true` or `GMAIL_PASS` is not set, the system will use Demo Mode
- Demo Mode simulates email sending without actually sending emails
- Perfect for testing and development

**Important:** 
- Never commit `.env.local` to version control
- Use the App Password, not your regular Gmail password
- The App Password is 16 characters with spaces (you can include or remove spaces)

### Step 3: Test Email Sending

1. Start your development server: `npm run dev`
2. Complete a test purchase
3. On the success page, enter an email address
4. Click "Send Email"
5. Check the recipient's inbox for the receipt

## Email Features

- **Subject**: Includes receipt number (e.g., "Your Receipt from Batik & Thread - RCP-123456")
- **Greeting**: Personalized with buyer's name (e.g., "Dear John Doe,")
- **Signature**: Signed from "Batik & Thread Admin"
- **Watermark**: "TEST RECEIPT" watermark on all receipts
- **HTML Format**: Professional formatted email with all receipt details

## Alternative Email Services

If you prefer not to use Gmail, you can use other email services:

### Option 1: Mailtrap (Free Testing SMTP)
1. Sign up at https://mailtrap.io (free tier available)
2. Get your SMTP credentials from Mailtrap inbox
3. Update the email route to use Mailtrap SMTP settings

### Option 2: Resend (Free Tier Available)
1. Sign up at https://resend.com
2. Get your API key
3. Update the email route to use Resend API

### Option 3: SendGrid (Free Tier Available)
1. Sign up at https://sendgrid.com
2. Get your API key
3. Update the email route to use SendGrid API

## Troubleshooting

### Demo Mode vs Production Mode
- **Demo Mode**: No credentials needed, emails are simulated
- **Production Mode**: Requires Gmail credentials for actual sending
- Check server console logs to see which mode is active

### Error: "Email service not configured"
- This won't appear in Demo Mode
- If you want actual email sending, set `GMAIL_PASS` in `.env.local`
- Or keep `EMAIL_DEMO_MODE=true` for testing

### Error: "Invalid login credentials"
- Verify you're using the App Password, not your regular password
- Make sure 2-Step Verification is enabled on your Google account
- Regenerate the App Password if needed

### Emails not sending
- Check your internet connection
- Verify Gmail account is active
- Check server logs for detailed error messages
- Ensure the recipient email is valid

## Production Considerations

For production, consider:
- Using a dedicated email service (SendGrid, Resend, AWS SES)
- Setting up SPF/DKIM records for better deliverability
- Using a custom domain email address
- Implementing email queue for high volume

