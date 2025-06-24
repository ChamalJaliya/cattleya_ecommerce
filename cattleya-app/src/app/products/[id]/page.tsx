'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { useWishlistStore } from '@/core/application/stores/useWishlistStore';
import { Product, OrchidSize } from '@/core/domain/entities/Product';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ProductReviews from '@/shared/components/ProductReviews';
import Header from '@/shared/components/Header';
import { customToast } from '@/shared/utils/toast';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | '360';
  url: string;
  altText?: string;
  thumbnail?: string;
  isMain?: boolean;
  color?: string; // Add color association
}

interface ProductColor {
  name: string;
  value: string; // hex color
  imageIndex: number; // which media item to show
}

const orchidSizeLabels = {
  [OrchidSize.SEEDLING]: { label: 'Seedling', description: '0-6 months, very small' },
  [OrchidSize.SAPLING]: { label: 'Sapling', description: '6-12 months, small pot' },
  [OrchidSize.YOUNG_PLANT]: { label: 'Young Plant', description: '1-2 years, established' },
  [OrchidSize.MATURE]: { label: 'Mature', description: '2-3 years, strong growth' },
  [OrchidSize.BLOOMING_SIZE]: { label: 'Blooming Size', description: '3+ years, ready to bloom' },
  [OrchidSize.SPECIMEN]: { label: 'Specimen', description: '5+ years, large plant' }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const { 
    products, 
    addToRecentlyViewed,
    getRecommendedProducts 
  } = useProductStore();
  const { addItem } = useCartStore();
  const { 
    addToWishlist, 
    removeFromWishlist,
    isInWishlist,
    fetchWishlist
  } = useWishlistStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<OrchidSize | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  // Enhanced media viewer states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Enhanced media items and colors
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [availableColors, setAvailableColors] = useState<ProductColor[]>([]);

  // Load wishlist data on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    // Ensure products are loaded first
    if (products.length === 0) {
      // If no products are loaded, try to fetch them
      const productStore = useProductStore.getState();
      productStore.fetchProducts().catch(console.error);
      return;
    }

    // Find product by ID
    const foundProduct = products.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedSize(foundProduct.defaultSize);
      
      // Track recently viewed - add null check
      if (foundProduct.id) {
        addToRecentlyViewed(foundProduct.id);
      }
      
      // Create enhanced media items with color variations
      const baseImages = foundProduct.images || [];
      
      // Use actual product colors or create variations
      const colorVariations = foundProduct.primaryColors && foundProduct.primaryColors.length > 0 
        ? foundProduct.primaryColors.map((color, index) => ({
            name: getColorName(color) || 'Custom',
            value: color,
            suffix: index === 0 ? '' : `-${(getColorName(color) || 'custom').toLowerCase()}`
          }))
        : [
            { name: 'Purple', value: '#8B5CF6', suffix: '' },
            { name: 'Pink', value: '#EC4899', suffix: '-pink' },
            { name: 'White', value: '#FFFFFF', suffix: '-white' }
          ];

      const productMedia: MediaItem[] = [];
      const productColors: ProductColor[] = [];

      // Add base images with color associations
      baseImages.forEach((img, index) => {
        if (img && img.id && img.url) {
          colorVariations.forEach((color, colorIndex) => {
            const mediaIndex = productMedia.length;
            const colorName = color.name || 'Unknown';
            productMedia.push({
              id: `img-${img.id}-${colorName.toLowerCase()}`,
              type: 'image' as const,
              url: img.url,
              altText: `${img.altText || foundProduct.name} - ${colorName}`,
              isMain: img.isMain && colorIndex === 0,
              color: color.value
            });

            // Add color to available colors (only once per color)
            if (index === 0) {
              productColors.push({
                name: colorName,
                value: color.value,
                imageIndex: mediaIndex
              });
            }
          });
        }
      });
      
      // Add video and 360 content only if we have base images
      if (baseImages.length > 0) {
        productMedia.push({
          id: 'video-1',
          type: 'video' as const,
          url: 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_1mb.mp4',
          thumbnail: baseImages[0]?.url || '',
          altText: 'Product Care Video'
        });

        productMedia.push({
          id: '360-1',
          type: '360' as const,
          url: baseImages[0]?.url || '',
          altText: '360° Product View'
        });
      }
      
      setMediaItems(productMedia);
      setAvailableColors(productColors);
      setSelectedColor(productColors[0]?.value || null);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [productId, products, addToRecentlyViewed]);

  const getColorName = (hex: string): string => {
    const colorMap: { [key: string]: string } = {
      '#8B5CF6': 'Purple',
      '#EC4899': 'Pink', 
      '#FFFFFF': 'White',
      '#F59E0B': 'Yellow',
      '#F97316': 'Orange',
      '#EF4444': 'Red',
      '#10B981': 'Green',
      '#3B82F6': 'Blue',
      '#A78BFA': 'Lavender',
      '#FB7185': 'Coral'
    };
    return colorMap[hex] || 'Custom';
  };

  const getSizePriceAdjustment = (size: OrchidSize): number => {
    // Price adjustments based on size
    const adjustments = {
      [OrchidSize.SEEDLING]: -0.3,    // 30% less
      [OrchidSize.SAPLING]: -0.15,    // 15% less
      [OrchidSize.YOUNG_PLANT]: 0,    // Base price
      [OrchidSize.MATURE]: 0.25,      // 25% more
      [OrchidSize.BLOOMING_SIZE]: 0.5, // 50% more
      [OrchidSize.SPECIMEN]: 1.0      // 100% more
    };
    return adjustments[size] || 0;
  };

  const getCurrentPrice = () => {
    if (!product || !selectedSize) return 0;
    const basePrice = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;
    const adjustment = getSizePriceAdjustment(selectedSize);
    return basePrice * (1 + adjustment);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XMarkIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-md">The orchid you're looking for seems to have bloomed elsewhere.</p>
          <Link
            href="/products"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Browse Our Collection
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const hasDiscount = product.isOnSale && product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const inWishlist = product?.id ? isInWishlist(product.id) : false;
  
  // Add safety check for getRecommendedProducts
  let relatedProducts: Product[] = [];
  try {
    relatedProducts = product?.id ? getRecommendedProducts(product.id, 4) : [];
  } catch (error) {
    console.error('Error getting recommended products:', error);
    relatedProducts = [];
  }

  const currentMedia = mediaItems[selectedMediaIndex];

  const handleAddToCart = async () => {
    if (!selectedSize) {
      customToast.warning('Please select a size');
      return;
    }

    try {
      await addItem({
        productId: product.id,
        quantity: quantity,
        selectedAttributes: { size: selectedSize }
      });
      // Toast is handled by the cart store
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // Error toast is handled by the cart store
    }
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      // Toast is handled by the wishlist store
    } else {
      addToWishlist(product.id);
      // Toast is handled by the wishlist store
    }
  };

  const handleColorSelect = (color: ProductColor) => {
    setSelectedColor(color.value);
    setSelectedMediaIndex(color.imageIndex);
    setIsZoomed(false);
    setRotation(0);
  };

  const nextMedia = () => {
    setSelectedMediaIndex((prev) => 
      prev === mediaItems.length - 1 ? 0 : prev + 1
    );
    setIsZoomed(false);
    setRotation(0);
  };

  const prevMedia = () => {
    setSelectedMediaIndex((prev) => 
      prev === 0 ? mediaItems.length - 1 : prev - 1
    );
    setIsZoomed(false);
    setRotation(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const MediaViewer = () => (
    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          key={selectedMediaIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full h-full relative"
          onMouseMove={handleMouseMove}
        >
          {currentMedia?.type === 'image' && (
            <div className="relative w-full h-full overflow-hidden">
              <img
                ref={imageRef}
                src={currentMedia.url}
                alt={currentMedia.altText || product.name}
                className={`w-full h-full object-cover transition-all duration-500 cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
                style={{
                  transform: `rotate(${rotation}deg) scale(${isZoomed ? 2.5 : 1})`,
                  transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
                  filter: selectedColor && currentMedia.color ? `hue-rotate(${getHueRotation(currentMedia.color, selectedColor)}deg)` : 'none'
                }}
                onClick={toggleZoom}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
              
              {/* Zoom indicator */}
              {isZoomed && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  Zoomed 2.5x
                </div>
              )}
            </div>
          )}

          {currentMedia?.type === 'video' && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={currentMedia.url}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-2xl p-4">
                <button
                  onClick={toggleVideoPlay}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-105"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-6 h-6 text-white" />
                  ) : (
                    <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1 mx-4">
                  <div className="h-1 bg-white/20 rounded-full">
                    <div className="h-full bg-white rounded-full w-1/3"></div>
                  </div>
                </div>
                
                <button
                  onClick={toggleMute}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-105"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-6 h-6 text-white" />
                  ) : (
                    <SpeakerWaveIcon className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
            </div>
          )}

          {currentMedia?.type === '360' && (
            <div className="relative w-full h-full">
              <img
                src={currentMedia.url}
                alt={currentMedia.altText || '360° View'}
                className="w-full h-full object-cover transition-transform duration-500"
                style={{ transform: `rotate(${rotation}deg)` }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
              
              {/* 360 Indicator */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                360° Interactive View
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Media Navigation */}
      {mediaItems.length > 1 && (
        <>
          <button
            onClick={prevMedia}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 z-10 shadow-lg"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextMedia}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 z-10 shadow-lg"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
          </button>
        </>
      )}

      {/* Media Controls */}
      <div className="absolute top-6 right-6 flex space-x-3 z-10">
        {currentMedia?.type === 'image' && (
          <>
            <button
              onClick={toggleZoom}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg"
              title={isZoomed ? 'Zoom Out' : 'Zoom In'}
            >
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={handleRotate}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg"
              title="Rotate"
            >
              <ArrowsPointingOutIcon className="w-6 h-6 text-gray-700" style={{ transform: 'rotate(45deg)' }} />
            </button>
          </>
        )}
        
        {currentMedia?.type === '360' && (
          <button
            onClick={handleRotate}
            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg"
            title="Rotate 360°"
          >
            <ArrowsPointingOutIcon className="w-6 h-6 text-gray-700" style={{ transform: 'rotate(45deg)' }} />
          </button>
        )}
      </div>

      {/* Enhanced Badges */}
      <div className="absolute top-6 left-6 flex flex-col space-y-3 z-10">
        {product.isFeatured && (
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
          >
            ⭐ Featured
          </motion.span>
        )}
        {hasDiscount && (
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
          >
            🔥 {discountPercent}% OFF
          </motion.span>
        )}
        {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
          >
            ⚡ Low Stock
          </motion.span>
        )}
        {product.stockQuantity === 0 && (
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
          >
            ❌ Out of Stock
          </motion.span>
        )}
      </div>
    </div>
  );

  // Helper function to calculate hue rotation for color filtering
  const getHueRotation = (originalColor: string, targetColor: string): number => {
    // This is a simplified color transformation
    // In a real app, you'd use proper color space calculations
    const colorMap: { [key: string]: number } = {
      '#8B5CF6': 0,   // Purple (base)
      '#EC4899': 30,  // Pink
      '#FFFFFF': 60,  // White
      '#F59E0B': 90,  // Yellow
      '#EF4444': 120  // Red
    };
    
    return colorMap[targetColor] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      {/* Header Component with Breadcrumbs */}
      <Header 
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Collection', href: '/products' },
          { label: product.name || 'Product', href: `/products/${productId}` }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <MediaViewer />

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <SwatchIcon className="w-5 h-5 mr-2 text-purple-600" />
                    Available Colors
                  </h3>
                  <span className="text-sm text-gray-500">
                    {availableColors.find(c => c.value === selectedColor)?.name || 'Select Color'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <motion.button
                      key={color.value}
                      onClick={() => handleColorSelect(color)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-12 h-12 rounded-full border-4 transition-all duration-200 ${
                        selectedColor === color.value
                          ? 'border-purple-500 shadow-lg shadow-purple-500/25'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <CheckIcon className="w-6 h-6 text-white drop-shadow-lg" />
                        </motion.div>
                      )}
                      
                      {/* Color name tooltip */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {color.name}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Thumbnail Images */}
            {mediaItems.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50"
              >
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {mediaItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 relative group ${
                        selectedMediaIndex === index 
                          ? 'border-purple-500 shadow-lg shadow-purple-500/25' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={item.type === 'video' ? item.thumbnail || item.url : item.url}
                        alt={item.altText || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                      
                      {/* Media Type Indicators */}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <PlayIcon className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      )}
                      {item.type === '360' && (
                        <div className="absolute bottom-1 right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          360°
                        </div>
                      )}
                      
                      {/* Selection indicator */}
                      {selectedMediaIndex === index && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            {/* Title and Rating */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-600 mb-2">{product.category?.name || 'Uncategorized'}</p>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                </div>
                <button
                  onClick={handleWishlistToggle}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                >
                  {inWishlist ? (
                    <HeartSolidIcon className="w-7 h-7 text-red-500" />
                  ) : (
                    <HeartIcon className="w-7 h-7 text-gray-400 group-hover:text-red-400" />
                  )}
                </button>
              </div>
               
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-600">SKU: {product.sku}</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.basePrice.toFixed(2)}
                    </span>
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Save ${(product.basePrice - product.salePrice!).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.shortDescription}
              </p>
            </motion.div>

            {/* Color and Size Selection */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
            >
              {/* Color Pattern Display */}
              {product.primaryColors && product.primaryColors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <SwatchIcon className="w-5 h-5 mr-2 text-purple-600" />
                    Color Pattern: {product.colorPattern.charAt(0).toUpperCase() + product.colorPattern.slice(1)}
                  </h3>
                  <div className="flex items-center space-x-3">
                    {product.primaryColors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={getColorName(color)}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {getColorName(color)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Select Size:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.availableSizes.map((size) => {
                      const sizeInfo = orchidSizeLabels[size];
                      const priceAdjustment = getSizePriceAdjustment(size);
                      const adjustedPrice = (product.isOnSale && product.salePrice ? product.salePrice : product.basePrice) * (1 + priceAdjustment);
                      const sizeLabel = sizeInfo?.label || size.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const sizeDescription = sizeInfo?.description || 'Size information not available';
                      
                      return (
                        <label key={size} className="cursor-pointer">
                          <input
                            type="radio"
                            name="size"
                            value={size}
                            checked={selectedSize === size}
                            onChange={() => setSelectedSize(size)}
                            className="sr-only"
                          />
                          <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                            selectedSize === size
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-900">{sizeLabel}</div>
                                <div className="text-sm text-gray-500">{sizeDescription}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-purple-600">
                                  ${adjustedPrice.toFixed(2)}
                                </div>
                                {priceAdjustment !== 0 && (
                                  <div className="text-xs text-gray-500">
                                    {priceAdjustment > 0 ? '+' : ''}{(priceAdjustment * 100).toFixed(0)}%
                                  </div>
                                )}
                              </div>
                            </div>
                            {selectedSize === size && (
                              <div className="mt-2 flex items-center text-purple-600">
                                <CheckIcon className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">Selected</span>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center space-x-3 mb-4">
                {product.stockQuantity > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-semibold text-lg">
                      In Stock
                    </span>
                    <span className="text-gray-500">
                      ({product.stockQuantity} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-semibold text-lg">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-semibold text-gray-700">Quantity:</label>
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-200 transition-colors duration-200"
                    >
                      <span className="text-lg font-bold text-gray-600">−</span>
                    </button>
                    <span className="px-6 py-3 text-lg font-bold bg-white min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="p-3 hover:bg-gray-200 transition-colors duration-200"
                      disabled={quantity >= product.stockQuantity}
                    >
                      <span className="text-lg font-bold text-gray-600">+</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                >
                  <ShoppingCartIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}
                </button>
              </div>
            </motion.div>

            {/* Product Attributes */}
            {product.attributes && product.attributes.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">{attr?.name || 'Attribute'}:</span>
                      <span className="font-bold text-gray-900">{attr?.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Guarantees */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-900">Free Delivery</p>
                  <p className="text-sm text-green-700">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-blue-900">Care Guarantee</p>
                  <p className="text-sm text-blue-700">30-day health guarantee</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Description and Details */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 space-y-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Description</h2>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center group"
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
                <InformationCircleIcon className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
            
            <div className={`prose max-w-none ${showFullDescription ? '' : 'line-clamp-4'}`}>
              <p className="text-gray-700 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>
          </div>

          {/* Care Instructions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Care Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">☀️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Light Requirements</h3>
                <p className="text-gray-600">Bright, indirect sunlight. Avoid direct sun exposure which can burn the delicate petals.</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">💧</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Watering Schedule</h3>
                <p className="text-gray-600">Water weekly, allowing soil to dry between waterings. Check moisture with your finger.</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🌡️</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Temperature</h3>
                <p className="text-gray-600">Keep between 65-80°F (18-27°C) for optimal growth and blooming.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Reviews */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <ProductReviews productId={productId} />
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recommended for You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.images?.find(img => img.isMain)?.url || relatedProduct.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={relatedProduct.name || 'Related Product'}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg">
                      {relatedProduct.name || 'Unnamed Product'}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ${(relatedProduct.isOnSale && relatedProduct.salePrice ? relatedProduct.salePrice : relatedProduct.basePrice).toFixed(2)}
                        </span>
                        {relatedProduct.isOnSale && relatedProduct.salePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${relatedProduct.basePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/products/${relatedProduct.id}`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 