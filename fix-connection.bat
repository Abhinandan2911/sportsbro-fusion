@echo off
echo =======================================
echo SportsBro Connection Fixer
echo =======================================
echo.
echo This script will update your frontend's .env file
echo to ensure it has the correct backend URL.
echo.
echo Current settings:
findstr "VITE_API_URL" .env

echo.
echo Updating frontend configuration...
echo VITE_API_URL=http://localhost:5003/api > .env.new
findstr /v "VITE_API_URL" .env >> .env.new
move /y .env.new .env

echo.
echo New settings:
findstr "VITE_API_URL" .env

echo.
echo Fixed! Now restart your frontend by running:
echo npm run dev
echo.
echo =======================================

pause 