'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ScaleIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  ChevronDownIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { useWishlistStore } from '@/core/application/stores/useWishlistStore';
import { Product } from '@/core/domain/entities/Product';
import AdvancedSearch from '@/shared/components/AdvancedSearch';
import Pagination from '@/shared/components/Pagination';
import ProductComparison from '@/shared/components/ProductComparison';
import Header from '@/shared/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { customToast } from '@/shared/utils/toast';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A-Z', icon: '🔤' },
  { value: 'price-asc', label: 'Price: Low to High', icon: '💰' },
  { value: 'price-desc', label: 'Price: High to Low', icon: '💎' },
  { value: 'rating', label: 'Highest Rated', icon: '⭐' },
  { value: 'newest', label: 'Newest First', icon: '🆕' },
  { value: 'popularity', label: 'Most Popular', icon: '🔥' },
];

const VIEW_MODES = [
  { value: 'grid' as const, icon: Squares2X2Icon, label: 'Grid View' },
  { value: 'list' as const, icon: ListBulletIcon, label: 'List View' },
];

// Skeleton Loading Component
const ProductSkeleton = ({ viewMode = 'grid' }: { viewMode?: string }) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/20 flex items-center p-6 space-x-6"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-full w-1/2 animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-4">
          <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse" />
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-white/20"
    >
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-3 bg-gray-200 rounded-full w-2/3 animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-full w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-2xl w-1/2 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, viewMode, index }: { product: Product; viewMode: string; index: number }) => {
  const { addItem } = useCartStore();
  const { 
    getComparisonProducts,
    addToComparison, 
    removeFromComparison,
    isInComparison
  } = useProductStore();
  const { 
    wishlist, 
    addToWishlist: addToWishlistStore, 
    removeFromWishlist: removeFromWishlistStore,
    isInWishlist: isInWishlistStore
  } = useWishlistStore();

  const isInWishlist = isInWishlistStore(product.id);
  const isInComparisonList = isInComparison(product.id);
  const isOnSale = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = isOnSale ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100) : 0;
  const isLowStock = product.stockQuantity <= 5;
  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      customToast.warning('Product is out of stock!');
      return;
    }
    
    try {
      await addItem({
        productId: product.id,
        quantity: 1,
      });
      // Toast is handled by the cart store
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Error toast is handled by the cart store
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      try {
        await removeFromWishlistStore(product.id);
        // Toast is handled by the wishlist store
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        // Error toast is handled by the wishlist store
      }
    } else {
      try {
        await addToWishlistStore(product.id);
        // Toast is handled by the wishlist store
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
        // Error toast is handled by the wishlist store
      }
    }
  };

  const handleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInComparisonList) {
      removeFromComparison(product.id);
      customToast.info('Removed from comparison');
    } else {
      const comparisonList = getComparisonProducts();
      if (comparisonList.length >= 4) {
        customToast.warning('You can only compare up to 4 products');
        return;
      }
      
      addToComparison(product);
      customToast.primary('Added to comparison!');
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: star * 0.1, type: "spring", stiffness: 200 }}
          >
            <StarSolidIcon
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'text-yellow-400' 
                  : 'text-gray-200'
              }`}
            />
          </motion.div>
        ))}
        <span className="text-sm font-medium text-gray-600 ml-2">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  // List view layout
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
        whileHover={{ x: 10 }}
        className="group relative"
      >
        <Link href={`/products/${product.id}`}>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/30 hover:shadow-3xl hover:border-purple-200/50 transition-all duration-500 flex items-center p-6 space-x-6">
            {/* Image */}
            <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10" />
              <Image
                src={product.images[0]?.url || '/next.svg'}
                alt={product.name || 'Unnamed Product'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/next.svg';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 space-y-1">
                {isOnSale && (
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                    <FireIcon className="w-3 h-3" />
                    <span>{discountPercent}% OFF</span>
                  </div>
                )}
                {product.tags.includes('featured') && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                    <SparklesIcon className="w-3 h-3" />
                    <span>Featured</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 truncate">
                {product.name || 'Unnamed Product'}
              </h3>
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {product.description}
              </p>

              {/* Rating */}
              <div className="mt-3">
                {renderRating(product.averageRating)}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex flex-col items-end space-y-4">
              {/* Price */}
              <div className="text-right">
                {isOnSale ? (
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${product.salePrice?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      ${product.basePrice.toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    ${product.basePrice.toFixed(2)}
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  Stock: {product.stockQuantity}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isInWishlist
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  {isInWishlist ? (
                    <HeartSolidIcon className="w-4 h-4" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleComparison}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isInComparisonList
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/90 text-gray-600 hover:bg-blue-50 hover:text-blue-500'
                  }`}
                >
                  <ScaleIcon className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(`/products/${product.id}`, '_blank');
                  }}
                  className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-purple-50 hover:text-purple-500 transition-all duration-300"
                >
                  <EyeIcon className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                }`}
              >
                <ShoppingCartIcon className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </motion.button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view layout (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-white/30 hover:shadow-3xl hover:border-purple-200/50 transition-all duration-500 h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10" />
            <Image
              src={product.images[0]?.url || '/next.svg'}
              alt={product.name || 'Unnamed Product'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/next.svg';
              }}
              priority={index < 4}
            />
            
            {/* Floating Badges */}
            <div className="absolute top-4 left-4 space-y-2">
              {isOnSale && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm flex items-center space-x-1"
                >
                  <FireIcon className="w-3 h-3" />
                  <span>{discountPercent}% OFF</span>
                </motion.div>
              )}
              
              {product.tags.includes('featured') && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm flex items-center space-x-1"
                >
                  <SparklesIcon className="w-3 h-3" />
                  <span>Featured</span>
                </motion.div>
              )}
              
              {product.tags.includes('rare') && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm flex items-center space-x-1"
                >
                  <TrophyIcon className="w-3 h-3" />
                  <span>Rare</span>
                </motion.div>
              )}
              
              {isLowStock && !isOutOfStock && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-amber-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm"
                >
                  Only {product.stockQuantity} left!
                </motion.div>
              )}
              
              {isOutOfStock && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm"
                >
                  Out of Stock
                </motion.div>
              )}
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <motion.button
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.8 }}
                onClick={handleWishlist}
                className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-xl ${
                  isInWishlist
                    ? 'bg-red-500 text-white shadow-red-500/25'
                    : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                {isInWishlist ? (
                  <HeartSolidIcon className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.8 }}
                onClick={handleComparison}
                className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-xl ${
                  isInComparisonList
                    ? 'bg-blue-500 text-white shadow-blue-500/25'
                    : 'bg-white/90 text-gray-600 hover:bg-blue-50 hover:text-blue-500'
                }`}
              >
                <ScaleIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`/products/${product.id}`, '_blank');
                }}
                className="p-3 rounded-full bg-white/90 text-gray-600 hover:bg-purple-50 hover:text-purple-500 backdrop-blur-md transition-all duration-300 shadow-xl"
              >
                <EyeIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 line-clamp-2">
                {product.name || 'Unnamed Product'}
              </h3>
              
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {product.description}
              </p>

              {/* Rating */}
              <div className="mt-3">
                {renderRating(product.averageRating)}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4 flex-grow">
                {product.tags.slice(0, 2).map((tag) => (
                  <motion.span
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium backdrop-blur-sm"
                  >
                    {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between mb-4">
                {isOnSale ? (
                  <div className="flex flex-col">
                    <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${product.salePrice?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      ${product.basePrice.toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-gray-900">
                    ${product.basePrice.toFixed(2)}
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  Stock: {product.stockQuantity}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/25 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ProductsPage() {
  const {
    products,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    fetchProducts,
    pagination,
    setPagination,
    getComparisonProducts,
    clearComparison
  } = useProductStore();
  const { fetchWishlist } = useWishlistStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Load initial products only after component is mounted
      fetchProducts({ page: 1, limit: 12, sortBy: 'name', sortOrder: 'asc' });
      // Load wishlist data
      fetchWishlist();
    }
  }, [mounted, fetchProducts, fetchWishlist]);

  const handleSortChange = async (sortValue: string) => {
    updateFilters({ sortBy: sortValue as any });
    setPagination({ currentPage: 1 });
    
    // Map frontend filters to backend API parameters
    const apiQuery = {
      search: filters?.searchQuery || undefined,
      page: 1,
      limit: 12,
      categoryId: filters?.category || undefined,
      minPrice: filters?.priceRange?.[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice: filters?.priceRange?.[1] < 1000 ? filters.priceRange[1] : undefined,
      inStock: filters?.inStock || undefined,
      tags: filters?.tags && filters.tags.length > 0 ? filters.tags : undefined,
      rating: filters?.rating > 0 ? filters.rating : undefined,
      sortBy: sortValue === 'name' ? 'name' : 
              sortValue === 'price-asc' ? 'basePrice' :
              sortValue === 'price-desc' ? 'basePrice' :
              sortValue === 'rating' ? 'averageRating' :
              sortValue === 'newest' ? 'createdAt' : 
              sortValue === 'popularity' ? 'viewCount' : 'name',
      sortOrder: sortValue === 'price-desc' ? 'desc' : 
                 sortValue === 'rating' ? 'desc' :
                 sortValue === 'popularity' ? 'desc' :
                 sortValue === 'newest' ? 'desc' : 'asc'
    };

    // Remove undefined values
    const cleanQuery = Object.fromEntries(
      Object.entries(apiQuery).filter(([_, value]) => value !== undefined)
    );

    await fetchProducts(cleanQuery);
  };

  const handlePageChange = async (page: number) => {
    setPagination({ currentPage: page });
    
    // Map frontend filters to backend API parameters
    const apiQuery = {
      search: filters?.searchQuery || undefined,
      page,
      limit: 12,
      categoryId: filters?.category || undefined,
      minPrice: filters?.priceRange?.[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice: filters?.priceRange?.[1] < 1000 ? filters.priceRange[1] : undefined,
      inStock: filters?.inStock || undefined,
      tags: filters?.tags && filters.tags.length > 0 ? filters.tags : undefined,
      rating: filters?.rating > 0 ? filters.rating : undefined,
      sortBy: filters?.sortBy === 'name' ? 'name' : 
              filters?.sortBy === 'price-asc' ? 'basePrice' :
              filters?.sortBy === 'price-desc' ? 'basePrice' :
              filters?.sortBy === 'rating' ? 'averageRating' :
              filters?.sortBy === 'newest' ? 'createdAt' : 
              filters?.sortBy === 'popularity' ? 'viewCount' : 'name',
      sortOrder: filters?.sortBy === 'price-desc' ? 'desc' : 
                 filters?.sortBy === 'rating' ? 'desc' :
                 filters?.sortBy === 'popularity' ? 'desc' :
                 filters?.sortBy === 'newest' ? 'desc' : 'asc'
    };

    // Remove undefined values
    const cleanQuery = Object.fromEntries(
      Object.entries(apiQuery).filter(([_, value]) => value !== undefined)
    );

    await fetchProducts(cleanQuery);
  };

  const handleClearComparison = () => {
    clearComparison();
    customToast.success('Comparison list cleared!');
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="h-16 bg-gray-200 rounded-3xl animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header Component */}
      <Header 
        title="Exquisite Orchid Collection"
        subtitle="Discover our carefully curated selection of premium orchids, each one a masterpiece of nature's artistry"
      />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-white" />
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-orange-300/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">

        {/* Advanced Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <AdvancedSearch
            placeholder="Search our orchid collection..."
            className="max-w-4xl mx-auto"
          />
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/30 shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
              <SparklesIcon className="w-5 h-5 text-purple-500" />
              <span>
                {loading ? 'Loading...' : `${pagination.totalProducts || 0} exquisite orchids found`}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters?.sortBy || 'name'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-3 pr-10 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-gray-200">
              {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode.value)}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      viewMode === mode.value
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                    title={mode.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Comparison Bar */}
        <AnimatePresence>
          {getComparisonProducts().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-blue-200/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ScaleIcon className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">
                    {getComparisonProducts().length} item{getComparisonProducts().length > 1 ? 's' : ''} selected for comparison
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowComparison(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                  >
                    Compare Now
                  </button>
                  <button
                    onClick={handleClearComparison}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <div className={viewMode === 'list' 
              ? "space-y-6" 
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            }>
              {[...Array(12)].map((_, i) => (
                <ProductSkeleton key={i} viewMode={viewMode} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-red-200/30"
            >
              <div className="text-6xl mb-4">🌺</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchProducts({ page: 1, limit: 12 })}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200/30"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No orchids found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse our full collection</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetFilters();
                  fetchProducts({ page: 1, limit: 12 });
                }}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200"
              >
                View All Orchids
              </motion.button>
            </motion.div>
          ) : (
            <div className={viewMode === 'list' 
              ? "space-y-6" 
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            }>
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {!loading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex justify-center"
          >
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              totalItems={pagination.totalProducts}
              itemsPerPage={12}
            />
          </motion.div>
        )}

        {/* Product Comparison Modal */}
        <ProductComparison
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
        />
      </div>
    </div>
  );
} 