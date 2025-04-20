import express from 'express';
import passport from 'passport';
import { protect } from '../middlewares/authMiddleware';
import User from '../models/user.model';

const router = express.Router();

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth authentication
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Successful login
    const userWithToken = req.user as any;
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-callback?token=${userWithToken.token}`;
    res.redirect(redirectUrl);
  }
);

// Get user profile (protected)
router.get('/profile', protect, async (req, res) => {
  try {
    // User is already attached to request by protect middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhoto: user.profilePhoto,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user profile (protected)
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, profilePhoto } = req.body;
    const userId = req.user._id;
    
    // Only allow updating certain fields
    const updates = {} as any;
    if (fullName) updates.fullName = fullName;
    if (profilePhoto) updates.profilePhoto = profilePhoto;
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updates,
      { new: true } // Return updated user
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      success: true,
      data: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePhoto: updatedUser.profilePhoto,
        authProvider: updatedUser.authProvider
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 