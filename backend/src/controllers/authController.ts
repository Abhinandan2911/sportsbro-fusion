import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { successResponse, errorResponse } from '../utils/apiResponse';
import axios from 'axios';
import { generateRandomPassword, validateGmail, checkGmailExists } from '../utils/authUtils';
import asyncHandler from 'express-async-handler';
import logger from '../utils/logger';

/**
 * Generate JWT token
 */
const generateToken = (id: string, email?: string): string => {
  console.log('Generating token for user ID:', id);
  const payload = {
    id,
    email
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
  
  console.log('Token generated successfully, first 20 chars:', token.substring(0, 20) + '...');
  return token;
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, username } = req.body;

    // Check if user exists with email
    const userExists = await User.findOne({ email });

    if (userExists) {
      return errorResponse(res, 'User with this email already exists', 400);
    }

    // Check if username is taken
    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      return errorResponse(res, 'Username is already taken', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email,
      username,
      password: hashedPassword,
      authProvider: 'local', // Default to local authentication
    });

    if (user) {
      // New users won't have completed their profile yet
      const isProfileComplete = false;

      // Return user without password
      const userData = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        gender: user.gender || '',
        sports: user.sports || [],
        achievements: user.achievements || [],
        profilePhoto: user.profilePhoto || '',
        isProfileComplete: isProfileComplete,
        isNewUser: true, // Flag to indicate this is a new user
        token: generateToken(user._id.toString(), user.email),
      };

      return successResponse(res, userData, 'User registered successfully', 201);
    } else {
      return errorResponse(res, 'Invalid user data', 400);
    }
  } catch (error) {
    return errorResponse(res, 'Failed to register user', 500, error);
  }
};

/**
 * @desc    Check if email exists
 * @route   POST /api/auth/check-email
 * @access  Public
 */
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }
    
    // Check if user exists with email
    const user = await User.findOne({ email });
    
    // Check if the email looks like a Google email
    const isGoogleEmail = email.toLowerCase().endsWith('@gmail.com');
    
    return successResponse(res, {
      exists: !!user,
      isGoogleEmail,
      provider: user ? user.authProvider : null
    }, 'Email check completed');
    
  } catch (error) {
    return errorResponse(res, 'Failed to check email', 500, error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // Check if the email looks like a Google email
      const isGoogleEmail = email.toLowerCase().endsWith('@gmail.com');
      
      if (isGoogleEmail) {
        return errorResponse(res, 'This email is not registered. Would you like to sign up or continue with Google?', 404);
      } else {
        return errorResponse(res, 'This email is not registered. Please sign up first.', 404);
      }
    }

    // If user exists but registered with Google, recommend using Google sign-in
    if (user.authProvider === 'google') {
      return errorResponse(res, 'This account was created with Google. Please use Google Sign-in instead.', 401);
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return errorResponse(res, 'Invalid password', 401);
    }

    // Check if profile is complete
    const isProfileComplete = 
      (user.sports && user.sports.length > 0) &&
      (user.achievements && user.achievements.length > 0) &&
      user.profilePhoto;

    // Return user without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      gender: user.gender,
      sports: user.sports || [],
      achievements: user.achievements || [],
      profilePhoto: user.profilePhoto || '',
      isProfileComplete: isProfileComplete,
      isNewUser: false, // This is not a new user since they're logging in
      token: generateToken(user._id.toString(), user.email),
    };

    return successResponse(res, userData, 'Login successful');
  } catch (error) {
    return errorResponse(res, 'Failed to log in', 500, error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // Add null check for req.user
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    // Access id safely using type assertion
    const userId = (req.user as any)._id;
    
    const user = await User.findById(userId).select('-password');

    if (user) {
      return successResponse(res, user, 'User profile retrieved');
    } else {
      return errorResponse(res, 'User not found', 404);
    }
  } catch (error) {
    return errorResponse(res, 'Failed to get user profile', 500, error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    // Add null check for req.user
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Access id safely using type assertion
    const userId = (req.user as any)._id;
    
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // If username is being updated, check if it's already taken
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({ username: req.body.username });
      if (usernameExists) {
        return errorResponse(res, 'Username is already taken', 400);
      }
    }

    // Update user fields
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    user.gender = req.body.gender || user.gender;
    user.sports = req.body.sports || user.sports;
    user.achievements = req.body.achievements || user.achievements;
    user.profilePhoto = req.body.profilePhoto || user.profilePhoto;

    // Update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    
    // Return updated user without password
    const userData = {
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      username: updatedUser.username,
      gender: updatedUser.gender,
      sports: updatedUser.sports,
      achievements: updatedUser.achievements,
      profilePhoto: updatedUser.profilePhoto,
      token: generateToken(updatedUser._id.toString(), updatedUser.email),
    };

    return successResponse(res, userData, 'User profile updated');
  } catch (error) {
    return errorResponse(res, 'Failed to update user profile', 500, error);
  }
};

/**
 * Initiates Google email validation flow
 */
export const validateGoogleEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if the email already exists in our database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ 
        success: true, 
        exists: true, 
        inDatabase: true,
        provider: existingUser.authProvider,
        message: 'Email already registered in our system'
      });
    }

    // Generate a state parameter that includes the email and indicates this is a validation request
    const state = Buffer.from(JSON.stringify({
      action: 'validate',
      email: email
    })).toString('base64');

    // Create the authentication URL with the state parameter
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || '')}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('profile email openid')}` +
      `&state=${state}` +
      `&prompt=select_account`;
    
    return res.status(200).json({ success: true, authUrl });
  } catch (error) {
    console.error('Error initiating Google email validation:', error);
    return res.status(500).json({ success: false, message: "Server error during email validation initiation" });
  }
};

/**
 * Callback handler for Google OAuth
 */
export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    console.log('Google auth callback execution started');
    
    // Check if this is an email validation request from state parameter
    let stateData = {};
    if (req.query.state) {
      try {
        stateData = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString());
        console.log('State data from query:', stateData);
      } catch (e) {
        console.error("Failed to parse state data:", e);
      }
    }

    // @ts-ignore (req.user comes from passport)
    const user = req.user;
    console.log('User object from passport:', user ? 'Present' : 'Missing', user ? `(ID: ${(user as any)._id})` : '');
    
    // Check if this is a validation request based on the user object from passport
    if ((user as any)?.isValidation) {
      console.log('Email validation request detected in callback handler');
      
      // Get validation results from the user object
      const emailValidation = (user as any).emailValidation || {};
      const requestedEmail = emailValidation.requested || '';
      const foundEmail = emailValidation.found || '';
      const emailValid = emailValidation.valid || false;
      
      console.log('Email validation result:', {
        requestedEmail,
        foundEmail,
        emailValid
      });
      
      // Redirect back to frontend with validation result
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/register?emailValid=${emailValid}&email=${encodeURIComponent(foundEmail || requestedEmail)}`;
      console.log('Redirecting to:', redirectUrl);
      return res.redirect(redirectUrl);
    }
    
    // Regular authentication flow
    if (!user) {
      const errorRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/login?error=authentication_failed`;
      console.error('Authentication failed - no valid user object');
      return res.redirect(errorRedirectUrl);
    }
    
    try {
      // Check if this is a new user (added by passport strategy)
      const isNewUser = (user as any).isNewUser || false;
      
      // Generate JWT token
      const token = generateToken((user as any)._id.toString(), (user as any).email);
      console.log('JWT token generated successfully for user ID:', (user as any)._id.toString());
      
      // Redirect to frontend with token and new user flag
      const successRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/auth-callback?token=${token}&isNewUser=${isNewUser}`;
      console.log('Redirecting to frontend with token:', successRedirectUrl.substring(0, successRedirectUrl.indexOf('?') + 15) + '...');
      return res.redirect(successRedirectUrl);
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/login?error=token_generation_failed`);
    }
  } catch (error) {
    console.error('Error in Google auth callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/login?error=server_error`);
  }
};

/**
 * @desc    Check if an email exists on Google
 * @route   POST /api/auth/check-google-email
 * @access  Public
 */
export const checkGoogleEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }
    
    // Generate a state parameter that includes the email
    const state = Buffer.from(JSON.stringify({
      action: 'validate',
      email: email
    })).toString('base64');

    // Create the authentication URL with the state parameter
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || '')}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('profile email openid')}` +
      `&state=${state}` +
      `&prompt=select_account`;
    
    return successResponse(res, { authUrl }, 'Google authentication URL generated');
  } catch (error) {
    return errorResponse(res, 'Failed to check Google email', 500, error);
  }
};

/**
 * @desc    Validate if email exists in Google
 * @route   POST /api/auth/validate-google-email
 * @access  Public
 */
export const validateEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // First check if the email already exists in our database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ 
        exists: true, 
        inDatabase: true,
        message: 'Email already registered in our system'
      });
    }
    
    // Check if email exists in Google
    try {
      // This is a simplified check. In a real implementation, you might use Google's Directory API
      // or another appropriate method to validate an email
      // Use fetch instead of axios for simpler API
      const response = await fetch(`https://accounts.google.com/gsi/button?email=${email}`);
      
      // If we get a successful response and it contains certain indicators
      // This is a basic heuristic and may need refinement
      const exists = response.status === 200;
      
      return res.json({ 
        exists,
        inDatabase: false,
        message: exists ? 'Email exists in Google' : 'Email not found in Google'
      });
    } catch (error) {
      // If there's an error, assume the email doesn't exist or cannot be verified
      return res.json({ 
        exists: false,
        inDatabase: false,
        message: 'Unable to verify email with Google'
      });
    }
  } catch (error) {
    console.error('Error validating email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Validate if a Gmail address exists
 * @route POST /api/auth/validate-gmail
 * @access Public
 */
export const validateGmailExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Validate if this is a Gmail address
    const validation = validateGmail(email);
    if (!validation.isValid) {
      res.status(200).json({
        success: false,
        exists: false,
        validFormat: false,
        message: validation.message || 'Invalid Gmail address format'
      });
      return;
    }

    // Check if the email already exists in our database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(200).json({
        success: true,
        exists: true,
        validFormat: true,
        message: 'Email already exists in our database'
      });
      return;
    }

    // Check if the Gmail account exists using our utility
    const gmailCheck = await checkGmailExists(email);
    
    res.status(200).json({
      success: true,
      exists: gmailCheck.isValid,
      validFormat: true,
      message: gmailCheck.message || 'Email validation completed'
    });
  } catch (error) {
    console.error('Error validating Gmail:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating Gmail'
    });
  }
}; 