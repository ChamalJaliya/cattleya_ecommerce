'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  StarIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ClockIcon,
  EyeSlashIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  ShoppingBagIcon,
  CubeIcon,
  BeakerIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { Product } from '@/core/domain/entities/Product';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  loading: boolean;
}

const DeleteModal = ({ isOpen, onClose, onConfirm, productName, loading }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">"{productName}"</span>? 
            This will permanently remove the product from your catalog.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center font-medium"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const categories = ['All Categories', 'Cattleya', 'Phalaenopsis', 'Dendrobium', 'Oncidium', 'Vanda', 'Cymbidium'];
const statusOptions = ['All Status', 'active', 'draft', 'out_of_stock', 'archived'];

export default function AdminProductsPage() {
  const router = useRouter();
  const { 
    products, 
    loading, 
    error, 
    pagination,
    fetchProducts,
    deleteProduct: removeProduct
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setMounted(true);
    // Load products when component mounts
    loadProducts();
  }, []);

  const loadProducts = async (page = 1) => {
    await fetchProducts({
      page,
      limit: 20,
      search: searchTerm || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Categories' || 
      product.category?.name === selectedCategory;
    
    const matchesStatus = selectedStatus === 'All Status' || 
      (selectedStatus === 'active' && product.isActive) ||
      (selectedStatus === 'draft' && !product.isActive) ||
      (selectedStatus === 'out_of_stock' && product.stockQuantity === 0);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const getStatusInfo = (product: Product) => {
    if (!product.isActive) {
      return { status: 'draft', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon };
    }
    if (product.stockQuantity === 0) {
      return { status: 'out of stock', color: 'bg-red-100 text-red-800 border-red-200', icon: ExclamationTriangleIcon };
    }
    if (product.stockQuantity < product.lowStockThreshold) {
      return { status: 'low stock', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: ExclamationTriangleIcon };
    }
    return { status: 'active', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckIcon };
  };

  const handleDeleteProduct = async () => {
    if (!deleteModal.product) return;
    
    setDeleteLoading(true);
    try {
      await removeProduct(deleteModal.product.id);
      toast.success('Product deleted successfully');
      setDeleteModal({ isOpen: false, product: null });
      // Reload products
      await loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadProducts(1);
  };

  const handlePageChange = async (page: number) => {
    await loadProducts(page);
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/admin/products/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/products/${productId}/edit`);
  };

  // Calculate stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive && p.stockQuantity > 0).length,
    avgPrice: products.length > 0 ? 
      Math.round(products.reduce((sum, p) => sum + (p.salePrice || p.basePrice), 0) / products.length) : 0,
    lowStock: products.filter(p => p.stockQuantity < p.lowStockThreshold).length
  };

  const statsData = [
    {
      name: 'Total Products',
      value: stats.total.toString(),
      change: '+8.2%',
      changeType: 'increase' as const,
      icon: CubeIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      iconBg: 'from-blue-400 to-cyan-600',
      glowColor: 'shadow-blue-500/30',
      description: 'Products in catalog'
    },
    {
      name: 'Active Products',
      value: stats.active.toString(),
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: CheckIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      iconBg: 'from-emerald-400 to-green-600',
      glowColor: 'shadow-emerald-500/30',
      description: 'Ready for sale'
    },
    {
      name: 'Average Price',
      value: `$${stats.avgPrice}`,
      change: '+5.1%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      iconBg: 'from-yellow-400 to-orange-600',
      glowColor: 'shadow-yellow-500/30',
      description: 'Price per product'
    },
    {
      name: 'Low Stock',
      value: stats.lowStock.toString(),
      change: '-2.3%',
      changeType: 'decrease' as const,
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 via-pink-500 to-rose-500',
      iconBg: 'from-red-400 to-pink-600',
      glowColor: 'shadow-red-500/30',
      description: 'Need restocking'
    }
  ];

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl -z-10"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                  Products Management
                </h1>
                <p className="text-gray-600 text-lg">Manage your orchid inventory and catalog with precision</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Product Dashboard
                  </span>
                </div>
                <Link
                  href="/admin/products/add"
                  className="group relative overflow-hidden"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Add Product
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                        <div className="ml-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center px-2 py-1 rounded-full ${
                          stat.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <StarIcon className={`w-3 h-3 mr-1 ${
                            stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`} />
                          <span className={`text-xs font-bold ${
                            stat.changeType === 'increase' ? 'text-green-700' : 'text-red-700'
                          }`}>{stat.change}</span>
                        </div>
                        <span className="text-xs text-gray-500">vs last month</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-r ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${stat.glowColor} group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products, SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'cards'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4 mr-1" />
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'table'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <TableCellsIcon className="w-4 h-4 mr-1" />
                      Table
                    </button>
                  </div>

                  <button
                    onClick={handleSearch}
                    className="group/btn relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105 font-medium">
                      Search
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="group/btn relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105">
                      <FunnelIcon className="w-5 h-5 mr-2" />
                      Filters
                      <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Enhanced Filter Options */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mr-3"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border-2 border-purple-400 opacity-20"></div>
                  </div>
                  <span className="text-gray-600 font-medium">Loading products...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative mb-8"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-900">Error loading products</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Products Display */}
          {!loading && !error && (
            <div className="min-h-[600px]">
              {viewMode === 'cards' ? (
                /* Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 min-h-[600px]">
                {paginatedProducts.map((product, index) => {
                  const statusInfo = getStatusInfo(product);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="group relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105 h-[480px] flex flex-col">
                        {/* Product Image */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <PhotoIcon className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${statusInfo.color}`}>
                              <statusInfo.icon className="w-3 h-3 mr-1" />
                              {statusInfo.status}
                            </span>
                          </div>
                          {product.salePrice && product.salePrice !== product.basePrice && (
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                                <FireIcon className="w-3 h-3 mr-1" />
                                Sale
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="mb-3">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-700 transition-colors duration-200 min-h-[3.5rem]">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">SKU: {product.sku}</p>
                          </div>

                          <div className="flex items-center justify-between mb-4 h-[2.5rem]">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                ${product.salePrice || product.basePrice}
                              </span>
                              {product.salePrice && product.salePrice !== product.basePrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.basePrice}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                              Stock: {product.stockQuantity}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4 h-[2rem]">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                ({product.totalReviews || 0})
                              </span>
                            </div>
                            <div className="h-[1.5rem] flex items-center">
                              {product.category && (
                                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium">
                                  {product.category.name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 mt-auto">
                            <button 
                              onClick={() => handleViewProduct(product.id)}
                              className="group/action relative overflow-hidden flex-1"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                              <div className="relative flex items-center justify-center py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-105">
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View
                              </div>
                            </button>
                            
                            <button 
                              onClick={() => handleEditProduct(product.id)}
                              className="group/action relative overflow-hidden flex-1"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                              <div className="relative flex items-center justify-center py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-105">
                                <PencilIcon className="w-4 h-4 mr-1" />
                                Edit
                              </div>
                            </button>

                            <button 
                              onClick={() => setDeleteModal({ isOpen: true, product })}
                              className="group/action relative overflow-hidden"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                              <div className="relative p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                <TrashIcon className="w-4 h-4" />
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group relative mb-8"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto hide-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">SKU</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                        {paginatedProducts.map((product, index) => {
                          const statusInfo = getStatusInfo(product);
                          return (
                            <motion.tr
                              key={product.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + index * 0.05 }}
                              className="hover:bg-purple-50/50 transition-colors duration-200 group/row"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                      <Image
                                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                                        alt={product.name}
                                        width={48}
                                        height={48}
                                        className="object-cover w-full h-full group-hover/row:scale-110 transition-transform duration-200"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Created: {new Date(product.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                  {product.sku}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {product.category ? (
                                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium">
                                    {product.category.name}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">No category</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    ${product.salePrice || product.basePrice}
                                  </span>
                                  {product.salePrice && product.salePrice !== product.basePrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${product.basePrice}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {product.stockQuantity}
                                  </span>
                                  {product.stockQuantity < product.lowStockThreshold && (
                                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusInfo.color}`}>
                                  <statusInfo.icon className="w-3 h-3 mr-1" />
                                  {statusInfo.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleViewProduct(product.id)}
                                    className="group/action relative overflow-hidden"
                                  >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                                    <div className="relative p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                      <EyeIcon className="w-4 h-4" />
                                    </div>
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleEditProduct(product.id)}
                                    className="group/action relative overflow-hidden"
                                  >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                                    <div className="relative p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                      <PencilIcon className="w-4 h-4" />
                                    </div>
                                  </button>

                                  <button 
                                    onClick={() => setDeleteModal({ isOpen: true, product })}
                                    className="group/action relative overflow-hidden"
                                  >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-20 group-hover/action:opacity-40 transition duration-300"></div>
                                    <div className="relative p-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                      <TrashIcon className="w-4 h-4" />
                                    </div>
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && filteredProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-between mt-8"
            >
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Showing</span>
                <span className="font-medium text-gray-900">
                  {Math.min(startIndex + 1, filteredProducts.length)}
                </span>
                <span>to</span>
                <span className="font-medium text-gray-900">
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                </span>
                <span>of</span>
                <span className="font-medium text-gray-900">{filteredProducts.length}</span>
                <span>products</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 group-hover:scale-105 disabled:hover:scale-100">
                    Previous
                  </div>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`group relative overflow-hidden w-10 h-10 rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105'
                      }`}
                    >
                      <span className="relative z-10">{page}</span>
                      {currentPage === page && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20"></div>
                      )}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 group-hover:scale-105 disabled:hover:scale-100">
                    Next
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Enhanced Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <Link
                  href="/admin/products/add"
                  className="group/btn relative overflow-hidden inline-block"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center group-hover/btn:scale-105">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Your First Product
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <DeleteModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, product: null })}
            onConfirm={handleDeleteProduct}
            productName={deleteModal.product?.name || ''}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}