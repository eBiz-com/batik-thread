# Force Fix and Deploy Script
# This script verifies all TypeScript fixes and forces a fresh deployment

Write-Host "=== Verifying TypeScript Fixes ===" -ForegroundColor Cyan

# Check payment route
$paymentRoute = Get-Content "app/api/payment/process/route.ts" -Raw
if ($paymentRoute -match "const stockValues: number\[\] = Object\.values\(updatedStockBySize\) as number\[\]") {
    Write-Host "OK: Payment route fix verified" -ForegroundColor Green
} else {
    Write-Host "ERROR: Payment route fix MISSING!" -ForegroundColor Red
    exit 1
}

# Check page.tsx
$pageTsx = Get-Content "app/page.tsx" -Raw
$reduceCount = ([regex]::Matches($pageTsx, "\.reduce\(\(sum: number")).Count
if ($reduceCount -ge 3) {
    Write-Host "OK: page.tsx fixes verified ($reduceCount fixes found)" -ForegroundColor Green
} else {
    Write-Host "ERROR: page.tsx fixes incomplete!" -ForegroundColor Red
    exit 1
}

# Check admin pages
$adminPage = Get-Content "app/admin/page.tsx" -Raw
if ($adminPage -match "\.reduce\(\(sum: number") {
    Write-Host "OK: admin/page.tsx fixes verified" -ForegroundColor Green
} else {
    Write-Host "ERROR: admin/page.tsx fixes MISSING!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== All Fixes Verified ===" -ForegroundColor Green
Write-Host "Creating fresh commit to force deployment..." -ForegroundColor Cyan

# Create a fresh commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add -A
git commit -m "Force fresh deployment: All TypeScript fixes verified - $timestamp" --allow-empty

Write-Host "OK: Fresh commit created" -ForegroundColor Green

Write-Host ""
Write-Host "=== Pushing to GitHub ===" -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Successfully pushed to GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== Next Steps ===" -ForegroundColor Yellow
    Write-Host "1. Go to Vercel Dashboard"
    Write-Host "2. Go to Deployments tab"
    Write-Host "3. Click three dots on latest deployment"
    Write-Host "4. Select Redeploy"
    Write-Host "5. Turn OFF Use existing Build Cache"
    Write-Host "6. Click Redeploy"
    Write-Host ""
    Write-Host "Or wait 1-2 minutes for auto-deployment to trigger" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: Push failed. Check your Git credentials." -ForegroundColor Red
    exit 1
}
