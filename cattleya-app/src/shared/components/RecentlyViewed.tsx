'use client';

import { motion } from 'framer-motion';
import {
  ClockIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { useWishlistStore } from '@/core/application/stores/useWishlistStore';
import { Product } from '@/core/domain/entities/Product';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface RecentlyViewedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export default function RecentlyViewed({ 
  limit = 6, 
  showHeader = true,
  className = ""
}: RecentlyViewedProps) {
  const {
    getRecentlyViewed,
    clearRecentlyViewed
  } = useProductStore();
  const { 
    isInWishlist: isInWishlistStore, 
    addToWishlist: addToWishlistStore, 
    removeFromWishlist: removeFromWishlistStore
  } = useWishlistStore();
  
  const { addItem } = useCartStore();

  const recentlyViewed = getRecentlyViewed().slice(0, limit);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      quantity: 1
    });
    
    toast.success(`Added ${product.name || 'Product'} to cart`);
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlistStore(product.id)) {
      removeFromWishlistStore(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlistStore(product.id);
      toast.success('Added to wishlist');
    }
  };

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ClockIcon className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-gray-600">Products you've looked at recently</p>
            </div>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Clear All
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {recentlyViewed.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <img
                  src={product.images.find(img => img.isMain)?.url || product.images[0]?.url || '/placeholder-product.jpg'}
                  alt={product.name || 'Unnamed Product'}
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
                    🔥 Sale
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
                    {isInWishlistStore(product.id) ? (
                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  
                  <Link
                    href={`/products/${product.id}`}
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
            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs text-purple-600 font-medium">
                  {product.category?.name || 'Uncategorized'}
                </span>
              </div>
              
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors duration-200">
                  {product.name || 'Unnamed Product'}
                </h3>
              </Link>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
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
                  <span className="ml-1 text-xs text-gray-500">
                    ({product.totalReviews})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-purple-600">
                    ${(product.isOnSale && product.salePrice ? product.salePrice : product.basePrice).toFixed(2)}
                  </span>
                  {product.isOnSale && product.salePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.basePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stockQuantity === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Link */}
      {recentlyViewed.length >= limit && (
        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            View All Products
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
} 