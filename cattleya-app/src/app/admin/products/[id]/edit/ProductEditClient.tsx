"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  StarIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArchiveBoxIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  ShoppingBagIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { Product, OrchidSize, ColorPattern } from '@/core/domain/entities/Product';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ProductEditClientProps {
  params: {
    id: string;
  };
}

const orchidSizes = Object.values(OrchidSize);
const colorPatterns = Object.values(ColorPattern);

export default function ProductEditClient({ params }: ProductEditClientProps) {
  const router = useRouter();
  const { products, loading, fetchProducts, updateProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    basePrice: 0,
    salePrice: 0,
    costPrice: 0,
    stockQuantity: 0,
    lowStockThreshold: 5,
    trackQuantity: true,
    weight: 0,
    dimensions: '',
    defaultSize: OrchidSize.MATURE,
    availableSizes: [] as OrchidSize[],
    primaryColors: [] as string[],
    colorPattern: ColorPattern.SOLID,
    categoryId: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [] as string[],
    isActive: true,
    isFeatured: false,
    isDigital: false,
    isOnSale: false
  });

  useEffect(() => {
    setMounted(true);
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    console.log('Loading product with ID:', params.id);
    console.log('Current products in store:', products.length);
    
    const existingProduct = products.find(p => p.id === params.id);
    if (existingProduct) {
      console.log('Found product in store:', existingProduct.name);
      setProduct(existingProduct);
      populateFormData(existingProduct);
      return;
    }

    console.log('Product not found in store, fetching from API...');
    try {
      // First try to fetch all products
    await fetchProducts({
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

      let foundProduct = products.find(p => p.id === params.id);
      
      // If still not found, try to fetch the specific product
      if (!foundProduct) {
        console.log('Product not found in general list, fetching specific product...');
        const { getProduct } = useProductStore.getState();
        const specificProduct = await getProduct(params.id);
        if (specificProduct) {
          foundProduct = specificProduct;
        }
      }
      
    if (foundProduct) {
        console.log('Found product after API fetch:', foundProduct.name);
      setProduct(foundProduct);
        populateFormData(foundProduct);
      } else {
        console.error('Product not found after API fetch');
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load product data');
    } finally {
      setProductLoading(false);
    }
  };

  const populateFormData = (product: Product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      sku: product.sku || '',
      basePrice: product.basePrice || 0,
      salePrice: product.salePrice || 0,
      costPrice: product.costPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      lowStockThreshold: product.lowStockThreshold || 5,
      trackQuantity: product.trackQuantity ?? true,
      weight: product.weight || 0,
      dimensions: product.dimensions || '',
      defaultSize: product.defaultSize || OrchidSize.MATURE,
      availableSizes: product.availableSizes || [],
      primaryColors: product.primaryColors || [],
      colorPattern: product.colorPattern || ColorPattern.SOLID,
      categoryId: product.categoryId || '',
      tags: product.tags || [],
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      metaKeywords: product.metaKeywords || [],
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isDigital: product.isDigital ?? false,
      isOnSale: product.isOnSale ?? false
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      await updateProduct(product.id, formData);
      toast.success('Product updated successfully!');
      router.push(`/admin/products/${product.id}`);
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleManageVariants = () => {
    router.push(`/admin/products/${params.id}/variants`);
  };

  const handleGoBack = () => {
    router.push(`/admin/products/${params.id}`);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Products', href: '/admin/products' },
    { label: product?.name || 'Product', href: `/admin/products/${params.id}` },
    { label: 'Edit', href: `/admin/products/${params.id}/edit` }
  ];

  if (!mounted) return null;

  if (loading || productLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!product && !productLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
            </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <div className="flex space-x-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Products
          </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <AdminBreadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Edit Product
                </h1>
                <p className="text-gray-600 mt-2">Update product information and settings</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoBack}
                  className="group relative overflow-hidden bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <span className="relative flex items-center">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Product
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManageVariants}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                  <span className="relative flex items-center">
                    <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    Manage Variants
                    <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Basic Information */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <SparklesIcon className="w-6 h-6 text-purple-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Basic Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-mono"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Brief product description..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Detailed product description..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-green-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Pricing & Inventory
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trackQuantity"
                      checked={formData.trackQuantity}
                      onChange={(e) => handleInputChange('trackQuantity', e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="trackQuantity" className="ml-2 block text-sm text-gray-900">
                      Track Quantity
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Attributes */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <TagIcon className="w-6 h-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Product Attributes
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Size
                    </label>
                    <select
                      value={formData.defaultSize}
                      onChange={(e) => handleInputChange('defaultSize', e.target.value as OrchidSize)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {orchidSizes.map((size) => (
                        <option key={size} value={size}>{size.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Pattern
                    </label>
                    <select
                      value={formData.colorPattern}
                      onChange={(e) => handleInputChange('colorPattern', e.target.value as ColorPattern)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {colorPatterns.map((pattern) => (
                        <option key={pattern} value={pattern}>{pattern}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions (LxWxH cm)
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="10x5x3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Settings */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-orange-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <CheckIcon className="w-6 h-6 text-orange-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Status & Settings
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDigital"
                      checked={formData.isDigital}
                      onChange={(e) => handleInputChange('isDigital', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDigital" className="ml-2 block text-sm text-gray-900">
                      Digital Product
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isOnSale"
                      checked={formData.isOnSale}
                      onChange={(e) => handleInputChange('isOnSale', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isOnSale" className="ml-2 block text-sm text-gray-900">
                      On Sale
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoBack}
                className="group relative overflow-hidden bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                <span className="relative flex items-center">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Cancel
                </span>
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={saving}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                <span className="relative flex items-center">
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Save Changes
                      <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                    </>
                  )}
                </span>
              </motion.button>
          </div>
          </motion.form>
        </div>
      </div>
    </AdminLayout>
  );
} 