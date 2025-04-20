import { useState } from 'react';
import { Search, Filter, Star, ShoppingCart, Activity, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';

// Sample product data (in a real app, this would come from an API)
const products = [
  {
    id: 1,
    name: 'Pro Basketball',
    category: 'Basketball',
    price: 29.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&q=80',
    description: 'Professional grade basketball with superior grip and durability.',
    tags: ['basketball', 'equipment'],
  },
  {
    id: 2,
    name: 'Training Shoes',
    category: 'Footwear',
    price: 89.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    description: 'Versatile training shoes perfect for any workout.',
    tags: ['shoes', 'training'],
  },
  {
    id: 3,
    name: 'Compression Shirt',
    category: 'Apparel',
    price: 34.99,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80',
    description: 'High-performance compression shirt for maximum comfort.',
    tags: ['apparel', 'training'],
  },
  // Add more products as needed
];

const categories = [
  'All',
  'Basketball',
  'Football',
  'Soccer',
  'Training',
  'Running',
  'Tennis',
];

export const GearHub = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      {/* Hero Section */}
      <div className="relative h-[300px] sm:h-[350px] md:h-[400px] bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80')] bg-cover bg-center opacity-30"
          style={{ backgroundPosition: '50% 30%' }}
        />
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Ultimate Sports Gear Destination
            </h1>
            <p className="text-lg text-gray-300">
              Discover premium equipment and apparel for every athlete
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] rounded-lg border border-white/10 focus:outline-none focus:border-white/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-white text-black"
                    : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#2a2a2a] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{product.category}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                    <span className="ml-1 text-sm drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{product.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">${product.price}</span>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="bg-[#2a2a2a] rounded-lg overflow-hidden flex items-center gap-4 p-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300"
            >
              <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h3 className="font-semibold drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{product.name}</h3>
                <p className="text-sm text-gray-400 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-[#2a2a2a] border-y border-white/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Find Your Perfect Gear</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore our full collection of premium sports gear and equipment.
          </p>
          <a 
            href="#" 
            className="inline-flex items-center bg-white text-[#1a1a1a] hover:bg-gray-100 px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
          >
            Shop All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-7 w-7 text-white" />
                <span className="text-xl font-display font-bold">SportsBro</span>
              </div>
              <p className="text-gray-300 mb-4">
                Empowering village athletes to train effectively, build teams, and excel in sports.
              </p>
            </div>
            
            {[
              {
                title: "Shop",
                links: ["Equipment", "Apparel", "Footwear", "Accessories"]
              },
              {
                title: "Customer Care",
                links: ["Shipping", "Returns", "Size Guide", "Contact Us"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Privacy Policy", "Terms of Service"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4 text-white">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/10 pt-8 mt-8 text-center text-gray-300 text-sm">
            <p>&copy; {new Date().getFullYear()} SportsBro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GearHub; 