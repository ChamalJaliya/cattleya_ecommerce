'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { useWishlistStore } from '@/core/application/stores/useWishlistStore';
import { ProductSearchResult } from '@/core/infrastructure/api/chatbotApi';
import Link from 'next/link';
import Image from 'next/image';
import { customToast } from '@/shared/utils/toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Add Swiper types for TypeScript
// @ts-ignore
import type { Swiper as SwiperType, SwiperSlide as SwiperSlideType } from 'swiper/react';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Flower,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Plus,
  Minus,
  ChevronDown
} from 'lucide-react';

interface ChatProductCardsProps {
  products: ProductSearchResult[];
  layout?: 'grid' | 'list' | 'single' | 'carousel';
  showActions?: boolean;
  showPricing?: boolean;
  showStock?: boolean;
  showRating?: boolean;
  showTags?: boolean;
}

function renderRating(rating: number) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarSolidIcon
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`}
        />
      ))}
      <span className="ml-2 text-xs text-gray-600 font-medium">({rating.toFixed(1)})</span>
    </div>
  );
}

// Helper to get product image URL safely
function getProductImageUrl(product: ProductSearchResult): string {
  const img = product.images && product.images[0];
  if (!img) return '/public/globe.svg';
  if (typeof img === 'string') return img;
  if ('url' in img && typeof img.url === 'string') return img.url;
  return '/public/globe.svg';
}

export default function ChatProductCards({
  products,
  layout = 'grid',
  showActions = true,
  showPricing = true,
  showStock = true,
  showRating = false,
  showTags = true
}: ChatProductCardsProps) {
  const { addItem } = useCartStore();
  const { 
    wishlist, 
    addToWishlist: addToWishlistStore, 
    removeFromWishlist: removeFromWishlistStore,
    isInWishlist: isInWishlistStore
  } = useWishlistStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  // Mouse drag support for carousel
  const mouseDownRef = useRef<number | null>(null);
  const mouseMoveRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (products.length <= 1 || !isAutoPlaying || isPaused) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [products.length, isAutoPlaying, isPaused]);

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    }

    // Resume auto-play after a short delay
    setTimeout(() => setIsPaused(false), 2000);
  };

  // Mouse hover handlers
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (!products || products.length === 0) {
    return null;
  }

  const handleAddToCart = async (product: ProductSearchResult) => {
    if (product.stockQuantity === 0) {
      customToast.warning('Product is out of stock!');
      return;
    }
    
    try {
      await addItem({
        productId: product.id,
        quantity: 1,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleWishlist = async (product: ProductSearchResult) => {
    const isInWishlist = isInWishlistStore(product.id);
    
    if (isInWishlist) {
      try {
        await removeFromWishlistStore(product.id);
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
      }
    } else {
      try {
        await addToWishlistStore(product.id);
      } catch (error) {
        console.error('Failed to add to wishlist:', error);
      }
    }
  };

  const handleGetDetails = (product: ProductSearchResult) => {
    // TODO: Implement get details functionality
    console.log('Get details:', product.name);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const toggleExpanded = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const handleViewDetails = (product: ProductSearchResult) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const renderProductCard = (product: ProductSearchResult, index: number, compact = false) => {
    const isInWishlist = isInWishlistStore(product.id);
    const isOnSale = product.salePrice && product.salePrice < product.basePrice;
    const discountPercent = isOnSale ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100) : 0;
    const isLowStock = product.stockQuantity <= 5;
    const isOutOfStock = product.stockQuantity === 0;
    const isExpanded = expandedProduct === product.id;
    const hasDetailedInfo = product.hasDetailedInfo || false;

    // Use compact image style for carousel/list
    const imageContainerClass = compact
      ? "relative w-full h-40 overflow-hidden rounded-3xl"
      : "relative aspect-square overflow-hidden";
    const imageClass = compact
      ? "object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
      : "object-cover group-hover:scale-110 transition-transform duration-500";

    return (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: index * 0.1,
          duration: 0.4,
          ease: "easeOut"
        }}
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className={compact
          ? "group relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-purple-200/50 hover:shadow-purple-500/25 hover:border-purple-300 transition-all duration-500 transform w-full max-w-[240px] mx-0 px-0 p-4"
          : "group relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-purple-200/50 hover:shadow-purple-500/25 hover:border-purple-300 transition-all duration-500 transform w-full max-w-[350px] mx-auto p-6"
        }
        style={compact ? { boxSizing: 'border-box' } : {}}
      >
        <Link href={`/products/${product.id}`}>
          <div className="flex flex-col h-full">
            {/* Image */}
            <div className={imageContainerClass}>
              <Image
                src={getProductImageUrl(product)}
                alt={product.name}
                fill={!compact}
                width={compact ? 350 : undefined}
                height={compact ? 160 : undefined}
                className={imageClass}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/next.svg';
                }}
              />
              
              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl"
                >
                  <EyeIcon className="w-6 h-6 text-purple-600" />
                </motion.div>
              </div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 space-y-2">
                {isOnSale && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg"
                  >
                    <FireIcon className="w-3 h-3 animate-pulse" />
                    <span>-{discountPercent}%</span>
                  </motion.div>
                )}
                {product.isFeatured && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg"
                  >
                    <SparklesIcon className="w-3 h-3 animate-spin" />
                    <span>Featured</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2">
                {product.name}
              </h3>
              
              {showRating && (product.averageRating || 0) > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div
                        key={star}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + star * 0.1, type: "spring", stiffness: 200 }}
                      >
                        <StarSolidIcon
                          className={`w-4 h-4 ${
                            star <= (product.averageRating || 0) 
                              ? 'text-yellow-400 drop-shadow-sm' 
                              : 'text-gray-200'
                          }`}
                        />
                      </motion.div>
                    ))}
                    <span className="text-sm text-gray-600 ml-2 font-medium">
                      ({(product.averageRating || 0).toFixed(1)})
                    </span>
                  </div>
                </div>
              )}

              {showTags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.slice(0, 2).map((tag, tagIndex) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + tagIndex * 0.1 }}
                      className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200/50 shadow-sm"
                    >
                      {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Price and Stock */}
              <div className="mt-auto">
                {showPricing && (
                  <div className="mb-4">
                    {isOnSale ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ${product.salePrice?.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ${product.basePrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-green-600 font-semibold">
                          Save ${(product.basePrice - product.salePrice!).toFixed(2)}!
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        ${product.basePrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {showStock && (
                  <div className="mb-4">
                    {isOutOfStock ? (
                      <div className="text-sm text-red-600 font-semibold flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span>Out of Stock</span>
                      </div>
                    ) : isLowStock ? (
                      <div className="text-sm text-orange-600 font-semibold flex items-center space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span>Only {product.stockQuantity} left!</span>
                      </div>
                    ) : (
                      <div className="text-sm text-green-600 font-semibold flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>{product.stockQuantity} in stock</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleWishlist(product);
                        }}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          isInWishlist
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl'
                            : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200/50 shadow-lg'
                        }`}
                      >
                        {isInWishlist ? (
                          <HeartSolidIcon className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        disabled={isOutOfStock}
                        className={`p-3 rounded-full transition-all duration-300 ${
                          isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-xl'
                        }`}
                      >
                        <ShoppingCartIcon className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* View Details Button for Single Layout */}
                    {!compact && layout === 'single' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewDetails(product);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        View Details
                      </motion.button>
                    )}
                  </div>
                )}

                {/* View Details Button for Grid Layout */}
                {!compact && layout === 'grid' && (
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewDetails(product);
                      }}
                      className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      View Details
                    </motion.button>
                  </div>
                )}

                {/* View Details Button for Compact Cards (Carousel) */}
                {compact && (
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewDetails(product);
                      }}
                      className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      View Details
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // Mouse drag support for carousel
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownRef.current = e.clientX;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mouseDownRef.current === null) return;
    mouseMoveRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging || mouseDownRef.current === null || mouseMoveRef.current === null) {
      setIsDragging(false);
      setIsPaused(false);
      return;
    }
    const distance = mouseDownRef.current - mouseMoveRef.current;
    const isLeftDrag = distance > 50;
    const isRightDrag = distance < -50;
    if (isLeftDrag) {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    } else if (isRightDrag) {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    }
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 2000);
    mouseDownRef.current = null;
    mouseMoveRef.current = null;
  };

  // Replace the 'list' layout and unify with 'carousel' layout
  if ((layout === 'list' || layout === 'carousel') && products.length > 1) {
    return (
      <div
        className="relative w-full max-w-[240px] mx-auto overflow-x-hidden flex flex-col items-center p-0 m-0"
        style={{ boxSizing: 'border-box' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={sliderRef}
          className="w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setIsDragging(false); setIsPaused(false); mouseDownRef.current = null; mouseMoveRef.current = null; }}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', boxSizing: 'border-box' }}
        >
          <div
            className="flex flex-nowrap w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)`, boxSizing: 'border-box' }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="w-full flex-shrink-0 flex items-center justify-center p-0 m-0"
                style={{ maxWidth: '240px', boxSizing: 'border-box' }}
              >
                {renderProductCard(product, index, true)}
              </div>
            ))}
          </div>
        </div>
        {/* Dot indicator and swipe hint below the card */}
        <div className="w-full flex flex-col items-center mt-2">
          <div className="flex justify-center space-x-1.5 mb-1">
            {products.map((_, idx) => (
              <button
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'bg-purple-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 2000);
                }}
                aria-label={`Go to product ${idx + 1}`}
              />
            ))}
          </div>
          <div className="text-center text-xs text-gray-500 opacity-60">
            ← Swipe or drag to browse →
          </div>
        </div>

        {/* Product Modal for Carousel */}
        <AnimatePresence>
          {showModal && selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                className="relative w-full max-w-lg mx-4 md:mx-0 rounded-3xl shadow-2xl border-2 border-purple-200 bg-white overflow-hidden flex flex-col max-h-[95vh]"
                onClick={e => e.stopPropagation()}
              >
                {/* Premium Sticky Header with Left Chevron */}
                <div className="sticky top-0 z-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-3xl flex items-center justify-between px-6 py-4 shadow-lg border-b border-blue-200 min-h-[68px] flex-shrink-0">
                  <div className="flex items-center gap-4 w-full">
                    {/* Back Chevron Icon */}
                    <button
                      onClick={closeModal}
                      className="mr-2 p-2 bg-white/70 hover:bg-white rounded-full shadow border border-purple-200 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      aria-label="Back to Chat"
                    >
                      <ChevronDown size={24} className="text-purple-500 rotate-90" />
                    </button>
                    {/* Product Name and Subtitle */}
                    <div className="leading-tight flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white drop-shadow break-words whitespace-normal">{selectedProduct.name}</h2>
                      <p className="text-sm text-white/80 break-words whitespace-normal">Product Details</p>
                    </div>
                    {/* Product Icon on Right */}
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ml-2">
                      <Flower size={26} className="text-white" />
                    </div>
                  </div>
                </div>
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24">
                  {/* Product Image */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100 w-40 h-40 flex items-center justify-center">
                      <img src={getProductImageUrl(selectedProduct)} alt={selectedProduct.name} className="object-contain w-36 h-36 rounded-xl" />
                    </div>
                  </div>
                  {/* Product Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">${selectedProduct.basePrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.stockQuantity}</div>
                      <div className="text-xs text-gray-600">In Stock</div>
                    </div>
                    {typeof selectedProduct.averageRating === 'number' && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={16} className="text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <div className="text-xs text-gray-600">Rated {selectedProduct.averageRating.toFixed(1)}</div>
                      </div>
                    )}
                  </div>
                  {/* Tags/Features */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {selectedProduct.tags.map((tag, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Description */}
                  <div className="bg-white rounded-xl shadow p-4 text-gray-700 text-sm mb-6">
                    {selectedProduct.description}
                  </div>
                </div>
                {/* Compact Sticky Footer for Action Buttons */}
                <div className="sticky bottom-0 left-0 right-0 z-20 bg-white rounded-b-3xl px-5 py-3 shadow-2xl border-t border-purple-100 flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="w-full bg-blue-600 text-white py-2.5 px-3 rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleGetDetails(selectedProduct)}
                    className="w-full bg-gray-100 text-gray-700 py-2.5 px-3 rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                  >
                    <Flower className="w-5 h-5" />
                    Find Similar
                  </button>
                  <button
                    onClick={() => handleWishlist(selectedProduct)}
                    className="w-full bg-red-50 text-red-600 py-2.5 px-3 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                  >
                    <HeartIcon className="w-5 h-5" />
                    Add to Wishlist
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => renderProductCard(product, index))}
        
        {/* Product Modal for Grid */}
        <AnimatePresence>
          {showModal && selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ type: "spring", damping: 24, stiffness: 320 }}
                className="bg-white rounded-3xl shadow-2xl border-2 border-purple-200 max-w-2xl w-full max-h-[95vh] flex flex-col relative animate-fade-in"
                onClick={e => e.stopPropagation()}
              >
                {/* Premium Sticky Header with Left Chevron and pill subtitle (copied from care modal) */}
                <div className="sticky top-0 z-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-3xl flex items-center justify-between px-6 py-5 shadow-lg border-b border-blue-200 min-h-[76px]">
                  <div className="flex items-center gap-4 w-full">
                    {/* Back Chevron Icon */}
                    <button
                      onClick={closeModal}
                      className="mr-2 p-2 bg-white/70 hover:bg-white rounded-full shadow border border-purple-200 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      aria-label="Back to Chat"
                    >
                      <ChevronDown size={24} className="text-purple-500 rotate-90" />
                    </button>
                    {/* Product Name and Subtitle Pill */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-white drop-shadow break-words whitespace-normal leading-tight">{selectedProduct.name}</h2>
                      <span className="inline-block mt-1 px-3 py-1 bg-white/20 text-white/90 text-xs font-semibold rounded-full shadow-sm">Product Details</span>
                    </div>
                    {/* Product Icon on Right */}
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ml-2">
                      <Flower size={26} className="text-white" />
                    </div>
                  </div>
                </div>
                {/* Scrollable Content Area (custom for product) */}
                <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28"> {/* pt-4 for less gap below header, pb-28 for footer space */}
                  {/* Product Image */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-3xl shadow-xl p-3 border border-gray-100 w-56 h-56 flex items-center justify-center">
                      <img src={getProductImageUrl(selectedProduct)} alt={selectedProduct.name} className="object-contain w-52 h-52 rounded-2xl" />
                    </div>
                  </div>
                  {/* Product Info Grid - always 3 columns, always show rating */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">${selectedProduct.basePrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Price</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.stockQuantity}</div>
                      <div className="text-xs text-gray-600">In Stock</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-xs text-gray-600">Rated {selectedProduct.averageRating ? selectedProduct.averageRating.toFixed(1) : '5.0'}</div>
                    </div>
                  </div>
                  {/* Tags/Features */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {selectedProduct.tags.map((tag, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Description */}
                  <div className="bg-white rounded-xl shadow p-4 text-gray-700 text-sm mb-2 border border-gray-100">
                    {selectedProduct.description}
                  </div>
                </div>
                {/* Compact Sticky Footer for Action Buttons (copied from care modal) */}
                <div className="sticky bottom-0 left-0 right-0 z-20 bg-white rounded-b-3xl px-5 py-4 shadow-2xl border-t border-purple-100 flex flex-col gap-2">
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="w-full bg-blue-600 text-white py-3 px-3 rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleGetDetails(selectedProduct)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-3 rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                  >
                    <Flower className="w-5 h-5" />
                    Show Similar
                  </button>
                  <button
                    onClick={() => handleWishlist(selectedProduct)}
                    className="w-full bg-red-50 text-red-600 py-3 px-3 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                  >
                    <HeartIcon className="w-5 h-5" />
                    Add to Wishlist
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Single layout (default)
  return (
    <div className="w-full">
      {renderProductCard(products[0], 0)}
      
      {/* Product Modal Component */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className="relative w-full max-w-lg mx-4 md:mx-0 rounded-3xl shadow-2xl border-2 border-purple-200 bg-white overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Premium Sticky Header with Left Chevron */}
              <div className="sticky top-0 z-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-3xl flex items-center justify-between px-6 py-4 shadow-lg border-b border-blue-200 min-h-[68px]">
                <div className="flex items-center gap-4 w-full">
                  {/* Back Chevron Icon */}
                  <button
                    onClick={closeModal}
                    className="mr-2 p-2 bg-white/70 hover:bg-white rounded-full shadow border border-purple-200 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="Back to Chat"
                  >
                    <ChevronDown size={24} className="text-purple-500 rotate-90" />
                  </button>
                  {/* Product Name and Subtitle */}
                  <div className="leading-tight flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white drop-shadow break-words whitespace-normal">{selectedProduct.name}</h2>
                    <p className="text-sm text-white/80 break-words whitespace-normal">Product Details</p>
                  </div>
                  {/* Product Icon on Right */}
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ml-2">
                    <Flower size={26} className="text-white" />
                  </div>
                </div>
              </div>
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24">
                {/* Product Image */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100 w-40 h-40 flex items-center justify-center">
                    <img src={getProductImageUrl(selectedProduct)} alt={selectedProduct.name} className="object-contain w-36 h-36 rounded-xl" />
                  </div>
                </div>
                {/* Product Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${selectedProduct.basePrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedProduct.stockQuantity}</div>
                    <div className="text-xs text-gray-600">In Stock</div>
                  </div>
                  {typeof selectedProduct.averageRating === 'number' && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-xs text-gray-600">Rated {selectedProduct.averageRating.toFixed(1)}</div>
                    </div>
                  )}
                </div>
                {/* Tags/Features */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {selectedProduct.tags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">{tag}</span>
                    ))}
                  </div>
                )}
                {/* Description */}
                <div className="bg-white rounded-xl shadow p-4 text-gray-700 text-sm mb-6">
                  {selectedProduct.description}
                </div>
              </div>
              {/* Compact Sticky Footer for Action Buttons */}
              <div className="sticky bottom-0 left-0 right-0 z-20 bg-white rounded-b-3xl px-5 py-3 shadow-2xl border-t border-purple-100 flex flex-col gap-2">
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="w-full bg-blue-600 text-white py-2.5 px-3 rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => handleGetDetails(selectedProduct)}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 px-3 rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                >
                  <Flower className="w-5 h-5" />
                  Find Similar
                </button>
                <button
                  onClick={() => handleWishlist(selectedProduct)}
                  className="w-full bg-red-50 text-red-600 py-2.5 px-3 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
                >
                  <HeartIcon className="w-5 h-5" />
                  Add to Wishlist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 