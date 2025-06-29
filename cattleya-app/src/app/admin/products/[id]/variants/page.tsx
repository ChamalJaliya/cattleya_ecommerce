'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  StarIcon,
  TagIcon,
  GlobeAltIcon,
  ClockIcon,
  PhotoIcon,
  CameraIcon,
  ArrowsUpDownIcon,
  CubeIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { toast } from 'react-hot-toast';

interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isMain: boolean;
  sortOrder: number;
  variantId?: string;
}

interface Attribute {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  sortOrder: number;
  options: string[];
  minValue?: number;
  maxValue?: number;
  unit?: string;
  maxLength?: number;
  pattern?: string;
  allowCustom: boolean;
}

interface AttributeSet {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  attributes: Attribute[];
}

interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  attributes: Record<string, any>;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  availableSizes: string[];
  primaryColors: string[];
  attributeSetId?: string;
  attributeSet?: AttributeSet;
}

export default function ProductVariantsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    price: 0,
    stock: 0,
    isActive: true,
    attributes: {} as Record<string, any>,
  });

  // Image upload state
  const [imageUpload, setImageUpload] = useState({
    file: null as File | null,
    altText: '',
    isMain: false,
  });

  useEffect(() => {
    fetchProduct();
    fetchVariants();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        
        // If product has an attribute set, fetch it
        if (data.attributeSetId) {
          await fetchAttributeSet(data.attributeSetId);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch product');
    }
  };

  const fetchAttributeSet = async (attributeSetId: string) => {
    try {
      const response = await fetch(`/api/attribute-sets/${attributeSetId}/with-attributes`);
      if (response.ok) {
        const attributeSet = await response.json();
        setProduct(prev => prev ? { ...prev, attributeSet } : null);
      }
    } catch (error) {
      console.error('Failed to fetch attribute set:', error);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await fetch(`/api/products/variants/by-product/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setVariants(data);
      }
    } catch (error) {
      toast.error('Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const variantData = {
      productId,
      sku: formData.sku,
      price: parseFloat(formData.price.toString()),
      stock: parseInt(formData.stock.toString()),
      isActive: formData.isActive,
      attributes: formData.attributes,
    };

    try {
      const url = editingVariant 
        ? `/api/products/variants/${editingVariant.id}`
        : '/api/products/variants';
      
      const method = editingVariant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantData),
      });

      if (response.ok) {
        toast.success(editingVariant ? 'Variant updated!' : 'Variant created!');
        setShowAddModal(false);
        setEditingVariant(null);
        resetForm();
        fetchVariants();
      } else {
        toast.error('Failed to save variant');
      }
    } catch (error) {
      toast.error('Failed to save variant');
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const response = await fetch(`/api/products/variants/${variantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Variant deleted!');
        fetchVariants();
      } else {
        toast.error('Failed to delete variant');
      }
    } catch (error) {
      toast.error('Failed to delete variant');
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      isActive: variant.isActive,
      attributes: variant.attributes,
    });
    setShowAddModal(true);
  };

  const handleManageImages = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setShowImageModal(true);
  };

  const handleImageUpload = async () => {
    if (!imageUpload.file || !selectedVariant) return;

    const formData = new FormData();
    formData.append('file', imageUpload.file);
    formData.append('altText', imageUpload.altText);
    formData.append('isMain', imageUpload.isMain.toString());
    formData.append('variantId', selectedVariant.id);

    try {
      const response = await fetch('/api/products/variants/images', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Image uploaded!');
        setShowImageModal(false);
        setImageUpload({ file: null, altText: '', isMain: false });
        fetchVariants();
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/variants/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Image deleted!');
        fetchVariants();
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleSetMainImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/products/variants/images/${imageId}/set-main`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast.success('Main image updated!');
        fetchVariants();
      } else {
        toast.error('Failed to update main image');
      }
    } catch (error) {
      toast.error('Failed to update main image');
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      price: 0,
      stock: 0,
      isActive: true,
      attributes: {},
    });
  };

  const openAddModal = () => {
    setEditingVariant(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleGoBack = () => {
    router.push(`/admin/products/${productId}`);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Products', href: '/admin/products' },
    { label: product?.name || 'Product', href: `/admin/products/${productId}` },
    { label: 'Variants', href: `/admin/products/${productId}/variants` }
  ];

  // Guard for variants
  const safeVariants = Array.isArray(variants) ? variants : [];

  if (loading) {
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
                  Product Variants
                </h1>
                {product && (
                  <p className="text-gray-600 mt-2 flex items-center">
                    <ShoppingBagIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Managing variants for: <span className="font-semibold text-purple-600 ml-1">{product.name}</span>
                  </p>
                )}
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
                  onClick={openAddModal}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                  <span className="relative flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Variant
                    <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Variants Grid or Empty State */}
          {safeVariants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[40vh] text-center"
            >
              {/* Dazzling Illustration */}
              <div className="relative mb-8">
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-tr from-pink-400/30 via-purple-400/20 to-violet-400/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 via-pink-400/25 to-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="relative z-10 flex items-center justify-center w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full shadow-xl">
                  <SparklesIcon className="w-16 h-16 text-purple-400 animate-bounce" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                No Variants Yet
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You haven't added any variants for this product. Variants let you manage stock, price, and images for different sizes, colors, or other attributes. Get started by adding your first variant!
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={openAddModal}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 text-lg"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                <span className="relative flex items-center justify-center">
                  <PlusIcon className="w-6 h-6 mr-2" />
                  Add Variant
                  <SparklesIcon className="w-5 h-5 ml-2 animate-pulse" />
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {safeVariants.map((variant, index) => (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-purple-500/10 transition-all duration-300">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          SKU: {variant.sku}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {new Date(variant.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleManageImages(variant)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:shadow-md"
                          title="Manage Images"
                        >
                          <PhotoIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(variant)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(variant.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Variant Image Preview */}
                    {variant.images && variant.images.length > 0 && (
                      <div className="mb-4">
                        <div className="relative w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                          <img
                            src={variant.images.find(img => img.isMain)?.url || variant.images[0].url}
                            alt={variant.images.find(img => img.isMain)?.altText || variant.images[0].altText}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {variant.images.length} {variant.images.length === 1 ? 'image' : 'images'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <span className="text-gray-600 flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                          Price:
                        </span>
                        <span className="font-bold text-green-600">${variant.price}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                        <span className="text-gray-600 flex items-center">
                          <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                          Stock:
                        </span>
                        <span className={`font-bold ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variant.stock}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <span className="text-gray-600 flex items-center">
                          <TagIcon className="w-4 h-4 mr-2" />
                          Status:
                        </span>
                        <span className={`font-bold ${variant.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {variant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Attributes Display */}
                      {Object.keys(variant.attributes).length > 0 && (
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <SwatchIcon className="w-4 h-4 mr-2" />
                            Attributes:
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium text-gray-600">{key}:</span>
                                <span className="ml-1 text-gray-800">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Add/Edit Variant Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., ORCHID-001-M-YELLOW"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.isActive.toString()}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Attributes */}
                  {product?.attributeSet && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <SwatchIcon className="w-5 h-5 mr-2 text-purple-500" />
                        Attributes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.attributeSet.attributes.map((attribute) => (
                          <div key={attribute.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {attribute.name} {attribute.isRequired && '*'}
                            </label>
                            
                            {attribute.type === 'TEXT' && (
                              <input
                                type="text"
                                value={formData.attributes[attribute.name] || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attribute.name]: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                required={attribute.isRequired}
                                maxLength={attribute.maxLength}
                              />
                            )}

                            {attribute.type === 'NUMBER' && (
                              <input
                                type="number"
                                value={formData.attributes[attribute.name] || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attribute.name]: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder={`Enter ${attribute.name.toLowerCase()}`}
                                required={attribute.isRequired}
                                min={attribute.minValue}
                                max={attribute.maxValue}
                                step="0.01"
                              />
                            )}

                            {attribute.type === 'SELECT' && (
                              <select
                                value={formData.attributes[attribute.name] || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attribute.name]: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                required={attribute.isRequired}
                              >
                                <option value="">Select {attribute.name.toLowerCase()}</option>
                                {attribute.options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}

                            {attribute.type === 'COLOR' && (
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={formData.attributes[attribute.name] || '#000000'}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    attributes: {
                                      ...formData.attributes,
                                      [attribute.name]: e.target.value
                                    }
                                  })}
                                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={formData.attributes[attribute.name] || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    attributes: {
                                      ...formData.attributes,
                                      [attribute.name]: e.target.value
                                    }
                                  })}
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                  placeholder="Color name (e.g., Yellow, Red)"
                                  required={attribute.isRequired}
                                />
                              </div>
                            )}

                            {attribute.type === 'BOOLEAN' && (
                              <select
                                value={formData.attributes[attribute.name]?.toString() || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attribute.name]: e.target.value === 'true'
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                required={attribute.isRequired}
                              >
                                <option value="">Select {attribute.name.toLowerCase()}</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/30"
                    >
                      {editingVariant ? 'Update Variant' : 'Create Variant'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Management Modal */}
      <AnimatePresence>
        {showImageModal && selectedVariant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Manage Variant Images
                  </h2>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Upload New Image */}
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CameraIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Upload New Image
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image File
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageUpload({
                            ...imageUpload,
                            file: e.target.files?.[0] || null
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={imageUpload.altText}
                          onChange={(e) => setImageUpload({
                            ...imageUpload,
                            altText: e.target.value
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          placeholder="Description of the image"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={imageUpload.isMain}
                          onChange={(e) => setImageUpload({
                            ...imageUpload,
                            isMain: e.target.checked
                          })}
                          className="mr-2 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Set as main image</span>
                      </label>
                      <button
                        onClick={handleImageUpload}
                        disabled={!imageUpload.file}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Upload Image
                      </button>
                    </div>
                  </div>

                  {/* Current Images */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <PhotoIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Current Images
                    </h3>
                    {selectedVariant.images && selectedVariant.images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedVariant.images.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                              <img
                                src={image.url}
                                alt={image.altText}
                                className="w-full h-32 object-cover"
                              />
                              {image.isMain && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  Main
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleSetMainImage(image.id)}
                                  disabled={image.isMain}
                                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                  title="Set as main"
                                >
                                  <StarIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  title="Delete image"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 truncate">{image.altText}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No images uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
} 