'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  SparklesIcon,
  InformationCircleIcon,
  CogIcon,
  BoltIcon,
  CheckIcon,
  EyeSlashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

import AdminLayout from '@/shared/components/layouts/AdminLayout';
import IconUpload from '@/shared/components/IconUpload';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { categoriesApi, CreateCategoryDto, Category } from '@/core/infrastructure/api/categories.api';
import BucketImageSelector from '@/shared/components/BucketImageSelector';
import CloudIcon from '@heroicons/react/24/outline/CloudIcon';
import UploadModeSelector from '@/shared/components/UploadModeSelector';

type CategoryFormData = Omit<CreateCategoryDto, 'icon'> & {
  icon: File | null;
};

function AddCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadMode, setUploadMode] = useState<'computer' | 'bucket'>('computer');
  const [showSvgSelector, setShowSvgSelector] = useState(false);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  
  const parentId = searchParams.get('parentId') || '';

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Categories', href: '/admin/categories' },
    { label: 'Add New Category', href: '/admin/categories/add' },
  ];

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isActive: true,
      sortOrder: 0,
      icon: null,
      parentId: parentId,
    },
  });

  const watchIsActive = watch('isActive');

  useEffect(() => {
    // Fetch all categories to populate the parent dropdown
    const fetchParentCategories = async () => {
      try {
        const allCategories = await categoriesApi.getAllCategories();
        setParentCategories(allCategories);
      } catch {
        toast.error('Failed to load parent categories.');
      }
    };
    fetchParentCategories();
  }, []);

  // Set the parentId in the form when the component mounts
  useEffect(() => {
    setValue('parentId', parentId);
  }, [parentId, setValue]);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setValue('slug', slug);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    
    try {
      let iconUrlToUse: string | undefined = iconUrl || undefined;
      if (data.icon) {
        const uploadResponse = await categoriesApi.uploadCategoryIcon(data.icon);
        if (uploadResponse.success && uploadResponse.data?.url) {
          iconUrlToUse = uploadResponse.data.url;
        } else {
          throw new Error('Icon upload failed. Please check the console for details.');
        }
      }

      const categoryData: CreateCategoryDto = { ...data, icon: iconUrlToUse };

      const response = await categoriesApi.createCategory(categoryData);

      if (response.success) {
        toast.success('Category created successfully!');
        router.push('/admin/categories?refresh=true');
      } else {
        const errorMsg = response.error?.response?.data?.message || 'Failed to create category.';
        toast.error(errorMsg);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'An unexpected error occurred.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <AdminBreadcrumb items={breadcrumbItems} />
          
          <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-purple-600 mb-6 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Categories
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                Create New Category
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Fill in the details below to add a new category to your store.
              </p>
            </div>
            <SparklesIcon className="w-12 h-12 text-purple-300 animate-pulse" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-pink-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <InformationCircleIcon className="w-6 h-6 mr-3 text-pink-600" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Category Name *</label>
                    <input {...register('name', { required: 'Category name is required' })} onChange={handleNameChange} className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500" placeholder="e.g., Orchids" />
                    {errors.name && (<p className="text-red-500 text-sm mt-2">{errors.name.message}</p>)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Slug *</label>
                    <input {...register('slug', { required: 'Slug is required' })} className="w-full px-6 py-4 bg-gray-50/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="e.g., orchids" readOnly />
                    {errors.slug && (<p className="text-red-500 text-sm mt-2">{errors.slug.message}</p>)}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Parent Category</label>
                     <select {...register('parentId')} className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500">
                      <option value="">No Parent (Root Category)</option>
                      {parentCategories.map((parent) => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                    <textarea {...register('description')} rows={4} className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500" placeholder="A brief description for this category." />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                    <CogIcon className="w-6 h-6 mr-3 text-purple-600" /> Advanced Settings
                  </h2>
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg">
                    {showAdvanced ? 'Hide' : 'Show'}
                    <BoltIcon className="w-4 h-4 ml-2" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-purple-100">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Category Icon (SVG)</label>
                          <UploadModeSelector mode={uploadMode} onModeChange={setUploadMode} allowBucketSelection={true} />
                          <div className="flex flex-col items-center mb-4">
                            {iconUrl ? (
                              <div className="w-24 h-24 flex items-center justify-center bg-white border-2 border-purple-300 rounded-xl shadow-md mb-2 relative">
                                <Image src={iconUrl} alt="Category Icon" className="w-16 h-16 object-contain" width={64} height={64} />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100 transition"
                                  onClick={() => {
                                    setIconUrl(null);
                                    setValue('icon', null);
                                  }}
                                  aria-label="Remove icon"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="w-24 h-24 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 mb-2">
                                No icon selected
                              </div>
                            )}
                          </div>
                          {uploadMode === 'computer' && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group relative"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-blue-500/10 transition-all duration-300">
                                <Controller
                                  name="icon"
                                  control={control}
                                  render={({ field }) => (
                                    <IconUpload
                                      onIconChange={(file) => {
                                        field.onChange(file);
                                        if (!file) {
                                          setIconUrl(null);
                                        } else if (typeof file === 'string') {
                                          setIconUrl(file);
                                        } else if (file instanceof File) {
                                          setIconUrl(URL.createObjectURL(file));
                                        }
                                      }}
                                      existingIconUrl={typeof field.value === 'string' ? field.value : undefined}
                                      className="w-full"
                                    />
                                  )}
                                />
                              </div>
                            </motion.div>
                          )}
                          {uploadMode === 'bucket' && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group relative"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-blue-500/10 transition-all duration-300">
                                <div
                                  className="flex items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 hover:from-blue-100/80 hover:to-indigo-100/80 rounded-3xl cursor-pointer transition-all duration-300"
                                  onClick={() => setShowSvgSelector(true)}
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <motion.div
                                      animate={{ y: [-3, 3, -3], scale: 1 }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <CloudIcon className="w-12 h-12 mb-4 text-blue-500 group-hover:text-blue-600" />
                                    </motion.div>
                                    <p className="mb-2 text-sm text-gray-600">
                                      <span className="font-semibold">Click to browse</span> SVG library
                                    </p>
                                    <p className="text-xs text-gray-500">Select from existing SVG icons</p>
                                  </div>
                                </div>
                              </div>
                              {showSvgSelector && (
                                <BucketImageSelector
                                  onImagesSelect={(images) => {
                                    if (images.length > 0) {
                                      setIconUrl(images[0].url);
                                      setValue('icon', null);
                                    }
                                    setShowSvgSelector(false);
                                  }}
                                  onClose={() => setShowSvgSelector(false)}
                                  folder="essentials"
                                  maxImages={1}
                                  allowedTypes={['image/svg+xml']}
                                  title="Select Category Icon (SVG)"
                                  previewStyle="svg"
                                />
                              )}
                            </motion.div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Meta Title</label>
                          <input {...register('metaTitle')} className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="Title for SEO" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Sort Order</label>
                          <input {...register('sortOrder', { valueAsNumber: true })} type="number" min="0" className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="0" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Meta Description</label>
                          <textarea {...register('metaDescription')} rows={3} className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="Description for SEO" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                          <div className="flex items-center space-x-4">
                              <label className="flex items-center cursor-pointer">
                                <Controller name="isActive" control={control} render={({ field: { onChange, onBlur, name, ref } }) => (<input type="radio" name={name} ref={ref} onBlur={onBlur} className="sr-only" checked={watchIsActive === true} onChange={() => onChange(true)} />)} />
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-300 ${ watchIsActive ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold shadow-lg' : 'border-gray-200 hover:border-pink-300' }`}>
                                  <CheckIcon className="w-5 h-5 mr-2" /> Active
                                </motion.div>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                 <Controller name="isActive" control={control} render={({ field: { onChange, onBlur, name, ref } }) => (<input type="radio" name={name} ref={ref} onBlur={onBlur} className="sr-only" checked={watchIsActive === false} onChange={() => onChange(false)} />)} />
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-300 ${ !watchIsActive ? 'border-gray-500 bg-gray-100 text-gray-700 font-semibold shadow-lg' : 'border-gray-200 hover:border-gray-300' }`}>
                                  <EyeSlashIcon className="w-5 h-5 mr-2" /> Inactive
                                </motion.div>
                              </label>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-end pt-4">
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 text-white rounded-2xl font-medium hover:shadow-xl transition-all duration-300 disabled:opacity-50">
                <span className="relative flex items-center">
                  {loading ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Creating...</>
                  ) : (
                    <><PlusIcon className="w-5 h-5 mr-2" />Create Category</>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default function AddCategoryPageWrapper() {
  return (
    <Suspense>
      <AddCategoryPage />
    </Suspense>
  );
} 