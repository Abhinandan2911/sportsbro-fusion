import { Request, Response } from 'express';
import User from '../models/userModel';
import { successResponse, errorResponse } from '../utils/apiResponse';
import mongoose from 'mongoose';
import Product from '../models/productModel';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Optional query parameters for filtering
    const { limit = 50, page = 1, search = '', authProvider } = req.query;
    
    // Build query
    let query: any = {};
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by auth provider if specified
    if (authProvider) {
      query.authProvider = authProvider;
    }
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Get users
    const users = await User.find(query)
      .select('-password') // Exclude password for security
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    return successResponse(res, {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    }, 'Users retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to get users', 500, error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to get user', 500, error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Update user fields
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
    user.gender = req.body.gender || user.gender;
    user.sports = req.body.sports || user.sports;
    user.achievements = req.body.achievements || user.achievements;
    user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
    user.authProvider = req.body.authProvider || user.authProvider;
    
    // If email is being changed, make sure it's not already taken
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return errorResponse(res, 'Email is already in use', 400);
      }
    }
    
    // If username is being changed, make sure it's not already taken
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({ username: req.body.username });
      if (usernameExists) {
        return errorResponse(res, 'Username is already taken', 400);
      }
    }
    
    const updatedUser = await user.save();
    
    return successResponse(res, updatedUser, 'User updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update user', 500, error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    await user.deleteOne();
    
    return successResponse(res, { id: userId }, 'User deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete user', 500, error);
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/admin/stats
 * @access  Admin
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const User = mongoose.model('User');
    const Product = mongoose.model('Product');
    
    // Get user stats
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    
    // Get auth provider stats
    const authProviders = {
      google: await User.countDocuments({ authProvider: 'google' }),
      local: await User.countDocuments({ authProvider: { $ne: 'google' } })
    };
    
    // Get profile completion stats
    const profileCompletion = {
      withPhoto: await User.countDocuments({ 
        $and: [
          { profilePhoto: { $exists: true } },
          { profilePhoto: { $ne: null } },
          { profilePhoto: { $ne: '' } }
        ]
      }),
      withSports: await User.countDocuments({ sports: { $exists: true, $ne: [], $not: { $size: 0 } } }),
      withAchievements: await User.countDocuments({ achievements: { $exists: true, $ne: [], $not: { $size: 0 } } })
    };
    
    // Get product stats if Product model exists
    let productStats = null;
    try {
      const totalProducts = await Product.countDocuments();
      
      const stockStats = await Product.aggregate([
        { $group: { 
            _id: null, 
            totalStock: { $sum: '$stock' }, 
            avgRating: { $avg: '$rating' } 
          } 
        }
      ]);
      
      productStats = {
        totalProducts,
        totalStock: stockStats[0]?.totalStock || 0,
        avgRating: stockStats[0]?.avgRating?.toFixed(2) || 0,
      };
    } catch (error) {
      console.log('Product stats not available:', error);
    }
    
    return successResponse(res, {
      totalUsers,
      recentUsers,
      authProviders,
      profileCompletion,
      productStats
    }, 'User statistics retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to get user statistics', 500, error);
  }
}; 