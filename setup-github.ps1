# PowerShell script to help set up GitHub repository
# Run this script after creating your GitHub repository

Write-Host "🚀 GitHub Setup Script for Batik & Thread" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git not initialized. Running 'git init'..." -ForegroundColor Yellow
    git init
}

# Get GitHub repository URL
Write-Host "📝 Please provide your GitHub repository URL:" -ForegroundColor Yellow
Write-Host "   Example: https://github.com/YOUR_USERNAME/batik-thread.git" -ForegroundColor Gray
$repoUrl = Read-Host "Repository URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "❌ Repository URL is required. Exiting." -ForegroundColor Red
    exit 1
}

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $replace = Read-Host "Replace it? (y/n)"
    if ($replace -eq "y" -or $replace -eq "Y") {
        git remote remove origin
    } else {
        Write-Host "❌ Keeping existing remote. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Add remote
Write-Host ""
Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Cyan
git remote add origin $repoUrl

# Stage all files
Write-Host "📦 Staging all files..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ No changes to commit. Repository is up to date." -ForegroundColor Green
} else {
    # Commit
    Write-Host "💾 Creating initial commit..." -ForegroundColor Cyan
    git commit -m "Initial commit - Batik & Thread e-commerce site"
}

# Set branch to main
Write-Host "🌿 Setting branch to 'main'..." -ForegroundColor Cyan
git branch -M main

# Push
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "   (You may be prompted for GitHub credentials)" -ForegroundColor Gray
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Go to https://vercel.com" -ForegroundColor White
    Write-Host "   2. Sign up/login with GitHub" -ForegroundColor White
    Write-Host "   3. Click 'Add New Project'" -ForegroundColor White
    Write-Host "   4. Import your repository" -ForegroundColor White
    Write-Host "   5. Add environment variables (see GITHUB_SETUP.md)" -ForegroundColor White
    Write-Host "   6. Deploy!" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Full guide: See GITHUB_SETUP.md" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Please check:" -ForegroundColor Red
    Write-Host "   - GitHub repository exists" -ForegroundColor White
    Write-Host "   - Repository URL is correct" -ForegroundColor White
    Write-Host "   - You have access to the repository" -ForegroundColor White
    Write-Host "   - You're logged into GitHub" -ForegroundColor White
}

