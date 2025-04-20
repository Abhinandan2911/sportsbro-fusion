import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserStats 
} from '../controllers/adminController';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} from '../controllers/productController';
import { simpleAdminCheck } from '../middleware/adminMiddleware';

const router = express.Router();

// Add a test route that doesn't use the middleware for testing
router.get('/test-token', (req, res) => {
  const adminToken = process.env.ADMIN_TOKEN;
  const providedToken = req.query.adminToken;
  
  console.log('Admin token test:');
  console.log('- Admin token from env:', adminToken ? '[SET]' : '[NOT SET]');
  console.log('- Admin token value:', adminToken);
  console.log('- Provided token:', providedToken ? '[PROVIDED]' : '[NOT PROVIDED]');
  console.log('- Provided token value:', providedToken);
  console.log('- Match:', providedToken === adminToken ? 'YES' : 'NO');
  
  return res.json({
    success: true,
    message: 'Admin token verification details',
    details: {
      adminTokenSet: !!adminToken,
      providedTokenReceived: !!providedToken,
      match: providedToken === adminToken
    }
  });
});

// Apply admin middleware to all routes
router.use(simpleAdminCheck);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Product management routes
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/stats', getProductStats);

// Statistics routes
router.get('/stats', getUserStats);

// Example route to find users by auth provider
router.get('/users/filter/google', async (req, res) => {
  try {
    // Create a custom handler to get Google users
    req.query.authProvider = 'google';
    return getAllUsers(req, res);
  } catch (error) {
    console.error('Error filtering Google users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 