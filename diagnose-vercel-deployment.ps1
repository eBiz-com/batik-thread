# Vercel Deployment Diagnostic Script
# This script checks GitHub and helps diagnose Vercel deployment issues

Write-Host "=== Vercel Deployment Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check local Git status
Write-Host "1. Checking Local Git Status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Check local commits
Write-Host "2. Checking Local Commits (last 5)..." -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Check remote connection
Write-Host "3. Checking GitHub Remote..." -ForegroundColor Yellow
git remote -v
Write-Host ""

# Check what's on GitHub
Write-Host "4. Checking GitHub Remote Commits..." -ForegroundColor Yellow
$remoteCommit = git ls-remote origin main | Select-String -Pattern "refs/heads/main"
if ($remoteCommit) {
    $commitHash = ($remoteCommit -split '\s+')[0]
    Write-Host "   Latest commit on GitHub: $commitHash" -ForegroundColor Green
    git log origin/main --oneline -5
} else {
    Write-Host "   ERROR: Cannot connect to GitHub remote!" -ForegroundColor Red
}
Write-Host ""

# Check if local and remote are in sync
Write-Host "5. Checking Local vs Remote Sync..." -ForegroundColor Yellow
$localCommit = git rev-parse HEAD
$remoteCommitHash = ($remoteCommit -split '\s+')[0]
if ($localCommit -eq $remoteCommitHash) {
    Write-Host "   OK: Local and remote are in sync" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Local and remote are out of sync!" -ForegroundColor Red
    Write-Host "   Local:  $localCommit" -ForegroundColor Yellow
    Write-Host "   Remote: $remoteCommitHash" -ForegroundColor Yellow
}
Write-Host ""

# Check for TypeScript errors
Write-Host "6. Checking for TypeScript Errors..." -ForegroundColor Yellow
$paymentRoute = Get-Content "app/api/payment/process/route.ts" -Raw
if ($paymentRoute -match "const stockValues: number\[\] = Object\.values\(updatedStockBySize\) as number\[\]") {
    Write-Host "   OK: Payment route TypeScript fix verified" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Payment route fix missing!" -ForegroundColor Red
}
Write-Host ""

# Check Vercel config
Write-Host "7. Checking Vercel Configuration..." -ForegroundColor Yellow
if (Test-Path "vercel.json") {
    Write-Host "   OK: vercel.json exists" -ForegroundColor Green
    Get-Content "vercel.json" | Write-Host
} else {
    Write-Host "   INFO: No vercel.json found (using defaults)" -ForegroundColor Yellow
}
Write-Host ""

# Summary and recommendations
Write-Host "=== DIAGNOSIS SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If Vercel is not deploying:" -ForegroundColor Yellow
Write-Host "1. Check Vercel Dashboard → Settings → Git" -ForegroundColor White
Write-Host "   - Ensure repository is connected" -ForegroundColor White
Write-Host "   - Check if webhook is active" -ForegroundColor White
Write-Host ""
Write-Host "2. Check GitHub → Settings → Webhooks" -ForegroundColor White
Write-Host "   - Look for Vercel webhook" -ForegroundColor White
Write-Host "   - Check recent deliveries" -ForegroundColor White
Write-Host ""
Write-Host "3. Manual Deployment Steps:" -ForegroundColor White
Write-Host "   - Go to Vercel Dashboard → Deployments" -ForegroundColor White
Write-Host "   - Click '...' on latest deployment" -ForegroundColor White
Write-Host "   - Select 'Redeploy'" -ForegroundColor White
Write-Host "   - Turn OFF 'Use existing Build Cache'" -ForegroundColor White
Write-Host ""
Write-Host "4. Check Build Logs:" -ForegroundColor White
Write-Host "   - Open failed deployment in Vercel" -ForegroundColor White
Write-Host "   - Check which commit it's building" -ForegroundColor White
Write-Host "   - Should match: $remoteCommitHash" -ForegroundColor White
Write-Host ""

