# Stripe Webhook Setup Guide

## Step 1: Create Webhook Endpoint in Stripe Dashboard

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/test/webhooks
   - Make sure you're in **Test mode** (toggle in top right)

2. **Add Endpoint**
   - Click the **"+ Add endpoint"** button (top right)

3. **Configure Endpoint**
   - **Endpoint URL**: 
     ```
     https://batik-thread.vercel.app/api/webhooks/stripe
     ```
   - **Description** (optional): "Batik & Thread Payment Webhook"
   - **Events to send**: Click "Select events"
     - Check: `checkout.session.completed`
     - Click "Add events"

4. **Save Endpoint**
   - Click **"Add endpoint"** button

5. **Copy Webhook Signing Secret**
   - After creating, you'll see the endpoint details
   - Find **"Signing secret"** section
   - Click **"Reveal"** or **"Click to reveal"**
   - Copy the secret (starts with `whsec_...`)
   - **IMPORTANT**: Save this secret - you'll need it for Vercel

## Step 2: Add Webhook Secret to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dapos-projects-8556040f/batik-thread
   - Or navigate to your project

2. **Open Environment Variables**
   - Click **"Settings"** (top navigation)
   - Click **"Environment Variables"** (left sidebar)

3. **Add New Variable**
   - Click **"Add New"** button
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste the webhook secret you copied (starts with `whsec_...`)
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

## Step 3: Redeploy Your Project

### Option A: Redeploy from Vercel Dashboard (Recommended)

1. **Go to Deployments Tab**
   - In your Vercel project, click **"Deployments"** (top navigation)

2. **Redeploy Latest Deployment**
   - Find your latest deployment
   - Click the **three dots (⋯)** menu on the right
   - Click **"Redeploy"**
   - Confirm by clicking **"Redeploy"** again

### Option B: Push a New Commit (Alternative)

If you have uncommitted changes, commit and push:

```bash
git add .
git commit -m "Add Stripe webhook configuration"
git push origin main
```

This will automatically trigger a new deployment.

## Step 4: Test the Webhook

1. **Make a Test Purchase**
   - Go to your website
   - Add items to cart
   - Checkout with Stripe test card: `4242 4242 4242 4242`
   - Complete the payment

2. **Verify Webhook Received**
   - Go back to Stripe Dashboard → Webhooks
   - Click on your webhook endpoint
   - Check the **"Recent deliveries"** section
   - You should see a successful delivery (green checkmark)

3. **Verify Stock Reduction**
   - Check your admin dashboard
   - Product stock should be reduced
   - Transaction should appear in payments

## Troubleshooting

### Webhook Not Receiving Events

1. **Check Webhook URL**
   - Make sure it's: `https://batik-thread.vercel.app/api/webhooks/stripe`
   - No trailing slash

2. **Check Environment Variable**
   - Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel
   - Make sure it's enabled for Production

3. **Check Webhook Secret**
   - The secret must match exactly (no extra spaces)
   - It should start with `whsec_`

4. **Check Stripe Logs**
   - In Stripe Dashboard → Webhooks → Your endpoint
   - Click on failed deliveries to see error messages

### Webhook Returns 400 Error

- This usually means the webhook secret is wrong
- Double-check the secret in Vercel matches the one in Stripe

### Stock Not Reducing

- Check Vercel function logs for errors
- Verify the webhook is receiving `checkout.session.completed` events
- Check that items have `id` field in checkout session

## Important Notes

- **Test Mode vs Live Mode**: Make sure you're using test mode webhook secret for test mode, and live mode secret for production
- **Webhook Secret Security**: Never commit the webhook secret to git - it's already in `.gitignore`
- **Multiple Environments**: You can create separate webhooks for preview deployments if needed
