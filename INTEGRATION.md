# Google OAuth Integration Guide

This guide explains how to set up and use the Google OAuth authentication flow in your Express TypeScript application.

## Files Overview

- `auth/googleStrategy.ts` - The Google OAuth strategy implementation
- `models/user.model.ts` - User model with fields for Google authentication
- `middlewares/authMiddleware.ts` - JWT verification middleware
- `utils/generateToken.ts` - Utilities for JWT creation and password generation
- `routes/auth.routes.ts` - Express routes for Google authentication
- `config/passport.config.ts` - Passport configuration with Google strategy

## Setup Instructions

### 1. Install Required Dependencies

```bash
npm install passport passport-google-oauth20 jsonwebtoken bcryptjs mongoose express
npm install @types/passport @types/passport-google-oauth20 @types/jsonwebtoken @types/bcryptjs @types/mongoose @types/express --save-dev
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/yourdatabase

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

### 3. Create Google OAuth Credentials

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project (or select an existing one)
3. Go to "Credentials" and create an OAuth client ID
4. Configure the OAuth consent screen
5. Add `http://localhost:5000/api/auth/google/callback` as an authorized redirect URI
6. Copy the Client ID and Client Secret to your `.env` file

### 4. Initialize Passport in Your Express App

In your main application file (e.g., `index.ts` or `app.ts`):

```typescript
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import configurePassport from './config/passport.config';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Authentication Flow

### 1. User Clicks "Login with Google" Button

Send the user to your Google login route:

```html
<a href="/api/auth/google">Login with Google</a>
```

### 2. Google Authentication Process

1. User is redirected to Google for authentication
2. User grants permissions to your app
3. Google redirects back to your callback URL with an authorization code
4. Passport exchanges the code for user profile information
5. Your callback handler is executed

### 3. User Creation or Login

1. The Google strategy checks if the user exists in your MongoDB database
2. If the user exists, their profile is fetched and a JWT token is generated
3. If the user doesn't exist, a new user is created with the Google profile data and a JWT token is generated

### 4. Frontend Authentication

After successful authentication, the user is redirected to your frontend with the JWT token:

```
http://localhost:3000/auth-callback?token=<jwt_token>
```

Your frontend should:
1. Extract the token from the URL
2. Store it in localStorage or similar
3. Use it for authenticated API requests by setting the Authorization header:
   ```
   Authorization: Bearer <jwt_token>
   ```

## Protected Routes

To protect routes in your API, use the `protect` middleware:

```typescript
import { protect } from './middlewares/authMiddleware';
import express from 'express';

const router = express.Router();

// This route requires authentication
router.get('/profile', protect, (req, res) => {
  // req.user contains the authenticated user from the JWT token
  res.json({ user: req.user });
});

export default router;
```

## Testing Authentication

1. Start your server
2. Click the "Login with Google" link
3. Complete Google authentication
4. Check for the JWT token in the redirect URL
5. Use the token to access protected routes

## Troubleshooting

- Check server logs for detailed error messages
- Verify your Google OAuth credentials are correct
- Ensure redirect URIs match exactly what's configured in Google Console
- Check MongoDB connection for database errors
- Verify JWT secret is properly set in environment variables 