# PowerShell script to move project out of OneDrive
# Run this script from PowerShell (right-click -> Run with PowerShell)

Write-Host "Moving Batik & Thread project out of OneDrive..." -ForegroundColor Green

# Define paths
$sourcePath = "C:\Users\Dapo Satiregun\OneDrive\Desktop\Batik_Thread\Batik and Thread Website Development"
$destPath = "C:\Dev\BatikThread"

# Create destination directory
Write-Host "Creating destination directory: $destPath" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $destPath -Force | Out-Null

# Check if source exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "ERROR: Source path not found: $sourcePath" -ForegroundColor Red
    Write-Host "Please update the sourcePath variable in this script" -ForegroundColor Yellow
    exit 1
}

# Copy files (excluding node_modules and .next)
Write-Host "Copying files (this may take a few minutes)..." -ForegroundColor Yellow

$excludeDirs = @('node_modules', '.next', '.git')
$items = Get-ChildItem -Path $sourcePath -Exclude $excludeDirs

foreach ($item in $items) {
    $destItem = Join-Path $destPath $item.Name
    Write-Host "Copying: $($item.Name)" -ForegroundColor Gray
    
    if ($item.PSIsContainer) {
        Copy-Item -Path $item.FullName -Destination $destItem -Recurse -Exclude $excludeDirs -Force
    } else {
        Copy-Item -Path $item.FullName -Destination $destItem -Force
    }
}

Write-Host "`nFiles copied successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. cd $destPath" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White
Write-Host "3. npm run dev" -ForegroundColor White
Write-Host "`nPress any key to open the new directory..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the new directory in Explorer
Start-Process explorer.exe -ArgumentList $destPath

