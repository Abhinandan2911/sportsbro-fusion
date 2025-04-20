Write-Host "====================================="
Write-Host "   Starting SportsBro Backend Server"
Write-Host "====================================="
Write-Host ""

# Get current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir"

# Check if we're in the backend directory
if (!(Test-Path "package.json")) {
    Write-Host "ERROR: Not in the backend directory or package.json not found." -ForegroundColor Red
    Write-Host "Please run this script from the backend directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Starting backend server..." -ForegroundColor Green
npm run dev 