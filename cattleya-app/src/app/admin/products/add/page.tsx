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
  SwatchIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { OrchidSize } from '@/core/domain/entities/Product';

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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
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
        images: imagePreview.map((url, index) => ({
          id: (index + 1).toString(),
          productId: '', // Will be set by backend
          url,
          altText: data.name,
          isMain: index === 0,
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
      <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-2">Create a new orchid for your catalog</p>
            </div>
            <button
              onClick={() => router.back()}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2 text-purple-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Cattleya Purple Majesty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  {...register('sku')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., CATT-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <input
                  {...register('shortDescription')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description for product cards"
                  maxLength={100}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed product description"
                />
              </div>
            </div>
          </div>

          {/* Orchid Characteristics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <SwatchIcon className="w-5 h-5 mr-2 text-purple-600" />
              Orchid Characteristics
            </h2>

            <div className="space-y-6">
              {/* Color Pattern */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color Pattern *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {colorPatterns.map(pattern => (
                    <label key={pattern.value} className="cursor-pointer">
                      <input
                        type="radio"
                        {...register('colorPattern')}
                        value={pattern.value}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                        watchColorPattern === pattern.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="font-medium">{pattern.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{pattern.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Colors * (Select {watchColorPattern === 'solid' ? '1' : watchColorPattern === 'bicolor' ? '1-2' : '1-5'})
                </label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {commonColors.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => toggleColor(color.hex)}
                      className={`relative w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                        selectedColors.includes(color.hex)
                          ? 'border-purple-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColors.includes(color.hex) && (
                        <CheckIcon className="w-6 h-6 text-white absolute inset-0 m-auto drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedColors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedColors.map((colorHex, index) => {
                      const colorName = commonColors.find(c => c.hex === colorHex)?.name || colorHex;
                      return (
                        <span
                          key={colorHex}
                          className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2 border"
                            style={{ backgroundColor: colorHex }}
                          />
                          {colorName}
                          <button
                            type="button"
                            onClick={() => toggleColor(colorHex)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Default Size *
                </label>
                <select
                  {...register('defaultSize')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                >
                  {orchidSizes.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Sizes * (Select all sizes you offer)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {orchidSizes.map(size => (
                    <label key={size.value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availableSizes.includes(size.value)}
                        onChange={() => toggleSize(size.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                        availableSizes.includes(size.value)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{size.label}</div>
                            <div className="text-sm text-gray-500">{size.description}</div>
                          </div>
                          {availableSizes.includes(size.value) && (
                            <CheckIcon className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-purple-600" />
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('basePrice')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    {...register('isOnSale')}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">On Sale</span>
                </label>
                {watchIsOnSale && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('salePrice')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  {...register('stockQuantity')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold *
                </label>
                <input
                  type="number"
                  {...register('lowStockThreshold')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('weight')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PhotoIcon className="w-5 h-5 mr-2 text-purple-600" />
              Product Images
            </h2>

            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors duration-200">
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
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload Images</p>
                  <p className="text-gray-600">Drag and drop or click to select files</p>
                  <p className="text-sm text-gray-500 mt-2">Maximum 5 images, JPG or PNG</p>
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreview.map((preview: string, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TagIcon className="w-5 h-5 mr-2 text-purple-600" />
              Tags
            </h2>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add tag (e.g., purple, fragrant, beginner)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>

              {watchTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchTags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
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
              )}
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ArchiveBoxIcon className="w-5 h-5 mr-2 text-purple-600" />
              Product Attributes
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={currentAttribute.name}
                  onChange={(e) => setCurrentAttribute(prev => ({ ...prev, name: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Attribute name (e.g., Bloom Season)"
                />
                <input
                  type="text"
                  value={currentAttribute.value}
                  onChange={(e) => setCurrentAttribute(prev => ({ ...prev, value: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Attribute value (e.g., Spring/Fall)"
                />
                <select
                  value={currentAttribute.type}
                  onChange={(e) => setCurrentAttribute(prev => ({ ...prev, type: e.target.value }))}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {attributeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>

              {attributes.length > 0 && (
                <div className="space-y-2">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{attr.name}: </span>
                        <span className="text-gray-600">{attr.value}</span>
                        <span className="text-xs text-gray-500 ml-2">({attr.type})</span>
                      </div>
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
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Settings</h2>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isFeatured')}
                  className="mr-3 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="mr-3 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active (visible to customers)</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 