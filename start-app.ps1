Write-Host "====================================="
Write-Host "   Starting SportsBro Application"
Write-Host "====================================="
Write-Host ""

# Start the backend server in a new window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

# Wait a moment for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start the frontend server
Write-Host "Starting frontend..." -ForegroundColor Green
Write-Host "If the frontend doesn't start, please run 'npm run dev' in a new terminal" -ForegroundColor Yellow
npm run dev 