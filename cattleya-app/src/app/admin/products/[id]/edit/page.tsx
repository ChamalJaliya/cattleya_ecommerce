'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  TagIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  CheckIcon,
  SwatchIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { OrchidSize } from '@/core/domain/entities/Product';

// Define ColorPattern enum locally since it's not exported
const ColorPattern = {
  SOLID: 'solid' as const,
  BICOLOR: 'bicolor' as const,
  MULTICOLOR: 'multicolor' as const,
  VARIEGATED: 'variegated' as const
} as const;
import { useProductStore } from '@/core/application/stores/useProductStore';
import { productsApi } from '@/core/infrastructure/api/products.api';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  { id: 'cattleya', name: 'Cattleya' },
  { id: 'phalaenopsis', name: 'Phalaenopsis' },
  { id: 'dendrobium', name: 'Dendrobium' },
  { id: 'oncidium', name: 'Oncidium' },
  { id: 'vanda', name: 'Vanda' },
  { id: 'cymbidium', name: 'Cymbidium' },
  { id: 'miltonia', name: 'Miltonia' },
  { id: 'paphiopedilum', name: 'Paphiopedilum' },
  { id: 'brassia', name: 'Brassia' },
  { id: 'zygopetalum', name: 'Zygopetalum' }
];

const attributeTypes = [
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'COLOR', label: 'Color' },
  { value: 'SIZE', label: 'Size' }
];

const orchidSizes = [
  { value: OrchidSize.SEEDLING, label: 'Seedling (0-6 months)', description: 'Very small, just starting to grow' },
  { value: OrchidSize.SAPLING, label: 'Sapling (6-12 months)', description: 'Small plant in 2-3 inch pot' },
  { value: OrchidSize.YOUNG_PLANT, label: 'Young Plant (1-2 years)', description: 'Established roots, 4-5 inch pot' },
  { value: OrchidSize.MATURE, label: 'Mature (2-3 years)', description: 'Strong growth, may bloom soon' },
  { value: OrchidSize.BLOOMING_SIZE, label: 'Blooming Size (3+ years)', description: 'Ready to bloom or blooming' },
  { value: OrchidSize.SPECIMEN, label: 'Specimen (5+ years)', description: 'Large mature plant, multiple growths' }
];

const colorPatterns = [
  { value: ColorPattern.SOLID, label: 'Solid Color', description: 'Single uniform color' },
  { value: ColorPattern.BICOLOR, label: 'Bicolor', description: 'Two distinct colors' },
  { value: ColorPattern.MULTICOLOR, label: 'Multicolor', description: 'Three or more colors' },
  { value: ColorPattern.VARIEGATED, label: 'Variegated', description: 'Mixed patterns and colors' }
];

const commonColors = [
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Lavender', hex: '#A78BFA' },
  { name: 'Coral', hex: '#FB7185' }
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const { getProduct, updateProduct } = useProductStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [attributes, setAttributes] = useState<Array<{ name: string; value: string; type: string }>>([]);
  const [currentAttribute, setCurrentAttribute] = useState({ name: '', value: '', type: 'TEXT' });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<OrchidSize[]>([OrchidSize.YOUNG_PLANT]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  const watchTags = watch('tags') || [];
  const watchIsOnSale = watch('isOnSale');
  const watchColorPattern = watch('colorPattern') || ColorPattern.SOLID;
  const watchDefaultSize = watch('defaultSize') || OrchidSize.YOUNG_PLANT;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await getProduct(productId);
      
      if (!productData) {
        toast.error('Product not found');
        router.push('/admin/products');
        return;
      }

      setProduct(productData);
      
      // Populate form with existing data
      reset({
        name: productData.name,
        slug: productData.slug,
        sku: productData.sku,
        shortDescription: productData.shortDescription,
        description: productData.description,
        basePrice: productData.basePrice,
        salePrice: productData.salePrice,
        stockQuantity: productData.stockQuantity,
        lowStockThreshold: productData.lowStockThreshold,
        weight: productData.weight,
        defaultSize: productData.defaultSize,
        colorPattern: productData.colorPattern,
        categoryId: productData.category?.id,
        tags: productData.tags || [],
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
        metaKeywords: productData.metaKeywords || [],
        isActive: productData.isActive,
        isFeatured: productData.isFeatured,
        isDigital: productData.isDigital,
        isOnSale: productData.salePrice && productData.salePrice < productData.basePrice
      });

      // Set other state
      setExistingImages(productData.images || []);
      setSelectedColors(productData.primaryColors || []);
      setAvailableSizes(productData.availableSizes || [OrchidSize.YOUNG_PLANT]);
      setAttributes(productData.attributes || []);
      
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !watchTags.includes(currentTag.trim())) {
      setValue('tags', [...watchTags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchTags.filter((tag: string) => tag !== tagToRemove));
  };

  const addAttribute = () => {
    if (currentAttribute.name.trim() && currentAttribute.value.trim()) {
      setAttributes(prev => [...prev, { ...currentAttribute }]);
      setCurrentAttribute({ name: '', value: '', type: 'TEXT' });
    }
  };

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const toggleColor = (colorHex: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorHex)) {
        return prev.filter(c => c !== colorHex);
      } else {
        // Limit based on color pattern
        const maxColors = watchColorPattern === ColorPattern.SOLID ? 1 : 
                         watchColorPattern === ColorPattern.BICOLOR ? 2 : 5;
        if (prev.length >= maxColors) {
          toast.error(`Maximum ${maxColors} colors allowed for ${watchColorPattern} pattern`);
          return prev;
        }
        return [...prev, colorHex];
      }
    });
  };

  const toggleSize = (size: OrchidSize) => {
    setAvailableSizes(prev => {
      if (prev.includes(size)) {
        // Don't allow removing the default size
        if (size === watchDefaultSize) {
          toast.error('Cannot remove the default size');
          return prev;
        }
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    
    try {
      // Validation
      if (selectedColors.length === 0) {
        toast.error('Please select at least one color');
        return;
      }

      if (!availableSizes.includes(watchDefaultSize)) {
        setAvailableSizes(prev => [...prev, watchDefaultSize]);
      }

      // Prepare update data
      const updateData = {
        ...data,
        attributes,
        primaryColors: selectedColors,
        availableSizes,
        // Handle images separately - in a real app, you'd upload new images first
        images: [
          ...existingImages,
          ...imagePreview.map((url, index) => ({
            id: `new-${index}`,
            productId: productId,
            url,
            altText: data.name,
            isMain: existingImages.length === 0 && index === 0,
            sortOrder: existingImages.length + index + 1,
            createdAt: new Date(),
            color: selectedColors[0],
            size: watchDefaultSize
          }))
        ]
      };

      // Call API to update product
      const response = await productsApi.updateProduct(productId, updateData);
      
      if (response.success) {
        toast.success('Product updated successfully!');
        router.push('/admin/products');
      } else {
        throw new Error('Failed to update product');
      }
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
            <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
            <Link
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/products"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-2">Update product information and details</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                <InformationCircleIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  {...register('name', { required: 'Product name is required' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                <input
                  {...register('sku', { required: 'SKU is required' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter SKU"
                />
                {errors.sku && (
                  <p className="text-red-500 text-sm mt-1">{errors.sku.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  {...register('slug')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="product-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  {...register('categoryId', { required: 'Category is required' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoryId.message as string}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
              <textarea
                {...register('shortDescription')}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description for product listings"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Detailed product description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>
              )}
            </div>
          </motion.div>

          {/* Pricing & Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Pricing & Inventory</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('basePrice', { required: 'Base price is required', min: 0 })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                {errors.basePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.basePrice.message as string}</p>
                )}
              </div>

              {watchIsOnSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      {...register('salePrice', { min: 0 })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  {...register('stockQuantity', { required: 'Stock quantity is required', min: 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
                {errors.stockQuantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.stockQuantity.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                <input
                  type="number"
                  {...register('lowStockThreshold', { min: 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (oz)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('weight', { min: 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center">
              <input
                type="checkbox"
                {...register('isOnSale')}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">Product is on sale</label>
            </div>
          </motion.div>

          {/* Orchid Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <SwatchIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Orchid Specifications</h2>
            </div>

            {/* Default Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Default Size *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orchidSizes.map(size => (
                  <div
                    key={size.value}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      watchDefaultSize === size.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setValue('defaultSize', size.value)}
                  >
                    <div className="font-medium text-sm text-gray-900">{size.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{size.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Sizes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Available Sizes</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {orchidSizes.map(size => (
                  <div
                    key={size.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                      availableSizes.includes(size.value)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSize(size.value)}
                  >
                    <div className="font-medium text-xs">{size.label.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Pattern */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Color Pattern *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {colorPatterns.map(pattern => (
                  <div
                    key={pattern.value}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      watchColorPattern === pattern.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setValue('colorPattern', pattern.value)}
                  >
                    <div className="font-medium text-sm text-gray-900">{pattern.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{pattern.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Colors */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Colors * 
                <span className="text-xs text-gray-500 ml-2">
                  ({selectedColors.length}/{watchColorPattern === ColorPattern.SOLID ? 1 : watchColorPattern === ColorPattern.BICOLOR ? 2 : 5} selected)
                </span>
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {commonColors.map(color => (
                  <div
                    key={color.hex}
                    className={`relative w-12 h-12 rounded-xl cursor-pointer border-4 transition-all duration-200 ${
                      selectedColors.includes(color.hex)
                        ? 'border-purple-500 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => toggleColor(color.hex)}
                    title={color.name}
                  >
                    {selectedColors.includes(color.hex) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckIcon className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <Image
                          src={image.url}
                          alt={image.altText || 'Product image'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {image.isMain && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {imagePreview.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">New Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <Image
                          src={preview}
                          alt={`New image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {existingImages.length === 0 && index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Will be Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors duration-200">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">Upload Images</div>
                <div className="text-sm text-gray-500 mb-4">
                  Drag and drop or click to select images (max 5 total)
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Choose Files
                </div>
              </label>
            </div>
          </motion.div>

          {/* Tags & Attributes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mr-4">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Tags & Attributes</h2>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {watchTags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Attributes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Custom Attributes</label>
              <div className="space-y-3 mb-4">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{attr.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({attr.type})</span>
                    </div>
                    <div className="text-sm text-gray-700">{attr.value}</div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={currentAttribute.name}
                  onChange={(e) => setCurrentAttribute(prev => ({ ...prev, name: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Attribute name"
                />
                <input
                  type="text"
                  value={currentAttribute.value}
                  onChange={(e) => setCurrentAttribute(prev => ({ ...prev, value: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Attribute value"
                />
                <select
                  value={currentAttribute.type}
                  onChange={(e) => setCurrentAttribute(prev => ({ ...prev, type: e.target.value }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {attributeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>

          {/* SEO & Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <ArchiveBoxIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">SEO & Settings</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  {...register('metaTitle')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  {...register('metaDescription')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="SEO description for search engines"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Active</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isFeatured')}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Featured</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isDigital')}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Digital Product</label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200"
          >
            <Link
              href="/admin/products"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Update Product
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </AdminLayout>
  );
} 