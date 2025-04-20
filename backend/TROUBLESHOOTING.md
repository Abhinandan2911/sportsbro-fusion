# Backend Connection Troubleshooting Guide

## Common Issues

If you're seeing "Cannot connect to the backend server. Please make sure it is running." error, follow these steps to diagnose and fix the issue.

## Step 1: Check if Backend Server is Running

1. Open a new PowerShell or Command Prompt
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Start the server:
   ```
   npm run dev
   ```
4. Look for any error messages in the terminal

### If Backend Fails to Start:

- Check for error messages related to:
  - Missing dependencies (run `npm install`)
  - Port already in use (change port in `.env` file)
  - Database connection issues

## Step 2: Verify Environment Configuration

1. Check backend `.env` file:
   - Should have `PORT=5003`
   - MongoDB connection string should be correct

2. Check frontend `.env` file (in project root):
   - Should have `VITE_API_URL=http://localhost:5003/api`

## Step 3: Fix Connection Issues

### Method 1: Use the Provided Scripts

1. Run the connection checker:
   ```
   backend\check-connection.bat
   ```

2. If issues are found, run the connection fixer:
   ```
   backend\fix-connection.bat
   ```

### Method 2: Manual Fix

1. Edit the frontend `.env` file
2. Make sure it has the correct API URL:
   ```
   VITE_API_URL=http://localhost:5003/api
   ```
3. Save the file and restart the frontend

## Step 4: Start Everything in the Right Order

1. First, start the backend server:
   - In PowerShell: `cd backend && npm run dev`
   - Or double-click: `backend\start.bat`

2. Then, in a new terminal, start the frontend:
   ```
   npm run dev
   ```

## Step 5: Still Having Issues?

### Check Network and Firewall

- Make sure no firewall is blocking local connections
- Try disabling antivirus/firewall temporarily

### Clean Install Dependencies

```
cd backend
npm ci
cd ..
npm ci
```

### Check for Port Conflicts

- See if another application is using port 5003
- You can change the port in both backend `.env` and frontend `.env` files

## Getting More Help

If none of these steps solve your issue, gather the following information:

1. Screenshots of any error messages
2. Contents of both `.env` files
3. Terminal output when starting backend and frontend

Then reach out for more specific assistance. 