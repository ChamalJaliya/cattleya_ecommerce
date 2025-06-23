'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  InformationCircleIcon,
  CheckIcon,
  SparklesIcon,
  BoltIcon,
  CogIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import IconUpload from '@/shared/components/IconUpload';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: File | null;
  parentId?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    },
  });

  const watchIsActive = watch('isActive');
  
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
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'icon' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value !== 'object') {
          formData.append(key, String(value));
        }
      }
    });

    console.log('Submitting FormData...', Object.fromEntries(formData.entries()));

    try {
      // Replace with your actual API call
      // const response = await fetch('/api/categories', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to create category');
      // }
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call

      toast.success('Category created successfully!');
      router.push('/admin/categories');
    } catch (error) {
      toast.error('Failed to create category.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Categories', href: '/admin/categories' },
    { label: 'Add New Category', href: '/admin/categories/add' },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Dazzling Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
          <AdminBreadcrumb items={breadcrumbItems} />

          <div className="flex items-center justify-between my-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              Add New Category
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-pink-500/10 transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <InformationCircleIcon className="w-6 h-6 mr-3 text-pink-600" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Category Name *</label>
                    <input 
                      {...register('name', { required: 'Category name is required' })}
                      onChange={handleNameChange}
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300" 
                      placeholder="e.g., Orchids, Care Products" 
                    />
                    {errors.name && (<p className="text-red-500 text-sm mt-2">{errors.name.message}</p>)}
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Slug *</label>
                    <input 
                      {...register('slug', { required: 'Slug is required' })}
                      className="w-full px-6 py-4 bg-gray-50/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="e.g., orchids-care-products"
                      readOnly 
                    />
                     {errors.slug && (<p className="text-red-500 text-sm mt-2">{errors.slug.message}</p>)}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                    <textarea 
                      {...register('description')} 
                      rows={4} 
                      className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-pink-200/50 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300" 
                      placeholder="A brief description for this category." 
                    />
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
                  <motion.button 
                    type="button" 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  >
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
                          <Controller
                            name="icon"
                            control={control}
                            render={({ field }) => (
                              <IconUpload 
                                onIconChange={(file) => field.onChange(file)}
                                className="w-full"
                              />
                            )}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Meta Title</label>
                          <input {...register('metaTitle')} className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300" placeholder="Title for SEO" />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Sort Order</label>
                          <input {...register('sortOrder', { valueAsNumber: true })} type="number" min="0" className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300" placeholder="0" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Meta Description</label>
                          <textarea {...register('metaDescription')} rows={3} className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300" placeholder="Description for SEO" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                          <div className="flex items-center space-x-4">
                              <label className="flex items-center cursor-pointer">
                                <Controller
                                  name="isActive"
                                  control={control}
                                  render={({ field }) => (
                                    <input type="radio" 
                                      name={field.name}
                                      onBlur={field.onBlur}
                                      ref={field.ref}
                                      className="sr-only"
                                      checked={field.value === true} 
                                      onChange={() => field.onChange(true)} 
                                    />
                                  )}
                                />
                                <motion.div 
                                  whileHover={{ scale: 1.05 }} 
                                  whileTap={{ scale: 0.95 }} 
                                  className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-300 ${ watchIsActive ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold shadow-lg' : 'border-gray-200 hover:border-pink-300 bg-white/80' }`}
                                >
                                  <CheckIcon className="w-5 h-5 mr-2" /> Active
                                </motion.div>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                 <Controller
                                  name="isActive"
                                  control={control}
                                  render={({ field }) => (
                                    <input type="radio" 
                                      name={field.name}
                                      onBlur={field.onBlur}
                                      ref={field.ref}
                                      className="sr-only"
                                      checked={field.value === false} 
                                      onChange={() => field.onChange(false)} 
                                    />
                                  )}
                                />
                                <motion.div 
                                  whileHover={{ scale: 1.05 }} 
                                  whileTap={{ scale: 0.95 }} 
                                  className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-300 ${ !watchIsActive ? 'border-gray-500 bg-gray-100 text-gray-700 font-semibold shadow-lg' : 'border-gray-200 hover:border-gray-300 bg-white/80' }`}
                                >
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
              <motion.button 
                type="submit" 
                disabled={loading} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
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
                      Create Category
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