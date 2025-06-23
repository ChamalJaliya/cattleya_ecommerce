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
  ShoppingBagIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { Product } from '@/core/domain/entities/Product';
import toast from 'react-hot-toast';

interface ProductEditPageProps {
  params: {
    id: string;
  };
}

export default function ProductEditPage({ params }: ProductEditPageProps) {
  const router = useRouter();
  const { products, loading, fetchProducts, updateProduct } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    shortDescription: '',
    description: '',
    basePrice: '',
    salePrice: '',
    stockQuantity: '',
    lowStockThreshold: '',
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    weight: '',
    metaTitle: '',
    metaDescription: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    // If products are already loaded, find the product
    const existingProduct = products.find(p => p.id === params.id);
    if (existingProduct) {
      setProduct(existingProduct);
      populateFormData(existingProduct);
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
      populateFormData(foundProduct);
    }
  };

  const populateFormData = (product: Product) => {
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      basePrice: product.basePrice?.toString() || '',
      salePrice: product.salePrice?.toString() || '',
      stockQuantity: product.stockQuantity?.toString() || '',
      lowStockThreshold: product.lowStockThreshold?.toString() || '',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      isOnSale: product.isOnSale ?? false,
      weight: product.weight?.toString() || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      tags: product.tags || [],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.basePrice.trim()) newErrors.basePrice = 'Base price is required';
    if (!formData.stockQuantity.trim()) newErrors.stockQuantity = 'Stock quantity is required';
    if (!formData.lowStockThreshold.trim()) newErrors.lowStockThreshold = 'Low stock threshold is required';

    if (formData.basePrice && isNaN(Number(formData.basePrice))) {
      newErrors.basePrice = 'Base price must be a valid number';
    }

    if (formData.salePrice && isNaN(Number(formData.salePrice))) {
      newErrors.salePrice = 'Sale price must be a valid number';
    }

    if (formData.stockQuantity && isNaN(Number(formData.stockQuantity))) {
      newErrors.stockQuantity = 'Stock quantity must be a valid number';
    }

    if (formData.lowStockThreshold && isNaN(Number(formData.lowStockThreshold))) {
      newErrors.lowStockThreshold = 'Low stock threshold must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !product) return;

    setSaving(true);
    try {
      const updatedProduct: Partial<Product> = {
        ...product,
        name: formData.name,
        sku: formData.sku,
        shortDescription: formData.shortDescription,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isOnSale: formData.isOnSale,
        weight: formData.weight ? Number(formData.weight) : undefined,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        tags: formData.tags,
      };

      await updateProduct(product.id, updatedProduct);
      toast.success('Product updated successfully!');
      router.push(`/admin/products/${product.id}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    router.push(`/admin/products/${params.id}`);
  };

  const handleGoToProducts = () => {
    router.push('/admin/products');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Products', href: '/admin/products' },
    { label: product?.name || 'Product', href: `/admin/products/${params.id}` },
    { label: 'Edit', href: `/admin/products/${params.id}/edit` }
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
                    onClick={handleGoToProducts}
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
                    Edit Product
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <PencilIcon className="w-5 h-5 text-pink-500 mr-2" />
                    {product.name}
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
                    Back to View
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Basic Information */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-pink-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <SparklesIcon className="w-6 h-6 text-pink-600 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Basic Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                        errors.name ? 'border-red-500' : 'border-pink-200/50'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className={`w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 ${
                        errors.sku ? 'border-red-500' : 'border-purple-200/50'
                      }`}
                      placeholder="Enter SKU"
                    />
                    {errors.sku && (
                      <p className="text-red-500 text-sm mt-2">{errors.sku}</p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Brief product description"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Detailed product description"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Pricing & Inventory
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Base Price *
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 ${
                        errors.basePrice ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.basePrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>
                    )}
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 ${
                        errors.salePrice ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.salePrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.salePrice}</p>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 ${
                        errors.stockQuantity ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="0"
                    />
                    {errors.stockQuantity && (
                      <p className="text-red-500 text-sm mt-1">{errors.stockQuantity}</p>
                    )}
                  </div>

                  {/* Low Stock Threshold */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Low Stock Threshold *
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 ${
                        errors.lowStockThreshold ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="0"
                    />
                    {errors.lowStockThreshold && (
                      <p className="text-red-500 text-sm mt-1">{errors.lowStockThreshold}</p>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings & Status */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <BoltIcon className="w-6 h-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Settings & Status
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Active Status */}
                  <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-bold text-gray-700">Active</label>
                      <p className="text-xs text-gray-500">Visible to customers</p>
                    </div>
                  </div>

                  {/* Featured Status */}
                  <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-bold text-gray-700">Featured</label>
                      <p className="text-xs text-gray-500">Show in featured section</p>
                    </div>
                  </div>

                  {/* On Sale Status */}
                  <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-bold text-gray-700">On Sale</label>
                      <p className="text-xs text-gray-500">Mark as sale item</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <TagIcon className="w-6 h-6 text-orange-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Tags
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Add Tag */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Add a tag"
                    />
                    <button
                      onClick={handleAddTag}
                      className="group/btn relative overflow-hidden"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                      <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center group-hover/btn:scale-105">
                        <PlusIcon className="w-5 h-5" />
                      </div>
                    </button>
                  </div>

                  {/* Tag List */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-orange-600 hover:text-orange-800 focus:outline-none"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <GlobeAltIcon className="w-6 h-6 text-indigo-500 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    SEO Settings
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Meta Title */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="SEO title for search engines"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="SEO description for search engines"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-violet-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                <span className="relative flex items-center">
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
} 