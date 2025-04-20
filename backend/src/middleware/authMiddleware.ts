import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { errorResponse } from '../utils/apiResponse';

// Note: We're using the Express.User type defined by passport

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  console.log('AUTH MIDDLEWARE - Headers:', JSON.stringify(req.headers));

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('AUTH MIDDLEWARE - Token found:', token.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as jwt.JwtPayload;
      
      console.log('AUTH MIDDLEWARE - Token verified, decoded payload:', JSON.stringify(decoded));
      
      // Get user ID from token
      const userId = decoded.id;
      if (!userId) {
        console.error('AUTH MIDDLEWARE - No user ID in token');
        return errorResponse(res, 'Invalid token - missing user ID', 401);
      }
      
      console.log('AUTH MIDDLEWARE - Looking up user with ID:', userId);

      // Get user from the token payload (without password)
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        console.error('AUTH MIDDLEWARE - User not found for ID:', userId);
        return errorResponse(res, 'User not found', 401);
      }

      console.log('AUTH MIDDLEWARE - User found:', user._id.toString());

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('AUTH MIDDLEWARE - Token verification failed:', error);
      return errorResponse(res, 'Not authorized, token failed', 401);
    }
  } else {
    console.error('AUTH MIDDLEWARE - No authorization header or not Bearer format');
    if (!token) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }
  }
};

/**
 * Middleware for handling admin-only routes
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  // Since we haven't implemented admin role yet, just check if user exists
  if (req.user) {
    next();
  } else {
    return errorResponse(res, 'Not authorized as an admin', 403);
  }
}; 