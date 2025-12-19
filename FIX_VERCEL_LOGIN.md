# 🔧 Fix Vercel Login Redirect Loop

If clicking "Continue with GitHub" redirects you back to the login page, try these solutions:

## Solution 1: Clear Browser Cache & Cookies

1. **Clear Vercel cookies:**
   - Press `F12` to open Developer Tools
   - Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
   - Click **Cookies** → `vercel.com`
   - Right-click → **Clear** or delete all cookies
   - Refresh the page

2. **Or use Incognito/Private Mode:**
   - Open a new Incognito/Private window
   - Go to [vercel.com](https://vercel.com)
   - Try "Continue with GitHub" again

## Solution 2: Check GitHub Permissions

1. Go to [github.com/settings/applications](https://github.com/settings/applications)
2. Check if Vercel is listed under "Authorized OAuth Apps"
3. If it is, click on it and **revoke access**
4. Go back to Vercel and try "Continue with GitHub" again
5. Make sure to **authorize** when GitHub asks for permissions

## Solution 3: Use Email Sign Up Instead

1. On the Vercel login page, click **"Sign Up"** at the bottom
2. Enter your email address
3. Check your email for verification
4. After verifying, go to **Settings** → **Connected Accounts**
5. Connect your GitHub account there

## Solution 4: Try Different Browser

Sometimes browser extensions or settings can interfere:
- Try a different browser (Chrome, Firefox, Edge)
- Or disable browser extensions temporarily

## Solution 5: Direct GitHub OAuth Link

Try accessing Vercel's GitHub OAuth directly:
1. Go to: `https://vercel.com/api/auth/github`
2. This should redirect you through GitHub authorization
3. After authorizing, you should be logged into Vercel

## Solution 6: Manual Repository Import (Alternative)

If login still doesn't work, you can deploy manually:

1. **Use Vercel CLI** (command line):
   ```powershell
   cd C:\Dev\BatikThread
   npm install -g vercel
   vercel login
   vercel
   ```
   Follow the prompts to deploy.

2. **Or use GitHub Actions** to deploy automatically (more advanced)

---

## Most Common Fix

**Try Solution 1 (Incognito mode) first** - this fixes the issue 90% of the time!

---

## Still Having Issues?

If none of these work, you can:
- Contact Vercel support: [vercel.com/support](https://vercel.com/support)
- Or use the Vercel CLI method (Solution 6) which doesn't require web login

