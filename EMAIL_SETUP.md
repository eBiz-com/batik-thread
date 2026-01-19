# Email Setup Guide

This guide explains how to set up email sending for receipt emails. You can use:
- **Mailgun** (Recommended for production - best deliverability)
- **Gmail SMTP** (Simple setup, good for testing)
- **Demo Mode** (No setup required - simulates email sending)

## Quick Start - Demo Mode (No Setup Required)

**Demo Mode is enabled by default** - No configuration needed! The system will simulate email sending without actually sending emails.

To use Demo Mode:
- Just start the server - no environment variables needed
- Emails will be logged to the console
- Perfect for testing and development

## Mailgun Configuration (Recommended for Production)

Mailgun is the recommended email service for production use. It offers better deliverability, higher sending limits, and better analytics than Gmail SMTP.

### Step 1: Get Mailgun Account

1. Sign up for a free account at https://www.mailgun.com
2. Verify your account (free tier includes 5,000 emails/month for 3 months, then 1,000/month)
3. Go to **Sending** → **Domain Settings** in your Mailgun dashboard
4. You can use the sandbox domain for testing, or add your own domain for production

### Step 2: Get Mailgun Credentials

1. In Mailgun dashboard, go to **Sending** → **Domain Settings**
2. Find your domain (or use the sandbox domain)
3. Copy your **API Key** (starts with `key-` or similar)
4. Copy your **Domain** (e.g., `sandbox1234.mailgun.org` or your custom domain)

### Step 3: Set Environment Variables

Add the following to your `.env.local` file:

```env
# Mailgun Configuration (Recommended)
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here
MAILGUN_FROM_EMAIL=postmaster@your_mailgun_domain_here

# Or use sandbox for testing:
# MAILGUN_DOMAIN=sandbox1234.mailgun.org
# MAILGUN_FROM_EMAIL=postmaster@sandbox1234.mailgun.org
```

**Priority Order:**
- If `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` are set → Uses Mailgun
- Else if `GMAIL_PASS` is set → Uses Gmail SMTP
- Else → Uses Demo Mode

## Gmail SMTP Configuration (Alternative)

If you prefer to use Gmail SMTP instead of Mailgun:

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

# For Mailgun (Recommended - set these first)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=postmaster@your_domain

# For Gmail SMTP (Alternative - only used if Mailgun not configured)
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

