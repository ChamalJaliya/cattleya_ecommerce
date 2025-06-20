'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ScaleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { Product } from '@/core/domain/entities/Product';
import AdvancedSearch from '@/shared/components/AdvancedSearch';
import ProductComparison from '@/shared/components/ProductComparison';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductsPage() {
  const {
    getFilteredProducts,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    addToComparison,
    removeFromComparison,
    isInComparison,
    getComparisonProducts,
    addToRecentlyViewed
  } = useProductStore();
  
  const { addItem } = useCartStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showComparison, setShowComparison] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const products = getFilteredProducts();
  const comparisonProducts = getComparisonProducts();

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.isOnSale && product.salePrice ? product.salePrice : product.basePrice,
      originalPrice: product.isOnSale && product.salePrice ? product.basePrice : undefined,
      image: product.images.find(img => img.isMain)?.url || product.images[0]?.url || '/placeholder-product.jpg',
      variant: { size: product.defaultSize },
      inStock: product.stockQuantity > 0,
      maxQuantity: product.stockQuantity,
      quantity: 1
    });
    
    toast.success(`Added ${product.name} to cart`);
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleComparisonToggle = (product: Product) => {
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
      toast.success('Removed from comparison');
    } else {
      if (comparisonProducts.length >= 4) {
        toast.error('You can compare up to 4 products at a time');
        return;
      }
      addToComparison(product);
      toast.success('Added to comparison');
    }
  };

  const handleProductClick = (productId: string) => {
    addToRecentlyViewed(productId);
  };

  // Show loading state until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/30 to-pink-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Orchid Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover our premium selection of exotic orchids, carefully curated for enthusiasts and collectors.
          </p>
        </div>

        {/* Advanced Search */}
        <div className="mb-8">
          <AdvancedSearch
            placeholder="Search our orchid collection..."
            showFilters={true}
            className="max-w-4xl"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </span>
            
            {/* Comparison Counter */}
            {comparisonProducts.length > 0 && (
              <button
                onClick={() => setShowComparison(true)}
                className="flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors duration-200"
              >
                <ScaleIcon className="w-4 h-4 mr-2" />
                Compare ({comparisonProducts.length})
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any orchids matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
          }>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'grid' ? 'hover:-translate-y-2' : ''
                } ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'
                }`}>
                  <Link 
                    href={`/products/${product.id}`}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <img
                      src={product.images.find(img => img.isMain)?.url || product.images[0]?.url || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    {product.isFeatured && (
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    {product.isOnSale && product.salePrice && (
                      <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        🔥 {Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}% OFF
                      </span>
                    )}
                    {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
                      <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ⚡ Low Stock
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 shadow-sm"
                      >
                        {isInWishlist(product.id) ? (
                          <HeartSolidIcon className="w-4 h-4 text-red-500" />
                        ) : (
                          <HeartIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleComparisonToggle(product)}
                        className={`w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors duration-200 shadow-sm ${
                          isInComparison(product.id)
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-white/90 text-gray-600 hover:bg-white'
                        }`}
                      >
                        {isInComparison(product.id) ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <ScaleIcon className="w-4 h-4" />
                        )}
                      </button>
                      
                      <Link
                        href={`/products/${product.id}`}
                        onClick={() => handleProductClick(product.id)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 shadow-sm"
                      >
                        <EyeIcon className="w-4 h-4 text-gray-600" />
                      </Link>
                    </div>
                  </div>

                  {/* Stock Status */}
                  {product.stockQuantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="mb-2">
                    <span className="text-xs text-purple-600 font-medium">
                      {product.category.name}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/products/${product.id}`}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors duration-200">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.shortDescription}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.averageRating) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        {product.averageRating.toFixed(1)} ({product.totalReviews})
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-purple-600">
                        ${(product.isOnSale && product.salePrice ? product.salePrice : product.basePrice).toFixed(2)}
                      </span>
                      {product.isOnSale && product.salePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{product.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stockQuantity === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ShoppingCartIcon className="w-5 h-5 mr-2" />
                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Comparison Modal */}
      <ProductComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  );
} 