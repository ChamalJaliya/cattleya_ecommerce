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
  FireIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { OrchidSize } from '@/core/domain/entities/Product';
import AdvancedImageUpload from '@/shared/components/AdvancedImageUpload';

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

  return (
    <AdminLayout>
      {/* Subtle Background Effects - original theme colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-400/15 via-violet-400/10 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/8 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Subtle floating particles */}
        <div className="absolute top-20 left-20 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-violet-400/50 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-indigo-400/50 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-1/3 right-20 w-1 h-1 bg-purple-500/60 rounded-full animate-bounce delay-300 opacity-40"></div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        {/* Refined Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/15 via-violet-600/15 to-indigo-600/15 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                  Add New Product
                </h1>
                <p className="text-gray-600 flex items-center">
                  <SparklesIcon className="w-5 h-5 text-purple-500 mr-2 animate-pulse" />
                  Create a magical orchid for your catalog
                  <StarIcon className="w-4 h-4 text-violet-400 ml-2 animate-bounce" />
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="group relative overflow-hidden bg-white/90 backdrop-blur-md border border-white/30 text-gray-700 px-8 py-4 rounded-2xl font-medium hover:bg-white/95 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="relative">Cancel</span>
            </motion.button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Refined Basic Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-6 flex items-center">
                <InformationCircleIcon className="w-6 h-6 mr-3 text-purple-600" />
                Basic Information
                <SparklesIcon className="w-5 h-5 ml-3 text-purple-500 animate-pulse" />
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Product Name *
                  </label>
                  <div className="relative group">
                    <input
                      {...register('name')}
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
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
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
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
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
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
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300"
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
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300 scrollbar-auto"
                      placeholder="Detailed product description"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refined Orchid Characteristics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-violet-500/10 transition-all duration-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center">
                <SwatchIcon className="w-6 h-6 mr-3 text-violet-600" />
                Orchid Characteristics
                <FireIcon className="w-5 h-5 ml-3 text-orange-500 animate-bounce" />
              </h2>

              <div className="space-y-8">
                {/* Refined Color Pattern */}
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
                              ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 text-violet-700 shadow-lg shadow-violet-500/20'
                              : 'border-gray-200 hover:border-violet-300 bg-white/80 backdrop-blur-sm hover:shadow-lg'
                          }`}
                        >
                          <div className="relative">
                            <div className="font-bold text-lg">{pattern.label}</div>
                            <div className="text-sm text-gray-500 mt-2">{pattern.description}</div>
                            {watchColorPattern === pattern.value && (
                              <BoltIcon className="w-5 h-5 text-violet-500 mx-auto mt-3 animate-pulse" />
                            )}
                          </div>
                        </motion.div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Refined Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    <span className="flex items-center">
                      Colors * (Select {watchColorPattern === 'solid' ? '1' : watchColorPattern === 'bicolor' ? '1-2' : '1-5'})
                      <StarIcon className="w-4 h-4 ml-2 text-yellow-500 animate-pulse" />
                    </span>
                  </label>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                    {commonColors.map(color => (
                      <motion.button
                        key={color.hex}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleColor(color.hex)}
                        className={`relative w-14 h-14 rounded-2xl border-3 transition-all duration-300 hover:shadow-lg group ${
                          selectedColors.includes(color.hex)
                            ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColors.includes(color.hex) && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CheckIcon className="w-7 h-7 text-white absolute inset-0 m-auto drop-shadow-lg" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {selectedColors.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex flex-wrap gap-3"
                    >
                      {selectedColors.map((colorHex, index) => {
                        const colorName = commonColors.find(c => c.hex === colorHex)?.name || colorHex;
                        return (
                          <motion.span
                            key={colorHex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="inline-flex items-center bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium shadow-md backdrop-blur-sm border border-purple-200/50 hover:shadow-lg transition-all duration-200"
                          >
                            <div
                              className="w-4 h-4 rounded-full mr-3 border-2 border-white shadow-sm"
                              style={{ backgroundColor: colorHex }}
                            />
                            {colorName}
                            <button
                              type="button"
                              onClick={() => toggleColor(colorHex)}
                              className="ml-3 text-purple-600 hover:text-purple-800 transition-colors duration-200 hover:scale-105"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </motion.span>
                        );
                      })}
                    </motion.div>
                  )}
                </div>

                {/* Refined Size Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Default Size *
                  </label>
                  <div className="relative group">
                    <select
                      {...register('defaultSize')}
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-purple-300 mb-6"
                    >
                      {orchidSizes.map(size => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    <span className="flex items-center">
                      Available Sizes * (Select all sizes you offer)
                      <SparklesIcon className="w-4 h-4 ml-2 text-purple-500 animate-pulse" />
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orchidSizes.map(size => (
                      <label key={size.value} className="cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={availableSizes.includes(size.value)}
                          onChange={() => toggleSize(size.value)}
                          className="sr-only"
                        />
                        <motion.div 
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative overflow-hidden p-5 border-2 rounded-2xl transition-all duration-300 ${
                            availableSizes.includes(size.value)
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 shadow-md shadow-purple-500/20'
                              : 'border-gray-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm hover:shadow-lg'
                          }`}
                        >
                          <div className="relative flex items-center justify-between">
                            <div>
                              <div className="font-bold text-gray-900">{size.label}</div>
                              <div className="text-sm text-gray-600 mt-1">{size.description}</div>
                            </div>
                            {availableSizes.includes(size.value) && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                              >
                                <CheckIcon className="w-6 h-6 text-purple-600" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refined Pricing Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-emerald-500/10 transition-all duration-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center">
                <CurrencyDollarIcon className="w-6 h-6 mr-3 text-emerald-600" />
                Pricing & Inventory
                <SparklesIcon className="w-5 h-5 ml-3 text-emerald-500 animate-pulse" />
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Regular Price *
                  </label>
                  <div className="relative group">
                    <input
                      {...register('price', { required: true })}
                      type="number"
                      step="0.01"
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-emerald-300"
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
                      {...register('stockQuantity', { required: true })}
                      type="number"
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-emerald-200/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-emerald-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    {...register('isOnSale')}
                    type="checkbox"
                    id="isOnSale"
                    className="w-5 h-5 text-emerald-600 bg-white/70 border-emerald-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isOnSale" className="text-sm font-semibold text-gray-700">
                    On Sale
                  </label>
                </div>

                {watchIsOnSale && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sale Price *
                    </label>
                    <input
                      {...register('salePrice')}
                      type="number"
                      step="0.01"
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-orange-300"
                      placeholder="0.00"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Advanced Image Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-500"></div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl">
                <PhotoIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Product Images</h2>
                <p className="text-gray-500">Upload high-quality images to showcase your product</p>
              </div>
            </div>
            <AdvancedImageUpload
              onImagesChange={handleAdvancedImagesChange}
            />
          </motion.div>

          {/* Refined Tags Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-orange-500/10 transition-all duration-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                <TagIcon className="w-6 h-6 mr-3 text-orange-600" />
                Tags & Attributes
                <SparklesIcon className="w-5 h-5 ml-3 text-orange-500 animate-pulse" />
              </h2>

              <div className="space-y-8">
                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Product Tags
                  </label>
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-orange-300"
                        placeholder="Enter tag and press Enter"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addTag}
                      className="px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {watchTags.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-wrap gap-3"
                    >
                      {watchTags.map((tag: string, index: number) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="inline-flex items-center bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium shadow-md backdrop-blur-sm border border-orange-200/50 hover:shadow-lg transition-all duration-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-3 text-orange-600 hover:text-orange-800 transition-colors duration-200 hover:scale-105"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Custom Attributes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Custom Attributes
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="relative group">
                      <input
                        type="text"
                        value={currentAttribute.name}
                        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-orange-300"
                        placeholder="Attribute name"
                      />
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        value={currentAttribute.value}
                        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, value: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-orange-300"
                        placeholder="Attribute value"
                      />
                    </div>
                    <div className="relative group">
                      <select
                        value={currentAttribute.type}
                        onChange={(e) => setCurrentAttribute(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-orange-200/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-orange-300"
                      >
                        {attributeTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addAttribute}
                      className="px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
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
                          className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-xl border border-orange-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">{attr.name}</span>
                            <span className="text-gray-600">{attr.value}</span>
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
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

          {/* Refined Settings Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-indigo-500/10 transition-all duration-300">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                <CogIcon className="w-6 h-6 mr-3 text-indigo-600" />
                Product Settings
                <SparklesIcon className="w-5 h-5 ml-3 text-indigo-500 animate-pulse" />
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <input
                      {...register('isActive')}
                      type="checkbox"
                      id="isActive"
                      defaultChecked
                      className="w-5 h-5 text-indigo-600 bg-white/70 border-indigo-300 rounded focus:ring-indigo-500"
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
                      className="w-5 h-5 text-indigo-600 bg-white/70 border-indigo-300 rounded focus:ring-indigo-500"
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
                      className="w-5 h-5 text-indigo-600 bg-white/70 border-indigo-300 rounded focus:ring-indigo-500"
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
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-indigo-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-indigo-300"
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
                        className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-indigo-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-indigo-300"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refined Submit Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 pt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative flex-1 overflow-hidden bg-gradient-to-r from-purple-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/30 disabled:opacity-50"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-violet-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-3" />
                    Create Product
                    <SparklesIcon className="w-4 h-4 ml-3 animate-pulse" />
                  </>
                )}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => router.back()}
              className="group relative overflow-hidden bg-white/90 backdrop-blur-md border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-white/95 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="relative flex items-center justify-center">
                <XMarkIcon className="w-5 h-5 mr-3" />
                Cancel
              </span>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </AdminLayout>
  );
} 