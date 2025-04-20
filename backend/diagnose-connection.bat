@echo off
echo =======================================
echo SportsBro Backend Connection Diagnostic
echo =======================================
echo.
echo Checking if backend server is running...
echo.

curl http://localhost:5003/api/health -s > nul
if %errorlevel% equ 0 (
  echo [SUCCESS] Backend server is running and responding at http://localhost:5003
) else (
  echo [ERROR] Could not connect to backend server at http://localhost:5003
  echo.
  echo Possible causes:
  echo  - Backend server is not running
  echo  - Wrong port configuration
  echo  - Network or firewall issues
)

echo.
echo Checking environment configurations...
echo.

if exist .env (
  echo Frontend .env file found. Checking API URL configuration...
  findstr "VITE_API_URL" .env
) else (
  echo [WARNING] Frontend .env file not found
)

if exist backend\.env (
  echo Backend .env file found. Checking PORT configuration...
  findstr "PORT" backend\.env
) else (
  echo [WARNING] Backend .env file not found
)

echo.
echo =======================================
echo Diagnostic Complete
echo =======================================

pause 