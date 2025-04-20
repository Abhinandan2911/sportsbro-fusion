@echo off
echo =======================================
echo Starting SportsBro Application
echo =======================================
echo.

echo Starting backend server...
start cmd /k "cd backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting frontend server...
start cmd /k "npm run dev"

echo.
echo Both servers are now starting!
echo Backend will be available at: http://localhost:5003
echo Frontend will be available at: http://localhost:8080 or http://localhost:8081
echo.
echo =======================================
echo Press any key to exit this window...
pause > nul 