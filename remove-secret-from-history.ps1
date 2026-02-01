# Remove secret file from git history
Write-Host "Removing secret file from commit history..." -ForegroundColor Yellow

# Checkout the commit before the problematic one
git checkout f3fcebf

# Create a new branch
git checkout -b temp-clean-branch

# Cherry-pick commits, but exclude the problematic file
Write-Host "Cherry-picking commits without the secret file..." -ForegroundColor Cyan

# Cherry-pick the commit but exclude the file
git cherry-pick -n 3ca80d5
git reset HEAD "Supabase config/import os.py"
git commit -m "Force fresh deployment: All TypeScript fixes verified (cleaned)"

# Cherry-pick the latest commit
git cherry-pick 26afb5f

Write-Host "Done! Now switch back to main and reset:" -ForegroundColor Green
Write-Host "  git checkout main"
Write-Host "  git reset --hard temp-clean-branch"
Write-Host "  git branch -D temp-clean-branch"

