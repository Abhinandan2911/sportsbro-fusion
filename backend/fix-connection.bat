@echo off
echo =======================================
echo SportsBro Connection Fixer
echo =======================================
echo.
echo This script will update your frontend's .env file
echo to ensure it has the correct backend URL.
echo.

echo Checking current settings:
powershell -Command "if (Test-Path '..\\.env') { Get-Content '..\\.env' | Select-String 'VITE_API_URL' } else { Write-Output 'No .env file found.' }"

echo.
echo Updating frontend configuration...

powershell -Command "$content = 'VITE_API_URL=http://localhost:5003/api'; if (Test-Path '..\\.env') { $existingContent = Get-Content '..\\.env' | Where-Object { !$_.StartsWith('VITE_API_URL=') }; Set-Content '..\\.env' -Value $content,$existingContent } else { Set-Content '..\\.env' -Value $content }"

echo.
echo New settings:
powershell -Command "if (Test-Path '..\\.env') { Get-Content '..\\.env' | Select-String 'VITE_API_URL' } else { Write-Output 'Failed to create .env file.' }"

echo.
echo Fixed! Now:
echo 1. Start backend first: Double-click backend/start.bat
echo 2. Then start frontend: Open new terminal and run npm run dev
echo.
echo =======================================

pause 