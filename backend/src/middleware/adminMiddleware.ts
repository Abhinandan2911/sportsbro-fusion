import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

/**
 * Admin authentication middleware
 * Verifies the admin JWT token and checks admin role
 */
export const adminProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check if token exists in query string (for ease of development/testing)
    else if (req.query.token) {
      token = req.query.token as string;
    }

    // If no token is found, check for the admin token environment variable
    if (!token) {
      const adminTokenFromEnv = process.env.ADMIN_TOKEN;
      const providedAdminToken = req.headers['x-admin-token'] || req.query.adminToken;
      
      if (adminTokenFromEnv && providedAdminToken === adminTokenFromEnv) {
        // Skip the JWT verification if using the admin token directly
        // This is simpler for admin-only routes
        next();
        return;
      }
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is an admin (can be implemented based on your user model)
    // This assumes you add an isAdmin field to the user model
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    // Set the user in the request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

/**
 * Simple admin check middleware
 * Verifies only the admin token from environment variables
 * This is simpler than full JWT verification but less secure
 */
export const simpleAdminCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    const providedAdminToken = req.headers['x-admin-token'] || req.query.adminToken;
    
    console.log('Admin authentication debug:');
    console.log('- Admin token from env:', adminToken ? '[SET]' : '[NOT SET]');
    console.log('- Provided token:', providedAdminToken ? '[PROVIDED]' : '[NOT PROVIDED]');
    console.log('- Token match:', providedAdminToken === adminToken ? 'YES' : 'NO');
    
    if (!adminToken) {
      console.error('ADMIN_TOKEN not set in environment variables!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Admin token not set'
      });
    }
    
    if (!providedAdminToken) {
      return res.status(401).json({
        success: false,
        message: 'Admin token not provided'
      });
    }
    
    if (providedAdminToken !== adminToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin token'
      });
    }
    
    console.log('Admin authentication successful!');
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }
}; 