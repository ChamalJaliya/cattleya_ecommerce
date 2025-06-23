'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  StarIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArchiveBoxIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  GlobeAltIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { Product } from '@/core/domain/entities/Product';
import toast from 'react-hot-toast';

interface ProductViewPageProps {
  params: {
    id: string;
  };
}

export default function ProductViewPage({ params }: ProductViewPageProps) {
  const router = useRouter();
  const { products, loading, fetchProducts } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setMounted(true);
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    // If products are already loaded, find the product
    const existingProduct = products.find(p => p.id === params.id);
    if (existingProduct) {
      setProduct(existingProduct);
      return;
    }

    // Otherwise fetch products
    await fetchProducts({
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    const foundProduct = products.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  };

  const getStatusInfo = (product: Product) => {
    if (!product.isActive) {
      return { status: 'draft', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon };
    }
    if (product.stockQuantity === 0) {
      return { status: 'out of stock', color: 'bg-red-100 text-red-800 border-red-200', icon: ExclamationTriangleIcon };
    }
    if (product.stockQuantity < product.lowStockThreshold) {
      return { status: 'low stock', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: ExclamationTriangleIcon };
    }
    return { status: 'active', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckIcon };
  };

  const handleEdit = () => {
    router.push(`/admin/products/${params.id}/edit`);
  };

  const handleGoBack = () => {
    router.push('/admin/products');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Products', href: '/admin/products' },
    { label: product?.name || 'Product Details', href: `/admin/products/${params.id}` }
  ];

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen relative overflow-hidden">
          {/* Dazzling Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            
            {/* Subtle floating particles */}
            <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce opacity-40"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/50 rounded-full animate-ping opacity-30"></div>
            <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-violet-400/50 rounded-full animate-pulse opacity-30"></div>
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
                />
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="min-h-screen relative overflow-hidden">
          {/* Dazzling Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            
            {/* Subtle floating particles */}
            <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce opacity-40"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/50 rounded-full animate-ping opacity-30"></div>
            <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-violet-400/50 rounded-full animate-pulse opacity-30"></div>
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
            <AdminBreadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-center min-h-[60vh]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">Product Not Found</h3>
                  <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoBack}
                    className="group/btn relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/30"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-violet-600/30 rounded-2xl blur opacity-0 group-hover/btn:opacity-40 transition duration-300"></div>
                    <span className="relative flex items-center">
                      <ArrowLeftIcon className="w-5 h-5 mr-2" />
                      Back to Products
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statusInfo = getStatusInfo(product);

  return (
    <AdminLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Dazzling Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          
          {/* Subtle floating particles */}
          <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce opacity-40"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/50 rounded-full animate-ping opacity-30"></div>
          <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-violet-400/50 rounded-full animate-pulse opacity-30"></div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
          {/* Breadcrumbs */}
          <AdminBreadcrumb items={breadcrumbItems} />

          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            <div className="flex items-center justify-between">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-pink-500/10 transition-all duration-300">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <EyeIcon className="w-5 h-5 text-pink-500 mr-2" />
                    Product Details
                    <SparklesIcon className="w-4 h-4 text-purple-400 ml-2 animate-pulse" />
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoBack}
                  className="group relative overflow-hidden bg-white/80 backdrop-blur-md border border-white/30 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span className="relative flex items-center">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Products
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  className="group relative overflow-hidden bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-pink-500/30"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/30 to-purple-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                  <span className="relative flex items-center">
                    <PencilIcon className="w-5 h-5 mr-2" />
                    Edit Product
                    <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Images - Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 overflow-hidden hover:shadow-pink-500/10 transition-all duration-300">
                  {/* Main Image */}
                  <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-purple-100 to-pink-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={typeof product.images[selectedImage] === 'string' 
                          ? product.images[selectedImage] 
                          : product.images[selectedImage].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <PhotoIcon className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full border backdrop-blur-sm ${statusInfo.color}`}>
                        <statusInfo.icon className="w-4 h-4 mr-1" />
                        {statusInfo.status}
                      </span>
                    </div>
                    
                    {/* Sale Badge */}
                    {product.salePrice && product.salePrice !== product.basePrice && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full bg-red-100 text-red-800 border border-red-200 backdrop-blur-sm">
                          <FireIcon className="w-4 h-4 mr-1" />
                          Sale
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {product.images && product.images.length > 1 && (
                    <div className="p-4 border-t border-gray-200/50">
                      <div className="flex space-x-3 overflow-x-auto hide-scrollbar">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                              selectedImage === index 
                                ? 'ring-2 ring-purple-500 shadow-lg scale-105' 
                                : 'hover:scale-105 hover:shadow-md'
                            }`}
                          >
                            <Image
                              src={typeof image === 'string' ? image : image.url}
                              alt={`${product.name} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Product Details - Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Product Info Card */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-pink-500/10 transition-all duration-300">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Product Information
                  </h3>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                      <p className="text-sm text-gray-500 font-medium mb-3">SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrophyIcon className="w-5 h-5 text-yellow-500" />
                      <BoltIcon className="w-4 h-4 text-purple-500" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ${product.salePrice || product.basePrice}
                      </span>
                      {product.salePrice && product.salePrice !== product.basePrice && (
                        <>
                          <span className="text-lg text-gray-500 line-through">
                            ${product.basePrice}
                          </span>
                          <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                            Save ${(product.basePrice - product.salePrice).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product.totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <EyeIcon className="w-4 h-4" />
                        <span>{product.viewCount} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  {product.category && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2">
                        <TagIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full font-medium">
                          {product.category.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stock Information */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <ArchiveBoxIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Stock Quantity</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">{product.stockQuantity}</span>
                        {product.stockQuantity < product.lowStockThreshold && (
                          <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {product.shortDescription && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics Card */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <ChartBarIcon className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Product Analytics</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{product.totalSales}</div>
                      <div className="text-xs text-blue-700 font-medium">Total Sales</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{product.viewCount}</div>
                      <div className="text-xs text-green-700 font-medium">Views</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{product.averageRating.toFixed(1)}</div>
                      <div className="text-xs text-purple-700 font-medium">Avg Rating</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                      <div className="text-2xl font-bold text-orange-600">{product.totalReviews}</div>
                      <div className="text-xs text-orange-700 font-medium">Reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps Card */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <CalendarIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Timestamps</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Updated</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {product.publishedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Published</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(product.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Full Description Section */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <SparklesIcon className="w-6 h-6 text-purple-500 mr-3" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent">
                      Product Description
                    </h2>
                  </div>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {product.description}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 