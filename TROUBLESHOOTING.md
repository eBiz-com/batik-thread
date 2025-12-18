# Troubleshooting Guide - Blank Page Issue

## Step-by-Step Fix Process

### 1. **Verify Server is Running**
```powershell
# Check if port 3000 is listening
netstat -ano | findstr :3000

# Check Node processes
Get-Process -Name node
```

### 2. **Clean Restart the Server**
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Wait 2 seconds
Start-Sleep -Seconds 2

# Restart dev server
cd "C:\Users\Dapo Satiregun\OneDrive\Desktop\Batik_Thread\Batik and Thread Website Development"
npm run dev
```

### 3. **Test Minimal Pages**
Try these URLs in order:
- `http://localhost:3000/minimal` - Simplest possible page
- `http://localhost:3000/hello` - Basic page
- `http://localhost:3000/test` - Client component test
- `http://localhost:3000` - Main homepage

### 4. **Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for:
   - Red errors (React errors, import errors)
   - Network errors (404, 500, etc.)
   - Hydration warnings

### 5. **Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for:
   - Failed requests (red)
   - Missing JavaScript bundles
   - CORS errors

### 6. **Clear Browser Cache**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear browser cache completely

### 7. **Check Terminal Output**
Look at the terminal where `npm run dev` is running:
- Are there compilation errors?
- Does it say "Ready" or is it stuck at "Starting..."?
- Any red error messages?

### 8. **Common Issues & Fixes**

#### Issue: Server shows "Starting..." but never finishes
**Fix:** There's likely a compilation error. Check the terminal output.

#### Issue: ERR_CONNECTION_REFUSED
**Fix:** Server isn't running or crashed. Restart it.

#### Issue: Blank white page
**Fix:** JavaScript error preventing React from rendering. Check browser console.

#### Issue: Hydration errors
**Fix:** Server/client mismatch. We've fixed date-related issues, but check for others.

### 9. **Nuclear Option - Full Reset**
```powershell
# Stop all Node processes
taskkill /F /IM node.exe

# Delete Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Clear npm cache (optional)
npm cache clean --force

# Reinstall dependencies (optional)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install

# Restart server
npm run dev
```

### 10. **Check for Blocking Issues**
- Firewall blocking port 3000
- Antivirus blocking Node.js
- Another application using port 3000
- OneDrive sync issues (files in OneDrive can cause problems)

## What We've Fixed So Far
✅ Fixed hydration issues with Date.now() in admin receipt page
✅ Fixed Contact component (added 'use client')
✅ Fixed Footer component (added 'use client' and moved Date to useEffect)
✅ Created minimal test pages

## Next Steps if Still Not Working
1. Share the exact error messages from browser console
2. Share the terminal output from `npm run dev`
3. Try accessing `http://127.0.0.1:3000` instead of `localhost:3000`
4. Check Windows Firewall settings
5. Try a different browser

