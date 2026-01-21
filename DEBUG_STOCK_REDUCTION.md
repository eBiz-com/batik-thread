# Debug Stock Reduction Issue

## Problem
Product `4004a162-db89-41b9-80e4-f956f6a787ba` is still showing as available after purchase.

## What I Fixed

### 1. Added Item Validation
- Payment page now validates items have `id` before processing
- Prevents placeholder items without IDs from being processed
- Shows error if items are missing

### 2. Enhanced Logging
- Added detailed console logs for stock reduction
- Shows exactly what items are being processed
- Logs success/failure for each stock update

### 3. Improved Product Refresh
- Products refresh when:
  - Custom event is dispatched (after purchase)
  - Page becomes visible (user navigates back)
  - Window gets focus (user switches tabs)

## How to Debug

### Step 1: Check Browser Console
After making a purchase, open browser console (F12) and look for:

**In Payment Page:**
- `✅ Items validated for stock reduction:` - Should show items with IDs
- If you see `❌ ERROR: No items found` - Items weren't stored correctly

**In Payment API (Server Logs):**
- `Starting stock reduction for items:` - Shows all items
- `Processing stock reduction for item:` - Shows each item being processed
- `✅ Stock updated successfully` - Confirms stock was reduced
- `❌ ERROR updating stock` - Shows if update failed

### Step 2: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for the payment process logs
3. Check for:
   - `✅ Stock updated successfully` messages
   - `❌ ERROR` messages
   - Item structure being logged

### Step 3: Verify Database
1. Go to Supabase Dashboard
2. Check the `products` table
3. Find product ID: `4004a162-db89-41b9-80e4-f956f6a787ba`
4. Check:
   - `stock` field (should be reduced)
   - `stock_by_size` field (if used, should show reduced size stock)

### Step 4: Test Again
1. Make a test purchase
2. Check browser console for logs
3. Check Vercel logs
4. Verify stock in database
5. Refresh frontend (hard refresh: Ctrl+Shift+R)

## Common Issues

### Issue: Items missing `id` field
**Symptom:** Console shows "Skipping item - missing id"
**Fix:** Already fixed - payment page now validates items

### Issue: Stock not reducing in database
**Symptom:** Logs show "Stock updated successfully" but database unchanged
**Possible causes:**
- RLS (Row Level Security) blocking update
- Database connection issue
- Transaction rollback

**Check:**
- Supabase RLS policies for `products` table
- Service role key is being used (not anon key)

### Issue: Frontend not refreshing
**Symptom:** Stock reduced in DB but product still shows on frontend
**Fix:** Already improved - multiple refresh triggers added

## Next Steps

1. **Test the fix:**
   - Make a test purchase
   - Check console logs
   - Verify stock in database
   - Check if product disappears from frontend

2. **If still not working:**
   - Share the console logs
   - Share Vercel server logs
   - Check Supabase RLS policies

3. **Verify the product:**
   - Check if product ID `4004a162-db89-41b9-80e4-f956f6a787ba` exists
   - Check its current stock value
   - Check if it has `stock_by_size` or just `stock`

---

**The fixes have been deployed. Please test again and check the console logs for detailed information about what's happening during stock reduction.**

