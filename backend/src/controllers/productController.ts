import { Request, Response } from 'express';
import Product from '../models/productModel';
import { successResponse, errorResponse } from '../utils/apiResponse';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return successResponse(res, products, 'Products retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to get products', 500, error);
  }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    
    return successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to get product', 500, error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/admin/products
 * @access  Admin
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category, price, image, description, tags, stock } = req.body;
    
    // Validate required fields
    if (!name || !category || !price || !image || !description) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }
    
    const product = await Product.create({
      name,
      category,
      price,
      image,
      description,
      tags: tags || [],
      stock: stock || 0,
    });
    
    return successResponse(res, product, 'Product created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create product', 500, error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/admin/products/:id
 * @access  Admin
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    return successResponse(res, updatedProduct, 'Product updated successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to update product', 500, error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/admin/products/:id
 * @access  Admin
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    
    await product.deleteOne();
    
    return successResponse(res, { id: req.params.id }, 'Product deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete product', 500, error);
  }
};

/**
 * @desc    Get product statistics
 * @route   GET /api/admin/products/stats
 * @access  Admin
 */
export const getProductStats = async (req: Request, res: Response) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();
    
    // Products by category
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Product price range
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);
    
    // Low stock products (less than 10 items)
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    
    return successResponse(res, {
      totalProducts,
      categories,
      priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
      lowStockProducts
    }, 'Product statistics retrieved successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to get product statistics', 500, error);
  }
}; 