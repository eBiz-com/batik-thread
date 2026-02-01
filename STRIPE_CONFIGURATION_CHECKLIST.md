# Stripe Configuration Checklist

## ✅ Code Configuration (Fixed)

1. **Package.json** ✅
   - `stripe: ^17.0.0` is in dependencies

2. **API Routes** ✅
   - All routes use proper Stripe import (not dynamic)
   - Singleton pattern for Stripe instance
   - Proper error handling

3. **Next.js Config** ✅
   - Webpack configured for server-side only packages

## 🔍 Environment Variables Required in Vercel

Go to: **Vercel → Settings → Environment Variables**

### Required Variables:

1. **STRIPE_SECRET_KEY**
   - Value: `sk_test_...` (from Stripe Dashboard)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **CRITICAL**: Must be set for build to work

2. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Value: `pk_test_...` (from Stripe Dashboard)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **Note**: Safe to expose (public key)

3. **STRIPE_WEBHOOK_SECRET** (Optional for initial testing)
   - Value: `whsec_...` (from Stripe Webhook settings)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - **Note**: Only needed for webhook processing

## 🧪 Testing Steps

### 1. Verify Environment Variables
- [ ] `STRIPE_SECRET_KEY` is set in Vercel
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in Vercel
- [ ] Both are enabled for Production environment

### 2. Test Checkout Flow
1. Go to your live site
2. Add items to cart
3. Click "Checkout"
4. **Expected**: Redirect to Stripe Checkout page (not demo payment)
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. **Expected**: Redirect to success page with receipt

### 3. Check for Errors
- Check browser console for errors
- Check Vercel function logs for API errors
- Verify Stripe Dashboard shows the payment

## 🚨 Common Issues & Fixes

### Issue: "Stripe is not configured" error
**Fix**: Add `STRIPE_SECRET_KEY` to Vercel environment variables

### Issue: "Module not found: Can't resolve 'stripe'"
**Fix**: 
- Verify `package.json` has `stripe` dependency
- Clear Vercel build cache
- Redeploy

### Issue: Build succeeds but checkout fails
**Fix**: 
- Check `STRIPE_SECRET_KEY` is correct (starts with `sk_test_`)
- Verify key is enabled for Production environment
- Check Vercel function logs for specific error

### Issue: Webhook not working
**Fix**:
- Add `STRIPE_WEBHOOK_SECRET` to Vercel
- Verify webhook endpoint URL in Stripe: `https://batik-thread.vercel.app/api/webhooks/stripe`
- Check webhook is listening for `checkout.session.completed` event

## 📋 Deployment Checklist

Before deploying:
- [ ] All code committed and pushed
- [ ] `STRIPE_SECRET_KEY` added to Vercel
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` added to Vercel
- [ ] Environment variables enabled for Production
- [ ] Build cache cleared (if previous build failed)

After deploying:
- [ ] Build completes successfully
- [ ] Test checkout flow
- [ ] Verify Stripe Checkout page appears
- [ ] Complete test payment
- [ ] Check stock reduction (if webhook configured)

## 🔗 Quick Links

- **Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
- **Vercel Environment Variables**: https://vercel.com → Your Project → Settings → Environment Variables
- **Stripe Webhooks**: https://dashboard.stripe.com/test/webhooks

