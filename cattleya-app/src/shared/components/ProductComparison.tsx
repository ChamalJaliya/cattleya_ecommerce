'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  StarIcon,
  SwatchIcon,
  ScaleIcon,
  ShoppingCartIcon,
  HeartIcon,
  CheckIcon,
  ExclamationTriangleIcon
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
  { key: 'basePrice', label: 'Price', type: 'price' },
  { key: 'averageRating', label: 'Rating', type: 'rating' },
  { key: 'stockQuantity', label: 'Stock', type: 'stock' },
  { key: 'defaultSize', label: 'Default Size', type: 'size' },
  { key: 'primaryColors', label: 'Colors', type: 'colors' },
  { key: 'colorPattern', label: 'Color Pattern', type: 'text' },
  { key: 'category.name', label: 'Category', type: 'text' },
  { key: 'totalReviews', label: 'Reviews', type: 'number' },
  { key: 'totalSales', label: 'Sales', type: 'number' }
];

const sizeLabels = {
  [OrchidSize.SEEDLING]: 'Seedling',
  [OrchidSize.SAPLING]: 'Sapling', 
  [OrchidSize.YOUNG_PLANT]: 'Young Plant',
  [OrchidSize.MATURE]: 'Mature',
  [OrchidSize.BLOOMING_SIZE]: 'Blooming Size',
  [OrchidSize.SPECIMEN]: 'Specimen'
};

export default function ProductComparison({ isOpen, onClose }: ProductComparisonProps) {
  const {
    getComparisonProducts,
    removeFromComparison,
    clearComparison,
    isInWishlist,
    addToWishlist,
    removeFromWishlist
  } = useProductStore();
  
  const { addItem } = useCartStore();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, OrchidSize>>({});

  const comparisonProducts = getComparisonProducts();

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.defaultSize;
    
    addItem({
      productId: product.id,
      name: `${product.name} - ${sizeLabels[selectedSize]}`,
      price: product.isOnSale && product.salePrice ? product.salePrice : product.basePrice,
      originalPrice: product.isOnSale && product.salePrice ? product.basePrice : undefined,
      image: product.images.find(img => img.isMain)?.url || product.images[0]?.url || '/placeholder-product.jpg',
      variant: { size: selectedSize },
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
    
    switch (attribute.type) {
      case 'price':
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;
        return (
          <div>
            <span className="text-lg font-bold text-purple-600">
              ${price.toFixed(2)}
            </span>
            {product.isOnSale && product.salePrice && (
              <div className="text-sm text-gray-500 line-through">
                ${product.basePrice.toFixed(2)}
              </div>
            )}
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(value) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {value.toFixed(1)}
            </span>
          </div>
        );
      
      case 'stock':
        return (
          <div className={`font-medium ${
            value > 10 ? 'text-green-600' : 
            value > 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {value > 0 ? `${value} in stock` : 'Out of stock'}
          </div>
        );
      
      case 'size':
        return (
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
            {sizeLabels[value as OrchidSize]}
          </span>
        );
      
      case 'colors':
        return (
          <div className="flex space-x-1">
            {(value as string[])?.slice(0, 3).map((color: string, index: number) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {(value as string[])?.length > 3 && (
              <span className="text-xs text-gray-500">+{(value as string[]).length - 3}</span>
            )}
          </div>
        );
      
      case 'number':
        return <span className="font-medium">{value?.toLocaleString() || 0}</span>;
      
      default:
        return <span className="text-sm">{value || 'N/A'}</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ScaleIcon className="w-6 h-6 mr-3" />
                <div>
                  <h2 className="text-xl font-bold">Product Comparison</h2>
                  <p className="text-purple-100 text-sm">
                    Compare {comparisonProducts.length} product{comparisonProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {comparisonProducts.length > 0 && (
                  <button
                    onClick={clearComparison}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
            {comparisonProducts.length === 0 ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Products to Compare</h3>
                <p className="text-gray-600 mb-6">
                  Add products to comparison from the product pages to see them here.
                </p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-4 px-4 font-medium text-gray-700 w-48">
                        Product
                      </th>
                      {comparisonProducts.map((product) => (
                        <th key={product.id} className="py-4 px-4 w-64">
                          <div className="relative">
                            <button
                              onClick={() => removeFromComparison(product.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 z-10"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                            
                            <div className="bg-gray-50 rounded-2xl p-4">
                              <img
                                src={product.images.find(img => img.isMain)?.url || product.images[0]?.url || '/placeholder-product.jpg'}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded-xl mb-3"
                              />
                              
                              <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                                {product.name}
                              </h3>
                              
                              <div className="space-y-2">
                                {/* Size Selection */}
                                <select
                                  value={selectedSizes[product.id] || product.defaultSize}
                                  onChange={(e) => setSelectedSizes(prev => ({
                                    ...prev,
                                    [product.id]: e.target.value as OrchidSize
                                  }))}
                                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-purple-500"
                                >
                                  {product.availableSizes?.map((size) => (
                                    <option key={size} value={size}>
                                      {sizeLabels[size]}
                                    </option>
                                  ))}
                                </select>
                                
                                {/* Action Buttons */}
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stockQuantity === 0}
                                    className="flex-1 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                  >
                                    <ShoppingCartIcon className="w-3 h-3 mx-auto" />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleWishlistToggle(product)}
                                    className="p-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors duration-200"
                                  >
                                    {isInWishlist(product.id) ? (
                                      <HeartSolidIcon className="w-3 h-3 text-red-500" />
                                    ) : (
                                      <HeartIcon className="w-3 h-3 text-gray-400" />
                                    )}
                                  </button>
                                  
                                  <Link
                                    href={`/products/${product.id}`}
                                    className="p-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                                  >
                                    <span className="text-xs">👁️</span>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {comparisonAttributes.map((attribute, index) => (
                      <tr key={attribute.key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-4 px-4 font-medium text-gray-700 border-r border-gray-200">
                          {attribute.label}
                        </td>
                        {comparisonProducts.map((product) => (
                          <td key={product.id} className="py-4 px-4 text-center">
                            {renderAttributeValue(product, attribute)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    
                    {/* Product Attributes */}
                    <tr className="bg-gray-100">
                      <td className="py-4 px-4 font-bold text-gray-800 border-r border-gray-200">
                        Care Instructions
                      </td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4">
                          <div className="space-y-1 text-xs">
                            {product.attributes?.slice(0, 3).map((attr, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-gray-600">{attr.name}:</span>
                                <span className="font-medium">{attr.value}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Tags */}
                    <tr className="bg-white">
                      <td className="py-4 px-4 font-medium text-gray-700 border-r border-gray-200">
                        Tags
                      </td>
                      {comparisonProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {product.tags?.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {product.tags?.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{product.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
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