import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());

// Import auth routes and strategy
const authRoutes = require('../routes/auth.routes').default;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Passport
app.use(passport.initialize());

// Configure Google OAuth strategy manually
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { generateToken } from '../utils/generateToken';

// Import User model with require to avoid module not found errors
const User = require('../models/user.model').default;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth received profile:', profile.displayName);
        const email = profile.emails?.[0].value;
        const fullName = profile.displayName;
        const profilePhoto = profile.photos?.[0].value;

        if (!email) {
          return done(new Error('Email not provided'), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          console.log('Creating new user with Google profile');
          user = await User.create({
            fullName,
            email,
            profilePhoto,
            authProvider: 'google',
          });
        } else {
          console.log('User already exists:', email);
        }

        const token = generateToken(user._id);
        return done(null, { user, token });
      } catch (err) {
        console.error('Error in Google strategy:', err);
        return done(err, null);
      }
    }
  )
);

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Google OAuth API is running');
});

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 