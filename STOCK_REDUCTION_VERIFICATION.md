# Stock Reduction Verification Guide

## Issue Fixed
The stock wasn't being reduced because items stored in `sessionStorage` were missing the `id` and `size` fields needed for stock reduction.

## What Was Fixed
1. **CartModal.tsx**: Now stores `id` and `size` in sessionStorage
2. **Payment API**: Added better logging to track stock reduction

## How to Verify It's Working

### Step 1: Check Server Deployment
1. Go to your deployment platform (Vercel/Netlify)
2. Check the latest deployment - should show commit `e843d21`
3. Wait 1-2 minutes for deployment to complete

### Step 2: Test Stock Reduction
1. **Add item to cart** with known stock (e.g., stock = 2)
2. **Complete a purchase**
3. **Check admin dashboard** - stock should decrease by the quantity purchased
4. **Check homepage** - if stock reaches 0, product should disappear

### Step 3: Check Server Logs
If using Vercel:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment → Functions → View Logs
3. Look for log messages like:
   - `Starting stock reduction for items:`
   - `Stock updated for product X, size Y: A -> B`

### Step 4: Manual Verification
1. Note the current stock of a product in admin
2. Make a test purchase
3. Refresh admin page - stock should be reduced
4. If stock reaches 0, product should disappear from homepage

## Troubleshooting

### If Stock Still Doesn't Reduce:
1. **Check browser console** for errors
2. **Check server logs** for stock reduction errors
3. **Verify items have id and size**:
   - Open browser DevTools → Application → Session Storage
   - Check `checkout_items` - should have `id` and `size` fields

### If Deployment Didn't Update:
1. **Hard refresh** the website (Ctrl+Shift+R)
2. **Clear browser cache**
3. **Wait 2-3 minutes** for deployment to propagate

## Expected Behavior
- ✅ Stock reduces automatically after successful payment
- ✅ Admin dashboard shows updated stock immediately
- ✅ Products with 0 stock disappear from homepage
- ✅ Out-of-stock items redirect to custom order page

