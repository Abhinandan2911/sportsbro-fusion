@echo off
echo =======================================
echo SportsBro Backend Connection Diagnostic
echo =======================================
echo.
echo Checking if backend server is running...
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5003/api/health' -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Output '[SUCCESS] Backend server is running correctly!' } } catch { Write-Output '[ERROR] Could not connect to backend server at http://localhost:5003' }"

echo.
echo Possible causes if connection failed:
echo  - Backend server is not running
echo  - Wrong port configuration
echo  - Network or firewall issues
echo.

echo Checking environment configurations...
echo.

echo Looking for frontend .env file...
powershell -Command "if (Test-Path '.env') { Write-Output 'Frontend .env file found:'; Get-Content '.env' | Select-String 'VITE_API_URL' } else { Write-Output '[WARNING] Frontend .env file not found' }"

echo.
echo Looking for backend .env file...
powershell -Command "if (Test-Path 'backend\.env') { Write-Output 'Backend .env file found:'; Get-Content 'backend\.env' | Select-String 'PORT' } else { Write-Output '[WARNING] Backend .env file not found' }"

echo.
echo =======================================
echo Next steps:
echo 1. Make sure to run backend/start.bat first
echo 2. Then run npm run dev from the main folder
echo =======================================
echo.

pause 