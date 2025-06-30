'use client';

import { useState, useEffect } from 'react';
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
  ChevronLeftIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  CubeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AdvancedImageUpload from '@/shared/components/AdvancedImageUpload';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';

// Types for dynamic attribute system with variants
interface Attribute {
  id: string;
  name: string;
  code: string;
  type: string;
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isVariantAttribute: boolean; // New: determines if this is variant-specific
  options?: string[];
  minValue?: number;
  maxValue?: number;
  unit?: string;
  maxLength?: number;
  pattern?: string;
  allowCustom?: boolean;
}

interface AttributeSet {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  attributes: Attribute[];
}

interface AttributeValue {
  code: string;
  name: string;
  value: string;
  type: string;
  isVariantAttribute: boolean;
}

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isDefault: boolean;
  attributeValues: AttributeValue[];
  images: any[];
}

export default function AddProductPage() {
  const router = useRouter();
  const [commonImages, setCommonImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Dynamic attribute system state
  const [attributeSets, setAttributeSets] = useState<AttributeSet[]>([]);
  const [selectedAttributeSet, setSelectedAttributeSet] = useState<AttributeSet | null>(null);
  const [commonAttributeValues, setCommonAttributeValues] = useState<AttributeValue[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingAttributeSets, setLoadingAttributeSets] = useState(true);
  const [formStep, setFormStep] = useState<'select-set' | 'common-attributes' | 'variants' | 'review'>('select-set');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();

  // Fetch attribute sets on component mount
  useEffect(() => {
    fetchAttributeSets();
  }, []);

  // Initialize common attributes when attribute set is selected
  useEffect(() => {
    if (selectedAttributeSet) {
      const commonAttributes = selectedAttributeSet.attributes.filter(attr => !attr.isVariantAttribute);
      const initialValues = commonAttributes.map(attr => ({
        code: attr.code,
        name: attr.name,
        value: '',
        type: attr.type,
        isVariantAttribute: false
      }));
      setCommonAttributeValues(initialValues);
      setFormStep('common-attributes');
    }
  }, [selectedAttributeSet]);

  const fetchAttributeSets = async () => {
    try {
      setLoadingAttributeSets(true);
      const response = await fetch('/api/attribute-sets');
      if (response.ok) {
        const data = await response.json();
        const attributeSetsArray = data.data || [];
        setAttributeSets(attributeSetsArray);
      } else {
        console.error('Failed to fetch attribute sets:', response.status);
        toast.error('Failed to fetch attribute sets');
        setAttributeSets([]);
      }
    } catch (error) {
      console.error('Error fetching attribute sets:', error);
      toast.error('Failed to fetch attribute sets');
      setAttributeSets([]);
    } finally {
      setLoadingAttributeSets(false);
    }
  };

  const handleAttributeSetSelect = (attributeSet: AttributeSet) => {
    setSelectedAttributeSet(attributeSet);
  };

  const updateCommonAttributeValue = (code: string, value: string) => {
    setCommonAttributeValues(prev => 
      prev.map(attr => 
        attr.code === code ? { ...attr, value } : attr
      )
    );
  };

  const generateVariants = () => {
    if (!selectedAttributeSet) return;

    const variantAttributes = selectedAttributeSet.attributes.filter(attr => attr.isVariantAttribute);
    
    if (variantAttributes.length === 0) {
      // No variant attributes, create single default variant
      const defaultVariant: Variant = {
        id: '1',
        name: 'Default Variant',
        sku: generateSKU(),
        price: 0,
        stock: 0,
        isDefault: true,
        attributeValues: [],
        images: []
      };
      setVariants([defaultVariant]);
      setFormStep('variants');
      return;
    }

    // Generate all possible combinations of variant attributes
    const combinations = generateAttributeCombinations(variantAttributes);
    const generatedVariants: Variant[] = combinations.map((combination, index) => {
      const variantName = combination.map(attr => attr.value).join(' - ');
      return {
        id: (index + 1).toString(),
        name: variantName,
        sku: generateSKU(),
        price: 0,
        stock: 0,
        isDefault: index === 0, // First variant is default
        attributeValues: combination,
        images: []
      };
    });

    setVariants(generatedVariants);
    setFormStep('variants');
  };

  const generateAttributeCombinations = (attributes: Attribute[]): AttributeValue[][] => {
    const combinations: AttributeValue[][] = [];
    
    const generateCombos = (currentCombo: AttributeValue[], attrIndex: number) => {
      if (attrIndex === attributes.length) {
        combinations.push([...currentCombo]);
        return;
      }

      const attribute = attributes[attrIndex];
      if (attribute.options && attribute.options.length > 0) {
        attribute.options.forEach(option => {
          generateCombos([
            ...currentCombo,
            {
              code: attribute.code,
              name: attribute.name,
              value: option,
              type: attribute.type,
              isVariantAttribute: true
            }
          ], attrIndex + 1);
        });
      } else {
        // For attributes without predefined options, add empty value
        generateCombos([
          ...currentCombo,
          {
            code: attribute.code,
            name: attribute.name,
            value: '',
            type: attribute.type,
            isVariantAttribute: true
          }
        ], attrIndex + 1);
      }
    };

    generateCombos([], 0);
    return combinations;
  };

  const generateSKU = () => {
    return 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const updateVariant = (variantId: string, updates: Partial<Variant>) => {
    setVariants(prev => 
      prev.map(variant => 
        variant.id === variantId ? { ...variant, ...updates } : variant
      )
    );
  };

  const setDefaultVariant = (variantId: string) => {
    setVariants(prev => 
      prev.map(variant => ({
        ...variant,
        isDefault: variant.id === variantId
      }))
    );
  };

  const renderDynamicAttributeField = (attribute: Attribute, value: string, onChange: (value: string) => void) => {
    const baseClasses = "w-full px-6 py-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-500 text-gray-900 hover:bg-gradient-to-r hover:from-white/90 hover:to-white/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transform hover:scale-[1.02]";

    switch (attribute.type) {
      case 'TEXT':
        return (
          <div className="group relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={baseClasses}
              placeholder={`Enter ${attribute.name.toLowerCase()}`}
              maxLength={attribute.maxLength}
              pattern={attribute.pattern}
              required={attribute.isRequired}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
          </div>
        );

      case 'NUMBER':
        return (
          <div className="group relative">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={baseClasses}
              placeholder={`Enter ${attribute.name.toLowerCase()}`}
              min={attribute.minValue}
              max={attribute.maxValue}
              step="0.01"
              required={attribute.isRequired}
            />
            {attribute.unit && (
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                {attribute.unit}
              </span>
            )}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-violet-500/0 group-hover:from-purple-500/5 group-hover:to-violet-500/5 transition-all duration-500 pointer-events-none"></div>
          </div>
        );

      case 'SELECT':
        return (
          <div className="group relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={baseClasses}
              required={attribute.isRequired}
            >
              <option value="">Select {attribute.name}</option>
              {attribute.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 to-pink-500/0 group-hover:from-violet-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
          </div>
        );

      case 'MULTISELECT':
        return (
          <div className="space-y-3 p-4 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md border-2 border-purple-200/50 rounded-2xl hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-500">
            {attribute.options?.map((option) => {
              const isSelected = value.includes(option);
              return (
                <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const values = value ? value.split(',').filter(v => v.trim()) : [];
                        if (e.target.checked) {
                          values.push(option);
                        } else {
                          const index = values.indexOf(option);
                          if (index > -1) values.splice(index, 1);
                        }
                        onChange(values.join(', '));
                      }}
                      className="w-5 h-5 text-purple-600 bg-white/70 border-purple-300 rounded focus:ring-purple-500 group-hover:border-purple-400 transition-all duration-300"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-purple-700 transition-colors font-medium">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case 'RADIO':
        return (
          <div className="space-y-3 p-4 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md border-2 border-violet-200/50 rounded-2xl hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-500">
            {attribute.options?.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name={attribute.code}
                    value={option}
                    checked={value === option}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-5 h-5 text-violet-600 bg-white/70 border-violet-300 focus:ring-violet-500 group-hover:border-violet-400 transition-all duration-300"
                    required={attribute.isRequired}
                  />
                  {value === option && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="text-gray-700 group-hover:text-violet-700 transition-colors font-medium">
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'BOOLEAN':
        return (
          <div className="group relative">
            <label className="flex items-center space-x-4 cursor-pointer p-4 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-500">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value === 'true'}
                  onChange={(e) => onChange(e.target.checked.toString())}
                  className="w-6 h-6 text-pink-600 bg-white/70 border-pink-300 rounded-lg focus:ring-pink-500 group-hover:border-pink-400 transition-all duration-300"
                />
                {value === 'true' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <span className="text-gray-700 group-hover:text-pink-700 transition-colors font-semibold text-lg">
                {attribute.name}
              </span>
            </label>
          </div>
        );

      case 'COLOR':
        return (
          <div className="space-y-4 p-4 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-500">
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={value || '#8B5CF6'}
                onChange={(e) => onChange(e.target.value)}
                className="w-16 h-16 rounded-xl border-2 border-pink-200 cursor-pointer hover:border-pink-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-600 font-medium">Selected Color</span>
                <div className="text-lg font-bold text-gray-900">{value || '#8B5CF6'}</div>
              </div>
            </div>
            {attribute.allowCustom && (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-gray-900 hover:bg-white/80 hover:border-pink-300"
                placeholder="Or enter custom color name"
              />
            )}
          </div>
        );

      default:
        return (
          <div className="group relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={baseClasses}
              placeholder={`Enter ${attribute.name.toLowerCase()}`}
              required={attribute.isRequired}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
          </div>
        );
    }
  };

  const handleCommonImagesChange = (images: any[]) => {
    setCommonImages(images);
  };

  const handleVariantImagesChange = (variantId: string, images: any[]) => {
    updateVariant(variantId, { images });
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Prepare product data with variants
      const productData = {
        ...data,
        attributeSetId: selectedAttributeSet?.id,
        commonAttributeValues,
        variants: variants.map(variant => ({
          ...variant,
          attributeValues: variant.attributeValues
        })),
        images: commonImages
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success('Product created successfully!');
        router.push('/admin/products');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-violet-50">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-violet-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10">
          <AdminBreadcrumb items={breadcrumbItems} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 bg-clip-text text-transparent mb-4">
                Create Amazing Product
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose a product template and customize it with stunning attributes to create something extraordinary
              </p>
            </motion.div>

            {/* Step indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[
                  { step: 'select-set', label: 'Template', icon: SparklesIcon },
                  { step: 'common-attributes', label: 'Common', icon: TagIcon },
                  { step: 'variants', label: 'Variants', icon: CubeIcon },
                  { step: 'review', label: 'Review', icon: CheckIcon }
                ].map((stepInfo, index) => {
                  const isActive = formStep === stepInfo.step;
                  const isCompleted = ['common-attributes', 'variants', 'review'].includes(formStep) && index < ['common-attributes', 'variants', 'review'].indexOf(formStep);
                  
                  return (
                    <div key={stepInfo.step} className="flex items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-500 text-white shadow-lg' 
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white/60 border-gray-300 text-gray-400'
                      }`}>
                        <stepInfo.icon className="w-6 h-6" />
                      </div>
                      {index < 3 && (
                        <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {formStep === 'select-set' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Product Template</h2>
                  <p className="text-gray-600">Select a template that matches your product type for the best experience</p>
                </div>

                {loadingAttributeSets ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="ml-6">
                      <div className="text-lg font-semibold text-gray-700 mb-2">Loading Product Types</div>
                      <div className="text-sm text-gray-500">Discovering amazing product templates...</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.isArray(attributeSets) && attributeSets.map((set, index) => (
                      <motion.div
                        key={set.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ 
                          scale: 1.05, 
                          y: -5,
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAttributeSetSelect(set)}
                        className="group cursor-pointer relative overflow-hidden"
                      >
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-violet-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        
                        {/* Card content */}
                        <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl border border-white/30 rounded-3xl p-8 hover:border-pink-300/50 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500">
                          
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent group-hover:from-pink-700 group-hover:to-purple-700 transition-all duration-300">
                              {set.name}
                            </h3>
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <SparklesIcon className="w-6 h-6 text-white" />
                              </div>
                              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                            </div>
                          </div>

                          {/* Description */}
                          {set.description && (
                            <p className="text-gray-600 text-sm mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                              {set.description}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-gray-500">
                                {set.attributes?.length || 0} attributes
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              {set.attributes?.slice(0, 4).map((attr, attrIndex) => (
                                <div
                                  key={attr.id}
                                  className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 animate-pulse"
                                  style={{ 
                                    animationDelay: `${attrIndex * 0.1}s`,
                                    animationDuration: '2s'
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Action indicator */}
                          <div className="flex items-center justify-center">
                            <div className="px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full border border-pink-200/50 group-hover:border-pink-300/50 transition-all duration-300">
                              <span className="text-sm font-medium text-pink-600 group-hover:text-pink-700 transition-colors">
                                Select Template
                              </span>
                            </div>
                          </div>

                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-violet-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-violet-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : formStep === 'common-attributes' ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Selected template header */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setFormStep('select-set');
                          setSelectedAttributeSet(null);
                          setCommonAttributeValues([]);
                          setVariants([]);
                        }}
                        className="p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-200/50 hover:border-pink-300/50 hover:shadow-lg transition-all duration-300 group"
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          {selectedAttributeSet?.name}
                        </h2>
                        <p className="text-gray-600">Set common product attributes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-200/50">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Template Selected</span>
                    </div>
                  </div>
                </div>

                {/* Common attributes form */}
                <form onSubmit={(e) => { e.preventDefault(); generateVariants(); }} className="space-y-8">
                  {/* Basic product information */}
                  <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <TagIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <span>Product Name</span>
                          <span className="text-pink-500">*</span>
                        </label>
                        <input
                          {...register('name', { required: 'Product name is required' })}
                          className="w-full px-6 py-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-500 text-gray-900 hover:bg-gradient-to-r hover:from-white/90 hover:to-white/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transform hover:scale-[1.02]"
                          placeholder="Enter product name"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message as string}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <span>Brand</span>
                        </label>
                        <input
                          {...register('brand')}
                          className="w-full px-6 py-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-500 text-gray-900 hover:bg-gradient-to-r hover:from-white/90 hover:to-white/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transform hover:scale-[1.02]"
                          placeholder="Enter brand name"
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Description</label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        className="w-full px-6 py-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-500 text-gray-900 hover:bg-gradient-to-r hover:from-white/90 hover:to-white/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 resize-none"
                        placeholder="Describe your product..."
                      />
                    </div>
                  </div>

                  {/* Common attributes */}
                  {selectedAttributeSet && commonAttributeValues.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                          <CogIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Common Attributes</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {commonAttributeValues.map((attrValue, index) => {
                          const attribute = selectedAttributeSet.attributes.find(attr => attr.code === attrValue.code);
                          if (!attribute) return null;
                          
                          return (
                            <motion.div
                              key={attrValue.code}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              className="space-y-2"
                            >
                              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                <span>{attribute.name}</span>
                                {attribute.isRequired && <span className="text-pink-500">*</span>}
                                {attribute.isSearchable && (
                                  <MagnifyingGlassIcon className="w-4 h-4 text-purple-500" title="Searchable" />
                                )}
                                {attribute.isFilterable && (
                                  <ListBulletIcon className="w-4 h-4 text-violet-500" title="Filterable" />
                                )}
                              </label>
                              {renderDynamicAttributeField(attribute, attrValue.value, (value) => updateCommonAttributeValue(attrValue.code, value))}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Common images */}
                  <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <PhotoIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Common Product Images</h3>
                    </div>
                    
                    <AdvancedImageUpload
                      onChange={handleCommonImagesChange}
                      maxImages={10}
                      className="w-full"
                    />
                  </div>

                  {/* Next button */}
                  <div className="flex justify-center">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center space-x-2">
                        <CubeIcon className="w-5 h-5" />
                        <span>Generate Variants</span>
                      </div>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : formStep === 'variants' ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Variants header */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setFormStep('common-attributes')}
                        className="p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-200/50 hover:border-pink-300/50 hover:shadow-lg transition-all duration-300 group"
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          Product Variants
                        </h2>
                        <p className="text-gray-600">Configure {variants.length} variant(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-200/50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-700">{variants.length} Variants</span>
                    </div>
                  </div>
                </div>

                {/* Variants list */}
                <div className="space-y-6">
                  {variants.map((variant, index) => (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                            variant.isDefault 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-pink-500 to-purple-500'
                          }`}>
                            {variant.isDefault ? (
                              <StarIcon className="w-6 h-6 text-white" />
                            ) : (
                              <CubeIcon className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{variant.name}</h3>
                            <p className="text-gray-600">SKU: {variant.sku}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {!variant.isDefault && (
                            <button
                              onClick={() => setDefaultVariant(variant.id)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200/50 hover:border-green-300/50 hover:shadow-lg transition-all duration-300"
                            >
                              <span className="text-sm font-medium text-green-700">Set as Default</span>
                            </button>
                          )}
                          {variant.isDefault && (
                            <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200/50">
                              <span className="text-sm font-medium text-green-700">Default Variant</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Price */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Price</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => updateVariant(variant.id, { price: parseFloat(e.target.value) || 0 })}
                              className="w-full px-6 py-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-500 text-gray-900 hover:bg-gradient-to-r hover:from-white/90 hover:to-white/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transform hover:scale-[1.02]"
                              placeholder="0.00"
                              step="0.01"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })}
                            className="w-full px-6 py-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-500 text-gray-900 hover:bg-gradient-to-r hover:from-white/90 hover:to-white/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transform hover:scale-[1.02]"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        {/* SKU */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">SKU</label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => updateVariant(variant.id, { sku: e.target.value })}
                            className="w-full px-6 py-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-md border-2 border-pink-200/50 rounded-2xl focus:ring-4 focus:ring-pink-500/30 focus:border-pink-500 transition-all duration-500 text-gray-900 hover:bg-gradient-to-r hover:from-white/90 hover:to-white/70 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transform hover:scale-[1.02]"
                            placeholder="SKU-123456789"
                          />
                        </div>
                      </div>

                      {/* Variant-specific images */}
                      <div className="mt-6">
                        <label className="text-sm font-semibold text-gray-700 mb-4 block">Variant Images</label>
                        <AdvancedImageUpload
                          onChange={(images) => handleVariantImagesChange(variant.id, images)}
                          maxImages={5}
                          className="w-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Submit button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={() => setFormStep('review')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      <CheckIcon className="w-5 h-5" />
                      <span>Review & Create Product</span>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Review header */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setFormStep('variants')}
                        className="p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-200/50 hover:border-pink-300/50 hover:shadow-lg transition-all duration-300 group"
                      >
                        <ChevronLeftIcon className="w-5 h-5 text-pink-600 group-hover:text-pink-700 transition-colors" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                          Review Product
                        </h2>
                        <p className="text-gray-600">Final review before creating your product</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full border border-orange-200/50">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-orange-700">Ready to Create</span>
                    </div>
                  </div>
                </div>

                {/* Review content */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-pink-500/10 p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product summary */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Product Summary</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Template:</span>
                          <p className="text-gray-900 font-semibold">{selectedAttributeSet?.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Variants:</span>
                          <p className="text-gray-900 font-semibold">{variants.length} variant(s)</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Default Variant:</span>
                          <p className="text-gray-900 font-semibold">{variants.find(v => v.isDefault)?.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Variants summary */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Variants Summary</h3>
                      <div className="space-y-2">
                        {variants.map((variant) => (
                          <div key={variant.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900">{variant.name}</p>
                              <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${variant.price}</p>
                              <p className="text-sm text-gray-500">Stock: {variant.stock}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Creating Product...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5" />
                          <span>Create Amazing Product</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 