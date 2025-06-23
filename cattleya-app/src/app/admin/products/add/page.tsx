'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  SparklesIcon,
  StarIcon,
  BoltIcon,
  CogIcon,
  FireIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { OrchidSize } from '@/core/domain/entities/Product';
import AdvancedImageUpload from '@/shared/components/AdvancedImageUpload';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';

const categories = [
  { id: 'orchids', name: 'Orchids' },
  { id: 'care-products', name: 'Care Products' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'fertilizers', name: 'Fertilizers' },
  { id: 'tools', name: 'Tools' }
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
  { value: 'solid', label: 'Solid Color', description: 'Single uniform color' },
  { value: 'bicolor', label: 'Bicolor', description: 'Two distinct colors' },
  { value: 'multicolor', label: 'Multicolor', description: 'Three or more colors' },
  { value: 'variegated', label: 'Variegated', description: 'Mixed patterns and colors' }
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

export default function AddProductPage() {
  const router = useRouter();
  const [advancedImages, setAdvancedImages] = useState<any[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [attributes, setAttributes] = useState<Array<{ name: string; value: string; type: string }>>([]);
  const [currentAttribute, setCurrentAttribute] = useState({ name: '', value: '', type: 'TEXT' });
  const [loading, setLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<OrchidSize[]>([OrchidSize.YOUNG_PLANT]);

  const {
    register,
    handleSubmit,
    watch,
    setValue
  } = useForm();

  const watchTags = watch('tags') || [];
  const watchIsOnSale = watch('isOnSale');
  const watchColorPattern = watch('colorPattern') || 'solid';
  const watchDefaultSize = watch('defaultSize') || OrchidSize.YOUNG_PLANT;

  const handleAdvancedImagesChange = (images: any[]) => {
    setAdvancedImages(images);
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
        const maxColors = watchColorPattern === 'solid' ? 1 : 
                         watchColorPattern === 'bicolor' ? 2 : 5;
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
    setLoading(true);
    
    try {
      // Validation
      if (selectedColors.length === 0) {
        toast.error('Please select at least one color');
        return;
      }

      if (!availableSizes.includes(watchDefaultSize)) {
        setAvailableSizes(prev => [...prev, watchDefaultSize]);
      }

      // In a real app, upload images and create product via API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const productData = {
        ...data,
        attributes,
        primaryColors: selectedColors,
        availableSizes,
        images: advancedImages.map((image, index) => ({
          id: image.id,
          productId: '', // Will be set by backend
          url: image.croppedPreview || image.preview,
          altText: data.name,
          isMain: image.isMain,
          sortOrder: index + 1,
          createdAt: new Date(),
          color: selectedColors[0], // Associate with primary color
          size: watchDefaultSize
        })),
        category: {
          id: data.category,
          name: categories.find(c => c.id === data.category)?.name || '',
          slug: data.category,
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        averageRating: 0,
        totalReviews: 0,
        totalSales: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Product data:', productData);
      toast.success('Product created successfully!');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Add New Product', href: '/admin/products/add' },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Dazzling Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-purple-400/15 via-pink-400/20 to-violet-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-violet-400/10 to-pink-400/15 rounded-full blur-2xl animate-pulse delay-500"></div>
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce opacity-40"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/50 rounded-full animate-ping opacity-30"></div>
          <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-violet-400/50 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-1/3 right-20 w-1 h-1 bg-pink-500/60 rounded-full animate-bounce delay-300 opacity-40"></div>
          <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-purple-500/50 rounded-full animate-ping delay-700 opacity-30"></div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
          <AdminBreadcrumb items={breadcrumbItems} />

          <div className="flex items-center justify-between my-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Add New Product
            </h1>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-md border border-white/30 text-gray-700 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Back
            </motion.button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Dazzling Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-pink-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <InformationCircleIcon className="w-6 h-6 mr-3 text-pink-600" />
                  Basic Information
                  <SparklesIcon className="w-5 h-5 ml-3 text-pink-500 animate-pulse" />
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Product Name *
                    </label>
                    <div className="relative group">
                      <input
                        {...register('name')}
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-pink-300"
                        placeholder="e.g., Cattleya Purple Majesty"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      SKU *
                    </label>
                    <div className="relative group">
                      <input
                        {...register('sku')}
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-pink-300"
                        placeholder="e.g., CATT-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Category *
                    </label>
                    <div className="relative group">
                      <select
                        {...register('category')}
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-pink-300"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Short Description *
                    </label>
                    <div className="relative group">
                      <input
                        {...register('shortDescription')}
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-pink-300"
                        placeholder="Brief description for product cards"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description *
                    </label>
                    <div className="relative group">
                      <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-pink-300 scrollbar-auto"
                        placeholder="Detailed product description"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dazzling Orchid Characteristics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <SwatchIcon className="w-6 h-6 mr-3 text-purple-600" />
                  Orchid Characteristics
                  <FireIcon className="w-5 h-5 ml-3 text-orange-500 animate-bounce" />
                </h2>

                <div className="space-y-8">
                  {/* Dazzling Color Pattern */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Color Pattern *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {colorPatterns.map(pattern => (
                        <label key={pattern.value} className="cursor-pointer group">
                          <input
                            type="radio"
                            {...register('colorPattern')}
                            value={pattern.value}
                            className="sr-only"
                          />
                          <motion.div 
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative overflow-hidden p-6 border-2 rounded-2xl text-center transition-all duration-300 ${
                              watchColorPattern === pattern.value
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-lg shadow-purple-500/20'
                                : 'border-gray-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm hover:shadow-lg'
                            }`}
                          >
                            <div className="relative">
                              <div className="font-bold text-lg">{pattern.label}</div>
                              <div className="text-sm text-gray-500 mt-2">{pattern.description}</div>
                              {watchColorPattern === pattern.value && (
                                <BoltIcon className="w-5 h-5 text-purple-500 mx-auto mt-3 animate-pulse" />
                              )}
                            </div>
                          </motion.div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dazzling Color Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Available Colors *
                    </label>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                      {commonColors.map(color => (
                        <motion.button
                          key={color.hex}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => toggleColor(color.hex)}
                          className={`relative w-12 h-12 rounded-xl border-2 transition-all duration-300 ${
                            selectedColors.includes(color.hex)
                              ? 'border-purple-500 shadow-lg shadow-purple-500/30 scale-110'
                              : 'border-gray-300 hover:border-purple-300 hover:shadow-md'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {selectedColors.includes(color.hex) && (
                            <CheckIcon className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      Selected: {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Dazzling Size Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Available Sizes *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {orchidSizes.map(size => (
                        <label key={size.value} className="cursor-pointer group">
                          <input
                            type="radio"
                            {...register('defaultSize')}
                            value={size.value}
                            className="sr-only"
                          />
                          <motion.div 
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative overflow-hidden p-4 border-2 rounded-xl transition-all duration-300 ${
                              watchDefaultSize === size.value
                                ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700 shadow-lg shadow-violet-500/20'
                                : 'border-gray-200 hover:border-violet-300 bg-white/80 backdrop-blur-sm hover:shadow-lg'
                            }`}
                          >
                            <div className="font-semibold">{size.label}</div>
                            <div className="text-sm text-gray-500 mt-1">{size.description}</div>
                            {watchDefaultSize === size.value && (
                              <StarIcon className="w-4 h-4 text-violet-500 absolute top-2 right-2 animate-pulse" />
                            )}
                          </motion.div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dazzling Pricing Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-violet-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <CurrencyDollarIcon className="w-6 h-6 mr-3 text-violet-600" />
                  Pricing & Inventory
                  <SparklesIcon className="w-5 h-5 ml-3 text-violet-500 animate-pulse" />
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Regular Price *
                    </label>
                    <div className="relative group">
                      <input
                        {...register('regularPrice')}
                        type="number"
                        step="0.01"
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-violet-200/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-violet-300"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sale Price
                    </label>
                    <div className="relative group">
                      <input
                        {...register('salePrice')}
                        type="number"
                        step="0.01"
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-violet-200/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-violet-300"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Stock Quantity *
                    </label>
                    <div className="relative group">
                      <input
                        {...register('stockQuantity')}
                        type="number"
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-violet-200/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-violet-300"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      SKU Prefix
                    </label>
                    <div className="relative group">
                      <input
                        {...register('skuPrefix')}
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-violet-200/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-violet-300"
                        placeholder="CATT"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center space-x-4">
                  <input
                    {...register('isOnSale')}
                    type="checkbox"
                    id="isOnSale"
                    className="w-5 h-5 text-violet-600 bg-white/70 border-violet-300 rounded focus:ring-violet-500"
                  />
                  <label htmlFor="isOnSale" className="text-sm font-semibold text-gray-700">
                    This product is on sale
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Dazzling Image Upload */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-pink-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <PhotoIcon className="w-6 h-6 mr-3 text-pink-600" />
                  Product Images
                  <CloudArrowUpIcon className="w-5 h-5 ml-3 text-pink-500 animate-pulse" />
                </h2>
                
                <AdvancedImageUpload
                  onImagesChange={handleAdvancedImagesChange}
                  maxImages={10}
                  className="w-full"
                />
              </div>
            </motion.div>

            {/* Dazzling Tags Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <TagIcon className="w-6 h-6 mr-3 text-purple-600" />
                  Tags & Attributes
                  <ArchiveBoxIcon className="w-5 h-5 ml-3 text-purple-500 animate-pulse" />
                </h2>

                <div className="space-y-6">
                  {/* Dazzling Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Product Tags
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
                        placeholder="Add a tag..."
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={addTag}
                        className="px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {watchTags.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap gap-2"
                      >
                        {watchTags.map((tag: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <span className="text-sm font-medium">{tag}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Dazzling Attributes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Custom Attributes
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={currentAttribute.name}
                        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
                        placeholder="Attribute name"
                      />
                      <input
                        type="text"
                        value={currentAttribute.value}
                        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, value: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
                        placeholder="Attribute value"
                      />
                      <select
                        value={currentAttribute.type}
                        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, type: e.target.value }))}
                        className="px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
                      >
                        {attributeTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={addAttribute}
                        className="px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {attributes.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                      >
                        {attributes.map((attr, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <span className="font-medium text-gray-900">{attr.name}</span>
                              <span className="text-gray-600">{attr.value}</span>
                              <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                                {attr.type}
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => removeAttribute(index)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dazzling Settings Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-violet-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <CogIcon className="w-6 h-6 mr-3 text-violet-600" />
                  Product Settings
                  <SparklesIcon className="w-5 h-5 ml-3 text-violet-500 animate-pulse" />
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <input
                        {...register('isActive')}
                        type="checkbox"
                        id="isActive"
                        defaultChecked
                        className="w-5 h-5 text-violet-600 bg-white/70 border-violet-300 rounded focus:ring-violet-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                        Active (Visible on website)
                      </label>
                    </div>

                    <div className="flex items-center space-x-4">
                      <input
                        {...register('isFeatured')}
                        type="checkbox"
                        id="isFeatured"
                        className="w-5 h-5 text-violet-600 bg-white/70 border-violet-300 rounded focus:ring-violet-500"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700">
                        Featured Product
                      </label>
                    </div>

                    <div className="flex items-center space-x-4">
                      <input
                        {...register('allowBackorder')}
                        type="checkbox"
                        id="allowBackorder"
                        className="w-5 h-5 text-violet-600 bg-white/70 border-violet-300 rounded focus:ring-violet-500"
                      />
                      <label htmlFor="allowBackorder" className="text-sm font-semibold text-gray-700">
                        Allow Backorders
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Weight (grams)
                      </label>
                      <div className="relative group">
                        <input
                          {...register('weight')}
                          type="number"
                          step="0.01"
                          className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-violet-200/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-violet-300"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Low Stock Alert
                      </label>
                      <div className="relative group">
                        <input
                          {...register('lowStockAlert')}
                          type="number"
                          className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-violet-200/50 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-violet-300"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dazzling Submit Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 text-white rounded-2xl font-medium hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Create Product
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 