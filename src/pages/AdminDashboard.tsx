import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { LogOut, Users, BarChart2, Settings, Search, User, Filter, Package, PlusCircle, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { handleApiError, showSuccess } from '@/services/errorHandler';
import AdminStats from '@/components/AdminStats';

// Define tabs
type Tab = 'users' | 'products' | 'stats' | 'settings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterProvider, setFilterProvider] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Check if admin is logged in
  useEffect(() => {
    if (!api.admin.isAdmin()) {
      navigate('/admin');
    }
  }, [navigate]);
  
  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.admin.getUsers({
        page,
        limit: 10,
        search: searchTerm,
        authProvider: filterProvider || undefined
      });
      
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      } else {
        handleApiError({ message: 'Failed to load users' }, 'Error');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.admin.getProducts({
        page,
        limit: 10,
        search: searchTerm,
        category: filterCategory || undefined
      });
      
      if (response.success) {
        setProducts(response.data);
        // Handle pagination if it's available
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        } else {
          setTotalPages(1);
        }
      } else {
        handleApiError({ message: 'Failed to load products' }, 'Error');
      }
    } catch (error) {
      handleApiError(error, 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await api.admin.deleteProduct(id);
        
        if (response.success) {
          showSuccess('Product deleted successfully');
          // Remove product from list
          setProducts(products.filter(product => product._id !== id));
        } else {
          handleApiError({ message: 'Failed to delete product' }, 'Error');
        }
      } catch (error) {
        handleApiError(error, 'Failed to delete product');
      }
    }
  };
  
  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'products') {
      loadProducts();
    }
    // Stats tab is now handled by the AdminStats component
  }, [activeTab, page, searchTerm, filterProvider, filterCategory]);
  
  // Handle admin logout
  const handleLogout = () => {
    api.admin.logout();
    navigate('/admin');
    showSuccess('Logged out successfully');
  };
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {/* Header with logout */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button
              variant="ghost"
              className="bg-red-500/20 hover:bg-red-500/30 text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('products')}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Products
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'stats' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('stats')}
            >
              <BarChart2 className="w-4 h-4 inline mr-2" />
              Statistics
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>
          
          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <div>
              {/* Search and filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="bg-white/10 border-white/20 text-white pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setPage(1);
                        loadUsers();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={`${filterProvider === null ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-white/70'}`}
                    onClick={() => setFilterProvider(null)}
                  >
                    All
                  </Button>
                  <Button
                    variant="outline"
                    className={`${filterProvider === 'google' ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white/70'}`}
                    onClick={() => setFilterProvider('google')}
                  >
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className={`${filterProvider === 'local' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/70'}`}
                    onClick={() => setFilterProvider('local')}
                  >
                    Local
                  </Button>
                </div>
              </div>
              
              {/* Users table */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 text-left">
                          <th className="py-3 px-4 font-medium text-gray-400">Name</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Email</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Username</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Provider</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">{user.fullName}</td>
                              <td className="py-3 px-4">{user.email}</td>
                              <td className="py-3 px-4">{user.username}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.authProvider === 'google' 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {user.authProvider === 'google' ? 'Google' : 'Local'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-500 hover:text-amber-400"
                                  onClick={() => {
                                    console.log(`Navigating to user detail page for ID: ${user._id}`);
                                    navigate(`/admin/user/${user._id}`);
                                  }}
                                >
                                  <User className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-400">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={page === i + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === totalPages}
                          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* Products Tab Content */}
          {activeTab === 'products' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="bg-white/10 border-white/20 text-white pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setPage(1);
                        loadProducts();
                      }
                    }}
                  />
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/admin/products/new')}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
              
              {/* Products table */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 text-left">
                          <th className="py-3 px-4 font-medium text-gray-400">Image</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Name</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Category</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Price</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Stock</th>
                          <th className="py-3 px-4 font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length > 0 ? (
                          products.map((product) => (
                            <tr key={product._id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              </td>
                              <td className="py-3 px-4">{product.name}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  {product.category}
                                </span>
                              </td>
                              <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  product.stock > 10 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : product.stock > 0 
                                      ? 'bg-yellow-500/20 text-yellow-400' 
                                      : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-amber-500 hover:text-amber-400 h-8 px-2"
                                    onClick={() => navigate(`/admin/products/${product._id}`)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-400 h-8 px-2"
                                    onClick={() => handleDeleteProduct(product._id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-gray-400">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={page === i + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === totalPages}
                          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* Stats Tab Content */}
          {activeTab === 'stats' && (
            <AdminStats />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-medium mb-2">Admin Token</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Your admin token is stored securely in your browser. 
                    If you need to reset it, you'll need to log out and log back in.
                  </p>
                  <Button
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500"
                    onClick={handleLogout}
                  >
                    Reset Token & Logout
                  </Button>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="font-medium mb-2">Environment</h3>
                  <p className="text-sm">API URL: {import.meta.env.VITE_API_URL || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 