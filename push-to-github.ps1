# Script to push code to GitHub using Personal Access Token
# Run this after you've generated your token

Write-Host "🚀 Push to GitHub - Batik & Thread" -ForegroundColor Cyan
Write-Host ""

# Get the token from user
Write-Host "📝 Paste your Personal Access Token:" -ForegroundColor Yellow
Write-Host "   (The token you just copied from GitHub)" -ForegroundColor Gray
$token = Read-Host "Token" -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

if ([string]::IsNullOrWhiteSpace($tokenPlain)) {
    Write-Host "❌ Token is required. Exiting." -ForegroundColor Red
    exit 1
}

# Update remote URL with token
Write-Host ""
Write-Host "🔗 Updating remote URL with token..." -ForegroundColor Cyan
$remoteUrl = "https://$tokenPlain@github.com/eBiz-com/batik-thread.git"
git remote set-url origin $remoteUrl

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your code is now at: https://github.com/eBiz-com/batik-thread" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next Step: Deploy to Vercel" -ForegroundColor Yellow
    Write-Host "   1. Go to https://vercel.com" -ForegroundColor White
    Write-Host "   2. Sign up/login with GitHub" -ForegroundColor White
    Write-Host "   3. Click 'Add New Project'" -ForegroundColor White
    Write-Host "   4. Import 'eBiz-com/batik-thread'" -ForegroundColor White
    Write-Host "   5. Add environment variables (see QUICK_START_GITHUB.md)" -ForegroundColor White
    Write-Host "   6. Deploy!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check:" -ForegroundColor Red
    Write-Host "   - Token is correct" -ForegroundColor White
    Write-Host "   - Token has 'repo' scope" -ForegroundColor White
    Write-Host "   - You have access to eBiz-com/batik-thread" -ForegroundColor White
}

