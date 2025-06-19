'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  TrashIcon,
  ShareIcon,
  StarIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock wishlist data
const mockWishlistItems = [
  {
    id: '1',
    name: 'Cattleya Orchid Premium',
    description: 'Premium Cattleya orchid with vibrant purple blooms',
    price: 149.99,
    originalPrice: 179.99,
    image: '🌺',
    category: 'Orchids',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    stockCount: 25,
    addedDate: '2024-01-10',
    onSale: true,
    discount: 17
  },
  {
    id: '2',
    name: 'Rare Cattleya Collection',
    description: 'Exclusive collection of rare Cattleya varieties',
    price: 299.99,
    originalPrice: 299.99,
    image: '🌸',
    category: 'Orchids',
    rating: 4.7,
    reviews: 89,
    inStock: true,
    stockCount: 8,
    addedDate: '2024-01-08',
    onSale: false,
    discount: 0
  },
  {
    id: '3',
    name: 'Orchid Care Kit Professional',
    description: 'Complete professional care kit with premium tools',
    price: 129.99,
    originalPrice: 149.99,
    image: '🧴',
    category: 'Accessories',
    rating: 4.9,
    reviews: 234,
    inStock: true,
    stockCount: 45,
    addedDate: '2024-01-05',
    onSale: true,
    discount: 13
  },
  {
    id: '4',
    name: 'Beginner Orchid Set',
    description: 'Perfect starter set for orchid beginners',
    price: 79.99,
    originalPrice: 79.99,
    image: '🌱',
    category: 'Orchids',
    rating: 4.6,
    reviews: 167,
    inStock: false,
    stockCount: 0,
    addedDate: '2024-01-03',
    onSale: false,
    discount: 0
  },
  {
    id: '5',
    name: 'Premium Orchid Fertilizer',
    description: 'Specially formulated fertilizer for optimal growth',
    price: 34.99,
    originalPrice: 39.99,
    image: '🌿',
    category: 'Fertilizers',
    rating: 4.5,
    reviews: 298,
    inStock: true,
    stockCount: 120,
    addedDate: '2024-01-01',
    onSale: true,
    discount: 13
  },
  {
    id: '6',
    name: 'Decorative Orchid Pot Set',
    description: 'Beautiful ceramic pots perfect for orchid display',
    price: 89.99,
    originalPrice: 89.99,
    image: '🏺',
    category: 'Accessories',
    rating: 4.4,
    reviews: 145,
    inStock: true,
    stockCount: 67,
    addedDate: '2023-12-28',
    onSale: false,
    discount: 0
  }
];

export default function CustomerWishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['all', ...Array.from(new Set(wishlistItems.map(item => item.category.toLowerCase())))];

  const filteredItems = wishlistItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        case 'oldest':
          return new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const moveToCart = (id: string) => {
    // In a real app, this would add to cart and optionally remove from wishlist
    console.log('Moving item to cart:', id);
  };

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
  const totalSavings = wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0);
  const inStockItems = wishlistItems.filter(item => item.inStock).length;

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-2">Save your favorite orchids and accessories</p>
            </div>
            <button className="flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 font-medium">
              <ShareIcon className="w-5 h-5 mr-2" />
              Share Wishlist
            </button>
          </div>
        </div>

        {/* Wishlist Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                <HeartSolidIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inStockItems}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">${totalSavings.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Product Image */}
              <div className="relative p-6">
                <div className="aspect-square bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-6xl mb-4">
                  {item.image}
                </div>
                
                {item.onSale && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                    -{item.discount}%
                  </div>
                )}
                
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors duration-200"
                >
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                    {item.category}
                  </span>
                  {!item.inStock && (
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {item.rating} ({item.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">${item.price}</span>
                    {item.onSale && (
                      <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                    )}
                  </div>
                  {item.inStock && (
                    <span className="text-sm text-green-600">{item.stockCount} in stock</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveToCart(item.id)}
                    disabled={!item.inStock}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                      item.inStock
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  
                  <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <EyeIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Added Date */}
                <p className="text-xs text-gray-500 mt-3">Added on {item.addedDate}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {wishlistItems.length === 0 
                ? 'Start adding orchids and accessories you love!' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200">
              Explore Products
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600">Manage your entire wishlist</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  Move All to Cart
                </button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors duration-200">
                  Clear Wishlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
} 