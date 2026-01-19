to deploy # Move Project Out of OneDrive - Step by Step

## Why This is Needed
OneDrive can cause serious issues with Next.js development:
- File watching doesn't work properly
- Sync conflicts can corrupt files
- Slow file access
- Permission issues

## Solution: Move to Local Directory

### Option 1: Quick Move (Recommended)

1. **Create a local directory:**
   ```powershell
   # Open PowerShell and run:
   New-Item -ItemType Directory -Path "C:\Dev\BatikThread" -Force
   ```

2. **Copy the project:**
   ```powershell
   # Copy everything except node_modules and .next
   $source = "C:\Users\Dapo Satiregun\OneDrive\Desktop\Batik_Thread\Batik and Thread Website Development"
   $dest = "C:\Dev\BatikThread"
   
   # Copy files
   Copy-Item -Path "$source\*" -Destination $dest -Recurse -Exclude "node_modules",".next"
   ```

3. **Reinstall dependencies:**
   ```powershell
   cd C:\Dev\BatikThread
   npm install
   ```

4. **Start the server:**
   ```powershell
   npm run dev
   ```

### Option 2: Use Git Repository (Best for Long-term)

1. **Initialize Git:**
   ```powershell
   cd "C:\Users\Dapo Satiregun\OneDrive\Desktop\Batik_Thread\Batik and Thread Website Development"
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a local directory and clone:**
   ```powershell
   # Create local dev folder
   New-Item -ItemType Directory -Path "C:\Dev" -Force
   cd C:\Dev
   
   # Copy the project
   Copy-Item -Path "C:\Users\Dapo Satiregun\OneDrive\Desktop\Batik_Thread\Batik and Thread Website Development" -Destination "C:\Dev\BatikThread" -Recurse -Exclude "node_modules",".next"
   
   cd C:\Dev\BatikThread
   npm install
   npm run dev
   ```

### Option 3: Manual Copy (Easiest)

1. **Create folder:** `C:\Dev\BatikThread`

2. **Copy these folders/files:**
   - `app/`
   - `components/`
   - `lib/`
   - `public/`
   - `app/`
   - `next.config.js`
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `tailwind.config.js`
   - `postcss.config.js`
   - All `.md` files

3. **DO NOT copy:**
   - `node_modules/`
   - `.next/`
   - Any OneDrive sync files

4. **In the new location:**
   ```powershell
   cd C:\Dev\BatikThread
   npm install
   npm run dev
   ```

## After Moving

1. Test that it works: `http://localhost:3000`
2. If it works, you can delete the OneDrive version
3. Update any shortcuts/bookmarks

## Verify It's Working

After moving, you should see:
- Server starts without errors
- Pages load in browser
- No blank pages
- Fast file watching (changes reflect immediately)

