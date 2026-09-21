@echo off
echo ===================================================
echo  Pushing Pharmacy Management System to GitHub...
echo  Target: https://github.com/diliban2005/pharmacy-management
echo ===================================================
set "PATH=%PATH%;C:\Users\HP\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd"
git push -u origin main
echo.
echo Done! Check your repository at:
echo https://github.com/diliban2005/pharmacy-management
pause
