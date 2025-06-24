import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/core/domain/entities/Product';
import { HeartIcon, EyeIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  index?: number;
  onClick?: (product: Product) => void;
  className?: string;
  isInWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  index = 0,
  onClick,
  className = '',
  isInWishlist = false,
  onWishlistToggle,
  onQuickView,
  onAddToCart
}) => {
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  const price = product.salePrice || product.basePrice;
  const isOnSale = product.salePrice && product.salePrice < product.basePrice;
  const discountPercentage = isOnSale 
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const handleClick = () => {
    onClick?.(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle?.(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <div className="flex p-4">
          <div className="relative w-32 h-32 flex-shrink-0">
            {mainImage && (
              <Image
                src={mainImage.url}
                alt={mainImage.altText || product.name}
                fill
                className="object-cover rounded-lg"
                sizes="128px"
              />
            )}
            {isOnSale && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{discountPercentage}%
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.shortDescription}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
                {isOnSale && (
                  <span className="text-sm text-gray-500 line-through">${product.basePrice.toFixed(2)}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {onWishlistToggle && (
                  <button
                    onClick={handleWishlistToggle}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {isInWishlist ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                  </button>
                )}
                
                {onQuickView && (
                  <button
                    onClick={handleQuickView}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                )}
                
                {onAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {mainImage && (
          <Image
            src={mainImage.url}
            alt={mainImage.altText || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {isOnSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col space-y-2">
            {onWishlistToggle && (
              <button
                onClick={handleWishlistToggle}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                {isInWishlist ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            
            {onQuickView && (
              <button
                onClick={handleQuickView}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <EyeIcon className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.shortDescription}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
            {isOnSale && (
              <span className="text-sm text-gray-500 line-through">${product.basePrice.toFixed(2)}</span>
            )}
          </div>
          
          {onAddToCart && (
            <button
              onClick={handleAddToCart}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              <ShoppingCartIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 