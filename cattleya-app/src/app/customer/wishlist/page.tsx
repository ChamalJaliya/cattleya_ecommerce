'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  TrashIcon,
  ShareIcon,
  StarIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';
import { useWishlistStore } from '@/core/application/stores/useWishlistStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function CustomerWishlistPage() {
  const { 
    wishlist, 
    isLoading, 
    error, 
    fetchWishlist, 
    removeFromWishlist: removeFromWishlistStore,
    clearWishlist: clearWishlistStore
  } = useWishlistStore();
  
  const { addItem: addToCart } = useCartStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const wishlistItems = (wishlist?.items || []);

  const categories = ['all', ...Array.from(new Set(wishlistItems.map(item => (item.product.category?.name || '').toLowerCase())))]

  const filteredItems = wishlistItems
    .filter(item => {
      const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || (item.product.category?.name || '').toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'oldest':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case 'price-low':
          return (a.product.displayPrice || a.product.basePrice) - (b.product.displayPrice || b.product.basePrice);
        case 'price-high':
          return (b.product.displayPrice || b.product.basePrice) - (a.product.displayPrice || a.product.basePrice);
        case 'rating':
          return (b.product.averageRating || 0) - (a.product.averageRating || 0);
        default:
          return 0;
      }
    });

  const removeFromWishlist = async (productId: string) => {
    await removeFromWishlistStore(productId);
  };

  const moveToCart = async (productId: string) => {
    try {
      await addToCart({
        productId,
        quantity: 1,
      });
      // Remove from wishlist after successfully adding to cart
      await removeFromWishlistStore(productId);
      toast.success('Moved to cart and removed from wishlist');
    } catch (error) {
      console.error('Failed to move item to cart:', error);
      toast.error('Failed to move item to cart');
    }
  };

  const moveAllToCart = async () => {
    try {
      const inStockItems = wishlistItems.filter(item => item.product.isInStock);
      
      if (inStockItems.length === 0) {
        toast.error('No in-stock items to move to cart');
        return;
      }

      // Add all in-stock items to cart
      for (const item of inStockItems) {
        await addToCart({
          productId: item.product.id,
          quantity: 1,
        });
      }

      // Clear the wishlist after successfully adding items to cart
      await clearWishlistStore();
      
      toast.success(`Successfully moved ${inStockItems.length} items to cart and cleared wishlist!`);
    } catch (error) {
      console.error('Failed to move all items to cart:', error);
      toast.error('Failed to move items to cart. Please try again.');
    }
  };

  const viewProduct = (id: string) => {
    // Navigate to product detail page
    window.location.href = `/products/${id}`;
  };

  const totalValue = wishlistItems.reduce((sum, item) => sum + (item.product.displayPrice || item.product.basePrice), 0);
  const totalSavings = 0; // You can calculate this if you have sale/original price
  const inStockItems = wishlistItems.filter(item => item.product.isInStock).length;

  const stats = [
    {
      name: 'Total Items',
      value: wishlistItems.length,
      icon: HeartSolidIcon,
      gradient: 'from-pink-500 via-red-500 to-rose-500',
      description: 'Saved items'
    },
    {
      name: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: TagIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      description: 'Worth of items'
    },
    {
      name: 'In Stock',
      value: inStockItems,
      icon: ShoppingCartIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      description: 'Available now'
    },
    {
      name: 'Total Savings',
      value: `$${totalSavings.toFixed(2)}`,
      icon: TagIcon,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      description: 'From discounts'
    }
  ];

  // Loading state
  if (isLoading && !wishlist) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // Error state
  if (error && !wishlist) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading wishlist</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchWishlist}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl -z-10"></div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <SparklesIcon className="w-4 h-4 mr-2 text-purple-500" />
                Save your favorite orchids and accessories
              </p>
            </div>
            <button className="group relative overflow-hidden flex items-center px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative flex items-center">
                <ShareIcon className="w-5 h-5 mr-2" />
                Share Wishlist
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Wishlist Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative cursor-pointer"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent my-2">
                      {stat.value}
                    </p>
                    <span className="text-xs text-gray-500">{stat.description}</span>
                  </div>
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Search and Filters */}
        <div className="group relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative group">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search wishlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
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
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
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
        </div>

        {/* Enhanced Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                {/* Product Image */}
                <div className="relative p-6">
                  <div className="aspect-square bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-6xl mb-4 shadow-sm">
                    {item.product.images[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product.name} className="w-64 h-64 object-cover rounded-xl" />
                    ) : (
                      <div className="w-64 h-64 bg-gray-200 flex items-center justify-center text-gray-400 rounded-xl">No Image</div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-all duration-200 group-hover:scale-110"
                  >
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full border border-purple-200">
                      {item.product.category?.name || 'Orchids'}
                    </span>
                    {!item.product.isInStock && (
                      <span className="text-sm text-red-600 font-semibold">Out of Stock</span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.product.description}</p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {item.product.averageRating} ({item.product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">${(item.product.displayPrice || item.product.basePrice)?.toFixed(2) ?? '0.00'}</span>
                    </div>
                    {item.product.isInStock && (
                      <span className="text-sm text-green-600 font-semibold">{item.product.stockQuantity} in stock</span>
                    )}
                  </div>

                  {/* Enhanced Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveToCart(item.product.id)}
                      disabled={!item.product.isInStock}
                      className={`group/btn relative overflow-hidden flex-1 flex items-center justify-center px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                        item.product.isInStock
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300 ${!item.product.isInStock ? 'hidden' : ''}`}></div>
                      <div className="relative flex items-center">
                        <ShoppingCartIcon className="w-4 h-4 mr-2" />
                        {item.product.isInStock ? 'Add to Cart' : 'Out of Stock'}
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => viewProduct(item.product.id)}
                      className="group/btn relative overflow-hidden w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                      <div className="relative">
                        <EyeIcon className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors duration-200" />
                      </div>
                    </button>
                  </div>

                  {/* Added Date */}
                  <p className="text-xs text-gray-500 mt-3">Added {formatDistanceToNow(new Date(item.addedAt), { addSuffix: true })}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {wishlistItems.length === 0 
                ? 'Start adding orchids and accessories you love!' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            <Link href="/products">
              <button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative">Explore Products</div>
              </button>
            </Link>
          </div>
        )}

        {/* Enhanced Quick Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-gray-600">Manage your entire wishlist</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={moveAllToCart}
                    className="group/btn relative overflow-hidden px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                    <div className="relative">Move All to Cart</div>
                  </button>
                  <button 
                    onClick={clearWishlistStore}
                    className="group/btn relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-xl hover:from-red-200 hover:to-pink-200 transition-all duration-200"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                    <div className="relative">Clear Wishlist</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
} 