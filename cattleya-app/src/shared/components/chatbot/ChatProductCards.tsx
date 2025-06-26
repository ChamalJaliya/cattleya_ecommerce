'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
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

interface ChatProductCardsProps {
  products: ProductSearchResult[];
  layout: 'grid' | 'list' | 'single' | 'carousel';
  showActions?: boolean;
  showPricing?: boolean;
  showStock?: boolean;
  showRating?: boolean;
  showTags?: boolean;
}

const ChatProductCards: React.FC<ChatProductCardsProps> = ({
  products,
  layout,
  showActions = true,
  showPricing = true,
  showStock = true,
  showRating = true,
  showTags = true,
}) => {
  const { addItem } = useCartStore();
  const { 
    wishlist, 
    addToWishlist: addToWishlistStore, 
    removeFromWishlist: removeFromWishlistStore,
    isInWishlist: isInWishlistStore
  } = useWishlistStore();

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={`w-3 h-3 ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-200'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

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

  const renderProductCard = (product: ProductSearchResult, index: number) => {
    const isInWishlist = isInWishlistStore(product.id);
    const isOnSale = product.salePrice && product.salePrice < product.basePrice;
    const discountPercent = isOnSale ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100) : 0;
    const isLowStock = product.stockQuantity <= 5;
    const isOutOfStock = product.stockQuantity === 0;

    // List view for chat (more compact)
    if (layout === 'list') {
      return (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ x: 5, scale: 1.01 }}
          className="group bg-gradient-to-r from-white via-purple-50/30 to-pink-50/20 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-purple-200/50 hover:shadow-purple-500/25 hover:border-purple-300 transition-all duration-500"
        >
          <div className="flex items-center p-5 space-x-5">
            {/* Image */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden">
              <Image
                src={product.images[0] || '/next.svg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/next.svg';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-1 left-1 space-y-1">
                {isOnSale && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
                  >
                    <FireIcon className="w-2 h-2 animate-pulse" />
                    <span>-{discountPercent}%</span>
                  </motion.div>
                )}
                {product.isFeatured && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
                  >
                    <SparklesIcon className="w-2 h-2 animate-spin" />
                    <span>Featured</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors duration-300">
                {product.name}
              </h3>
              
              {showRating && product.averageRating > 0 && (
                <div className="mt-2">
                  {renderRating(product.averageRating)}
                </div>
              )}

              {showTags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price and Stock */}
              <div className="mt-3">
                {showPricing && (
                  <div className="mb-2">
                    {isOnSale ? (
                      <div className="space-y-1">
                        <div className="text-lg font-bold text-red-600">
                          ${product.salePrice?.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ${product.basePrice.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-gray-900">
                        ${product.basePrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {showStock && (
                  <div className="mb-3">
                    {isOutOfStock ? (
                      <div className="text-sm text-red-600 font-semibold">
                        Out of Stock
                      </div>
                    ) : isLowStock ? (
                      <div className="text-sm text-orange-600 font-semibold">
                        Only {product.stockQuantity} left!
                      </div>
                    ) : (
                      <div className="text-sm text-green-600 font-semibold">
                        {product.stockQuantity} in stock
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleWishlist(product);
                      }}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        isInWishlist
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                      }`}
                    >
                      {isInWishlist ? (
                        <HeartSolidIcon className="w-4 h-4" />
                      ) : (
                        <HeartIcon className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={isOutOfStock}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Grid view for chat (compact cards) - used for carousel and grid layouts
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
        className="group relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-purple-200/50 hover:shadow-purple-500/25 hover:border-purple-300 transition-all duration-500 transform"
      >
        <Link href={`/products/${product.id}`}>
          <div className="flex flex-col h-full">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.images[0] || '/next.svg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
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
              
              {showRating && product.averageRating > 0 && (
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
                            star <= product.averageRating 
                              ? 'text-yellow-400 drop-shadow-sm' 
                              : 'text-gray-200'
                          }`}
                        />
                      </motion.div>
                    ))}
                    <span className="text-sm text-gray-600 ml-2 font-medium">
                      ({product.averageRating.toFixed(1)})
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {/* If only one product, render the card directly */}
        {layout === 'carousel' && products && products.length === 1 ? (
          <div className="flex justify-center">
            <div className="w-full max-w-[420px] min-h-[480px]">
              {renderProductCard(products[0], 0)}
            </div>
          </div>
        ) : layout === 'carousel' && products && products.length > 1 ? (
          <div className="relative">
            {/* Carousel Container with enhanced styling */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-50/50 via-white to-pink-50/50 p-6 shadow-inner">
              <Swiper 
                modules={[Autoplay, Pagination, Navigation]}
                slidesPerView={1.05} 
                spaceBetween={24} 
                centeredSlides={true}
                loop={false}
                className="pb-6"
                style={{
                  paddingLeft: '0px',
                  paddingRight: '0px'
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={true}
                breakpoints={{
                  640: { slidesPerView: 1.05 },
                  1024: { slidesPerView: 1.1 },
                }}
              >
                {products.map((product, index) => (
                  <SwiperSlide key={product.id} className="flex justify-center w-full">
                    <div className="w-full max-w-[420px] min-h-[480px]">
                      {renderProductCard(product, index)}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        ) : (
          // Fallback for list or other layouts
          <div className="grid grid-cols-1 gap-4">
            {products.map((product, index) => (
              <div key={product.id} className="w-full max-w-[420px] mx-auto">
                {renderProductCard(product, index)}
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatProductCards; 