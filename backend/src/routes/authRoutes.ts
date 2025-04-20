import express from 'express';
import { register, login, getUserProfile, updateUserProfile, googleAuthCallback, checkEmail, validateGoogleEmail, checkGoogleEmail, validateGmailExists } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';
import { Request, Response } from 'express';
import { generateRandomPassword } from '../utils/authUtils';
import axios from 'axios';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/validate-google-email', validateGoogleEmail);
router.post('/check-google-email', checkGoogleEmail);
router.post('/validate-gmail', validateGmailExists);

// Add endpoint to check if username exists
router.post('/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }
    
    // Check if username exists in database
    const existingUser = await User.findOne({ username });
    
    return res.json({ 
      success: true,
      exists: !!existingUser,
      available: !existingUser,
      message: existingUser ? 'This username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during username check' 
    });
  }
});

// Google Auth routes with simpler URL structure
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth callback route
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:8081/login?error=true' }), googleAuthCallback);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin route to fetch users - protected only by admin token
router.get('/admin/users', async (req: Request, res: Response) => {
  try {
    // Check for admin token in query params
    const adminToken = req.query.token as string;
    
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid admin token' 
      });
    }
    
    // Get users with sensitive fields removed
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    return res.json({ 
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Debug endpoint for validating Gmail addresses (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/validate-gmail/:email', async (req: Request, res: Response) => {
    try {
      const email = req.params.email;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }
      
      // Import validation functions
      const { validateGmail, checkGmailExists } = require('../utils/authUtils');
      
      // Basic validation
      const validationResult = validateGmail(email);
      
      if (!validationResult.isValid) {
        return res.json({
          success: false,
          isValid: false,
          message: validationResult.message
        });
      }
      
      // Check if email exists in database
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        return res.json({
          success: true,
          isValid: true,
          inDatabase: true,
          provider: existingUser.authProvider || 'local'
        });
      }
      
      // Generate auth URL
      const clientId = process.env.GOOGLE_CLIENT_ID || '';
      const redirectUri = process.env.GOOGLE_CALLBACK_URL || '';
      
      const { authUrl } = checkGmailExists(email, clientId, redirectUri);
      
      return res.json({
        success: true,
        isValid: true,
        inDatabase: false,
        authUrl,
        debug: true
      });
    } catch (error) {
      console.error('Debug Gmail validation error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error during validation debug' 
      });
    }
  });
}

export default router; 