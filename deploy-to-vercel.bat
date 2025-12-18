@echo off
echo ============================================
echo Deploying Batik & Thread to Vercel
echo ============================================
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    echo.
)

echo Current directory: %CD%
echo.
echo Starting deployment...
echo.

REM Deploy to Vercel
vercel --prod

echo.
echo ============================================
echo Deployment complete!
echo ============================================
echo.
echo Your site should be live at: https://your-project.vercel.app
echo Admin dashboard: https://your-project.vercel.app/admin
echo.
echo Don't forget to add environment variables in Vercel dashboard!
echo.
pause

