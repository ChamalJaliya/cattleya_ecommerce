'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  StarIcon,
  SwatchIcon,
  ScaleIcon,
  ShoppingCartIcon,
  HeartIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  EyeIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { Product, OrchidSize } from '@/core/domain/entities/Product';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

const comparisonAttributes = [
  { key: 'basePrice', label: 'Price', type: 'price', icon: CurrencyDollarIcon },
  { key: 'averageRating', label: 'Rating', type: 'rating', icon: StarIcon },
  { key: 'stockQuantity', label: 'Stock', type: 'stock', icon: ShieldCheckIcon },
  { key: 'defaultSize', label: 'Default Size', type: 'size', icon: ChartBarIcon },
  { key: 'primaryColors', label: 'Colors', type: 'colors', icon: SwatchIcon },
  { key: 'colorPattern', label: 'Color Pattern', type: 'text', icon: SparklesIcon },
  { key: 'category.name', label: 'Category', type: 'text', icon: TagIcon },
  { key: 'totalReviews', label: 'Reviews', type: 'number', icon: UserGroupIcon },
  { key: 'totalSales', label: 'Sales', type: 'number', icon: TrophyIcon }
];



export default function ProductComparison({ isOpen, onClose }: ProductComparisonProps) {
  const {
    getComparisonProducts,
    removeFromComparison,
    clearComparison,
    wishlist,
    addToWishlist,
    removeFromWishlist
  } = useProductStore();
  
  const { addItem } = useCartStore();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, OrchidSize>>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const comparisonProducts = getComparisonProducts();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeLabels: Record<OrchidSize, string> = {
    [OrchidSize.SEEDLING]: 'Seedling',
    [OrchidSize.SAPLING]: 'Sapling',
    [OrchidSize.YOUNG_PLANT]: 'Young Plant',
    [OrchidSize.MATURE]: 'Mature',
    [OrchidSize.BLOOMING_SIZE]: 'Blooming Size',
    [OrchidSize.SPECIMEN]: 'Specimen'
  };

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.defaultSize;
    const sizeLabel = sizeLabels[selectedSize] || selectedSize?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Size';
    
    addItem({
      productId: product.id,
      name: `${product.name} - ${sizeLabel}`,
      price: product.salePrice && product.salePrice < product.basePrice ? product.salePrice : product.basePrice,
      originalPrice: product.salePrice && product.salePrice < product.basePrice ? product.basePrice : undefined,
      image: product.images[0]?.url || '/placeholder-orchid.jpg',
      variant: { size: selectedSize },
      inStock: product.stockQuantity > 0,
      maxQuantity: product.stockQuantity,
      quantity: 1
    });
    
    toast.success(
      <div className="flex items-center space-x-2">
        <ShoppingCartIcon className="w-5 h-5 text-green-500" />
        <span>Added {product.name} to cart!</span>
      </div>,
      {
        style: {
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
        },
      }
    );
  };

  const handleWishlistToggle = (product: Product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success(
        <div className="flex items-center space-x-2">
          <HeartSolidIcon className="w-5 h-5 text-red-500" />
          <span>Added to wishlist!</span>
        </div>,
        {
          style: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
          },
        }
      );
    }
  };

  const getAttributeValue = (product: Product, attributeKey: string) => {
    const keys = attributeKey.split('.');
    let value: any = product;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value;
  };

  const renderAttributeValue = (product: Product, attribute: any) => {
    const value = getAttributeValue(product, attribute.key);
    const Icon = attribute.icon;
    
    switch (attribute.type) {
      case 'price':
        const isOnSale = product.salePrice && product.salePrice < product.basePrice;
        const price = isOnSale ? product.salePrice : product.basePrice;
        return (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ${price?.toFixed(2)}
            </div>
            {isOnSale && (
              <div className="text-sm text-gray-500 line-through">
                ${product.basePrice.toFixed(2)}
              </div>
            )}
            {isOnSale && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium mt-1"
              >
                <FireIcon className="w-3 h-3" />
                <span>Sale!</span>
              </motion.div>
            )}
          </motion.div>
        );
      
      case 'rating':
        return (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center space-y-2"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <StarSolidIcon
                    className={`w-5 h-5 ${
                      i < Math.floor(value) ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {value?.toFixed(1)} / 5.0
            </span>
          </motion.div>
        );
      
      case 'stock':
        const stockStatus = value > 10 ? 'high' : value > 0 ? 'low' : 'out';
        const stockColors = {
          high: 'text-green-600 bg-green-100',
          low: 'text-yellow-600 bg-yellow-100', 
          out: 'text-red-600 bg-red-100'
        };
        
        return (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold ${stockColors[stockStatus]}`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>
              {value > 0 ? `${value} in stock` : 'Out of stock'}
            </span>
          </motion.div>
        );
      
      case 'size':
        return (
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-2 rounded-full text-sm font-semibold"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>{sizeLabels[value as OrchidSize] || (value as string)?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Size'}</span>
          </motion.span>
        );
      
      case 'colors':
        return (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex justify-center space-x-2"
          >
            {(value as string[])?.slice(0, 4).map((color: string, index: number) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.2 }}
                className="w-8 h-8 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {(value as string[])?.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">
                  +{(value as string[]).length - 4}
                </span>
              </div>
            )}
          </motion.div>
        );
      
      case 'number':
        return (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center"
          >
            <div className="text-lg font-bold text-gray-900">
              {value?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {attribute.key === 'totalReviews' ? 'Reviews' : 'Sales'}
            </div>
          </motion.div>
        );
      
      default:
        return (
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-full"
          >
            {value || 'N/A'}
          </motion.span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            scale: [1, 0.8, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" />
            <div className="absolute inset-0 bg-black/10" />
            
            <div className="relative px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                  >
                    <ScaleIcon className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold">Product Comparison</h2>
                    <p className="text-white/80 text-lg">
                      Compare {comparisonProducts.length} exquisite orchid{comparisonProducts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3"
                >
                  {comparisonProducts.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearComparison}
                      className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white font-semibold transition-all duration-200 backdrop-blur-sm"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      <span>Clear All</span>
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="p-8 overflow-auto max-h-[calc(90vh-140px)]">
            {comparisonProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6"
                >
                  <ExclamationTriangleIcon className="w-12 h-12 text-purple-500" />
                </motion.div>
                
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  No Products to Compare
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Add products to comparison from the product pages to see them here and discover the perfect orchid for you.
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <SparklesIcon className="w-5 h-5" />
                  <span>Browse Products</span>
                </motion.button>
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-6 px-6 font-bold text-gray-800 w-56 bg-gradient-to-r from-gray-50 to-gray-100 rounded-l-2xl">
                        <div className="flex items-center space-x-2">
                          <TagIcon className="w-5 h-5 text-purple-500" />
                          <span>Product Details</span>
                        </div>
                      </th>
                                             {comparisonProducts.map((product: Product, index: number) => (
                        <th key={product.id} className="py-6 px-4 w-80">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                            onMouseEnter={() => setHoveredProduct(product.id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                          >
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromComparison(product.id)}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 z-10"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.div 
                              whileHover={{ y: -5 }}
                              className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-2 transition-all duration-300 ${
                                hoveredProduct === product.id 
                                  ? 'border-purple-300 shadow-xl shadow-purple-500/20' 
                                  : 'border-gray-200 shadow-lg'
                              }`}
                            >
                                                             <div className="relative overflow-hidden rounded-2xl mb-4">
                                 <motion.img
                                   whileHover={{ scale: 1.1 }}
                                   src={product.images[0]?.url || '/placeholder-orchid.jpg'}
                                   alt={product.name}
                                   className="w-full h-40 object-cover transition-transform duration-500"
                                 />
                                
                                {/* Product Badges */}
                                <div className="absolute top-3 left-3 space-y-1">
                                  {product.tags.includes('featured') && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1"
                                    >
                                      <SparklesIcon className="w-3 h-3" />
                                      <span>Featured</span>
                                    </motion.div>
                                  )}
                                  
                                  {product.tags.includes('rare') && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1"
                                    >
                                      <TrophyIcon className="w-3 h-3" />
                                      <span>Rare</span>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                              
                              <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
                                {product.name}
                              </h3>
                              
                              <div className="space-y-3">
                                {/* Size Selection */}
                                <select
                                  value={selectedSizes[product.id] || product.defaultSize}
                                  onChange={(e) => setSelectedSizes(prev => ({
                                    ...prev,
                                    [product.id]: e.target.value as OrchidSize
                                  }))}
                                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                >
                                  {Object.values(OrchidSize).map((size) => (
                                    <option key={size} value={size}>
                                      {sizeLabels[size] || size?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Size'}
                                    </option>
                                  ))}
                                </select>
                                
                                {/* Enhanced Action Buttons */}
                                <div className="grid grid-cols-3 gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stockQuantity === 0}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                                  >
                                    <ShoppingCartIcon className="w-4 h-4" />
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleWishlistToggle(product)}
                                    className="border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 flex items-center justify-center p-3"
                                  >
                                    {wishlist.some(item => item.id === product.id) ? (
                                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                                    ) : (
                                      <HeartIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                  </motion.button>
                                  
                                  <Link
                                    href={`/products/${product.id}`}
                                    className="border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center p-3"
                                  >
                                    <EyeIcon className="w-4 h-4 text-gray-600" />
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {comparisonAttributes.map((attribute, index) => {
                      const Icon = attribute.icon;
                      return (
                        <motion.tr 
                          key={attribute.key} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${
                            index % 2 === 0 
                              ? 'bg-gradient-to-r from-gray-50/50 to-purple-50/30' 
                              : 'bg-white/50'
                          } hover:bg-purple-50/50 transition-colors duration-200`}
                        >
                          <td className="py-6 px-6 font-semibold text-gray-800 border-r border-gray-200/50">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                                <Icon className="w-5 h-5 text-purple-600" />
                              </div>
                              <span>{attribute?.label || 'Unknown Attribute'}</span>
                            </div>
                          </td>
                                                     {comparisonProducts.map((product: Product, productIndex: number) => (
                            <motion.td 
                              key={product.id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (index * 0.05) + (productIndex * 0.02) }}
                              className="py-6 px-4 text-center"
                            >
                              {renderAttributeValue(product, attribute)}
                            </motion.td>
                          ))}
                        </motion.tr>
                      );
                    })}
                    
                    {/* Enhanced Care Instructions */}
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: comparisonAttributes.length * 0.05 }}
                      className="bg-gradient-to-r from-purple-100/50 to-pink-100/50"
                    >
                      <td className="py-6 px-6 font-bold text-gray-800 border-r border-gray-200/50">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <span>Care Instructions</span>
                                                 </div>
                       </td>
                       {comparisonProducts.map((product: Product) => (
                         <td key={product.id} className="py-6 px-4">
                           <div className="space-y-2">
                             {product.tags?.slice(0, 3).map((tag: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-3 py-2 rounded-xl text-xs font-semibold"
                                                               >
                                   {tag.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                 </motion.div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                    
                    {/* Enhanced Tags */}
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (comparisonAttributes.length + 1) * 0.05 }}
                      className="bg-white/50"
                    >
                      <td className="py-6 px-6 font-semibold text-gray-800 border-r border-gray-200/50">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
                            <TagIcon className="w-5 h-5 text-orange-600" />
                          </div>
                          <span>Product Tags</span>
                                                 </div>
                       </td>
                       {comparisonProducts.map((product: Product) => (
                         <td key={product.id} className="py-6 px-4">
                           <div className="flex flex-wrap gap-2 justify-center">
                             {product.tags?.slice(0, 4).map((tag: string, index: number) => (
                              <motion.span
                                key={index}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"
                                                               >
                                   {tag.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                 </motion.span>
                            ))}
                            {product.tags?.length > 4 && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                +{product.tags.length - 4} more
                              </motion.span>
                            )}
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 