import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleApiError, showSuccess } from '@/services/errorHandler';
import Navbar from '@/components/Navbar';
import { Package, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'Apparel',
  'Equipment',
  'Footwear',
  'Accessories',
  'Electronics',
  'Training',
  'Nutrition',
  'Other'
];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
    stock: '',
    tags: ''
  });
  
  // Check if admin is logged in
  useEffect(() => {
    if (!api.admin.isAdmin()) {
      navigate('/admin');
    }
  }, [navigate]);
  
  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadProduct = async () => {
        setLoading(true);
        try {
          const response = await api.admin.getProductById(id!);
          
          if (response.success) {
            const productData = response.data;
            setProduct({
              name: productData.name,
              category: productData.category,
              price: productData.price.toString(),
              image: productData.image,
              description: productData.description,
              stock: productData.stock.toString(),
              tags: productData.tags.join(', ')
            });
          } else {
            handleApiError({ message: 'Failed to load product' }, 'Error');
            navigate('/admin/dashboard');
          }
        } catch (error) {
          handleApiError(error, 'Failed to load product');
          navigate('/admin/dashboard');
        } finally {
          setLoading(false);
        }
      };
      
      loadProduct();
    }
  }, [isEditMode, id, navigate]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setProduct(prev => ({ ...prev, category: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Format the data
      const productData = {
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        image: product.image,
        description: product.description,
        stock: parseInt(product.stock),
        tags: product.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      // Validate required fields
      if (!productData.name || !productData.category || !productData.price || !productData.image) {
        handleApiError({ message: 'Please fill in all required fields' }, 'Validation Error');
        setSaving(false);
        return;
      }
      
      let response;
      
      if (isEditMode) {
        response = await api.admin.updateProduct(id!, productData);
      } else {
        response = await api.admin.createProduct(productData);
      }
      
      if (response.success) {
        showSuccess(`Product ${isEditMode ? 'updated' : 'created'} successfully`);
        navigate('/admin/dashboard');
      } else {
        handleApiError({ message: `Failed to ${isEditMode ? 'update' : 'create'} product` }, 'Error');
      }
    } catch (error) {
      handleApiError(error, `Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">{isEditMode ? 'Edit' : 'Add'} Product</h1>
            </div>
            <div className="flex items-center justify-center p-2 bg-amber-500/20 rounded-full">
              <Package className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={product.category} 
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger id="category" className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-white/20 text-white">
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    name="image"
                    value={product.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                  {product.image && (
                    <div className="mt-2">
                      <img 
                        src={product.image} 
                        alt="Product preview" 
                        className="w-40 h-40 object-cover rounded-md border border-white/20" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    className="bg-white/10 border-white/20 text-white min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={product.tags}
                    onChange={handleChange}
                    placeholder="tag1, tag2, tag3"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigate('/admin/dashboard')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Product' : 'Create Product'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForm; 