import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel';
import { generateRandomUsername } from '../utils/helpers';
import { generateRandomPassword } from '../utils/authUtils';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5002/api/auth/google/callback';

// Log credentials (without exposing full secret)
console.log('========== GOOGLE CONFIGURATION ==========');
console.log('Client ID:', GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID}` : 'Missing');
console.log('Client Secret:', GOOGLE_CLIENT_SECRET ? 'Provided (starts with ' + GOOGLE_CLIENT_SECRET.substring(0, 8) + '...)' : 'Missing');
console.log('Callback URL:', GOOGLE_CALLBACK_URL || 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('==========================================');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID!,
  clientSecret: GOOGLE_CLIENT_SECRET!,
  callbackURL: GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    console.log('Google OAuth callback received for user:', profile.displayName);
    
    // Check if state parameter indicates email validation
    let isValidation = false;
    let requestedEmail = '';
    
    if (req.query.state) {
      try {
        const stateData = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString());
        if (stateData.action === 'validate' && stateData.email) {
          isValidation = true;
          requestedEmail = stateData.email;
          console.log('Email validation request detected for:', requestedEmail);
        }
      } catch (e) {
        console.error("Failed to parse state data:", e);
      }
    }
    
    // Get user information from Google profile
    const googleId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
    const displayName = profile.displayName || '';
    const firstName = profile.name?.givenName || displayName.split(' ')[0] || '';
    const lastName = profile.name?.familyName || displayName.split(' ').slice(1).join(' ') || '';
    const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
    
    console.log('Extracted user info:', { 
      email, 
      displayName, 
      firstName, 
      lastName,
      googleId: googleId.substring(0, 5) + '...' 
    });
    
    // If this is a validation request, return email validation results
    if (isValidation) {
      console.log('Processing email validation request');
      const emailValid = (email.toLowerCase() === requestedEmail.toLowerCase());
      
      // Create a temporary user object with validation results
      const validationResult = {
        isValidation: true,
        emailValidation: {
          requested: requestedEmail,
          found: email,
          valid: emailValid
        }
      };
      
      console.log('Validation result:', validationResult);
      return done(null, validationResult);
    }
    
    // Normal authentication flow - try to find or create user
    console.log('Searching for existing user by googleId or email');
    
    // First try to find by googleId (most reliable)
    let user = await User.findOne({ googleId });
    
    // If not found by googleId, try to find by email
    if (!user && email) {
      user = await User.findOne({ email });
      
      // If user exists but doesn't have googleId, update with Google info
      if (user) {
        console.log('Found existing user by email, updating with Google info');
        user.googleId = googleId;
        user.authProvider = 'google';
        user.fullName = user.fullName || `${firstName} ${lastName}`.trim();
        user.profilePhoto = user.profilePhoto || photo;
        await user.save();
        console.log('User updated with Google information');
      }
    }
    
    // If user doesn't exist, create a new one
    if (!user) {
      console.log('No existing user found, creating new user with Google info');
      
      // Generate a random password for Google-authenticated users
      const password = generateRandomPassword();
      
      // Create new user
      user = await User.create({
        email,
        password,
        fullName: `${firstName} ${lastName}`.trim(),
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        googleId,
        authProvider: 'google',
        profilePhoto: photo,
        emailVerified: true
      });
      
      console.log('New user created with ID:', user._id.toString());
      
      // Add isNewUser flag to user object for the controller
      (user as any).isNewUser = true;
    } else {
      console.log('Found existing user with ID:', user._id.toString());
      
      // Existing user, so not a new user
      (user as any).isNewUser = false;
    }
    
    // Return the user for serialization
    return done(null, user);
  } catch (error) {
    console.error('Error during Google authentication:', error);
    return done(error as Error, undefined);
  }
}));

// Set up serialization/deserialization for sessions
passport.serializeUser((user: any, done: any) => {
  console.log('Serializing user ID:', user.id || user._id);
  done(null, user.id || user._id);
});

passport.deserializeUser(async (id: any, done: any) => {
  try {
    console.log('Deserializing user with ID:', id);
    const user = await User.findById(id);
    if (!user) {
      console.error('User not found during deserialization:', id);
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

// Log whether Google authentication is configured
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  console.log('Google authentication strategy configured successfully');
} else {
  console.warn('Google authentication credentials incomplete. Authentication may fail.');
}

export default passport; 