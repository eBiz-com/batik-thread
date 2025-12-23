# reCAPTCHA Setup Guide

This guide explains how to set up Google reCAPTCHA for the custom request form to prevent spam and bot submissions.

## Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Sign in with your Google account
3. Click "Create" to register a new site
4. Fill in the form:
   - **Label**: Batik & Thread Custom Request Form (or any name you prefer)
   - **reCAPTCHA type**: Select "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - **Domains**: Add your domains:
     - `localhost` (for local development)
     - `batik-thread.vercel.app` (your Vercel domain)
     - Any custom domain you're using
5. Accept the reCAPTCHA Terms of Service
6. Click "Submit"

## Step 2: Get Your Keys

After creating the site, you'll receive:
- **Site Key** (public key) - Used in the frontend
- **Secret Key** (private key) - Used in the backend API

## Step 3: Add Environment Variables

### For Local Development

Create or update `.env.local` in your project root:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   - **Name**: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
     - **Value**: Your site key
     - **Environment**: Production, Preview, Development (select all)

   - **Name**: `RECAPTCHA_SECRET_KEY`
     - **Value**: Your secret key
     - **Environment**: Production, Preview, Development (select all)
     - **Mark as sensitive**: Yes (recommended)

4. Click "Save"
5. Redeploy your application for the changes to take effect

## Step 4: Test the Implementation

1. Visit your custom request form: `https://batik-thread.vercel.app/custom-request`
2. Fill out the form
3. You should see a reCAPTCHA checkbox at the bottom of the form
4. Complete the CAPTCHA verification
5. Submit the form - it should work correctly

## Development Mode

The code includes a fallback test key (`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`) that always passes verification. This is Google's official test key for development. However, you should still set up your own keys for production.

## Troubleshooting

### CAPTCHA not showing
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set correctly
- Verify the domain is added to your reCAPTCHA site configuration
- Check browser console for errors

### CAPTCHA verification failing
- Ensure `RECAPTCHA_SECRET_KEY` is set correctly in your environment variables
- Check that the secret key matches the site key
- Verify the domain matches what's configured in reCAPTCHA admin

### Form submission blocked
- Make sure CAPTCHA is completed before submitting
- Check that both environment variables are set
- Review server logs for CAPTCHA verification errors

## Security Notes

- Never commit your secret key to version control
- Always use environment variables for sensitive keys
- The secret key should only be used server-side (in API routes)
- The site key can be public (it's used in the frontend)

## Additional Resources

- [reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [react-google-recaptcha Documentation](https://github.com/dozoisch/react-google-recaptcha)

