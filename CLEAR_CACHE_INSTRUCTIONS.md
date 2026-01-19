# Clear Browser Cache to See Image Fixes

If images still appear cut off after the code changes, you may need to clear your browser cache:

## Quick Fix (Hard Refresh):
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

## Full Cache Clear:

### Chrome/Edge:
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Firefox:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached Web Content"
3. Click "Clear Now"

### Safari:
1. Press `Cmd + Option + E` to clear cache
2. Or go to Safari > Preferences > Advanced > Show Develop menu
3. Then Develop > Empty Caches

## Why This Happens:
- Browsers cache CSS and JavaScript files
- Old code with `object-cover` might still be cached
- New code with `object-contain` needs to be loaded fresh

