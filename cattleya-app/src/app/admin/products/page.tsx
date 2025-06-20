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
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { Product } from '@/core/domain/entities/Product';
import Link from 'next/link';
import Image from 'next/image';
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
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete <span className="font-semibold">"{productName}"</span>? 
          This will permanently remove the product from your catalog.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const categories = ['All Categories', 'Cattleya', 'Phalaenopsis', 'Dendrobium', 'Oncidium', 'Vanda', 'Cymbidium'];
const statusOptions = ['All Status', 'active', 'draft', 'out_of_stock', 'archived'];

export default function AdminProductsPage() {
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

  const getStatusInfo = (product: Product) => {
    if (!product.isActive) {
      return { status: 'draft', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon };
    }
    if (product.stockQuantity === 0) {
      return { status: 'out of stock', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon };
    }
    if (product.stockQuantity < product.lowStockThreshold) {
      return { status: 'low stock', color: 'bg-orange-100 text-orange-800', icon: ExclamationTriangleIcon };
    }
    return { status: 'active', color: 'bg-green-100 text-green-800', icon: CheckIcon };
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

  // Calculate stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive && p.stockQuantity > 0).length,
    avgPrice: products.length > 0 ? 
      Math.round(products.reduce((sum, p) => sum + (p.salePrice || p.basePrice), 0) / products.length) : 0,
    lowStock: products.filter(p => p.stockQuantity < p.lowStockThreshold).length
  };

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-2">Manage your orchid inventory and catalog</p>
            </div>
            <Link
              href="/admin/products/add"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <ArchiveBoxIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">${stats.avgPrice}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSearch}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
              >
                Search
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <FunnelIcon className="w-5 h-5 mr-2 text-gray-500" />
                Filters
                <ChevronDownIcon className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
              <span className="text-gray-600">Loading products...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => {
                    const statusInfo = getStatusInfo(product);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 relative rounded-xl overflow-hidden mr-4 bg-gray-100">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.images[0].altText || product.name || 'Product'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                                  <PhotoIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-48">
                                {product.name || 'Unnamed Product'}
                              </div>
                              <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              ${product.salePrice || product.basePrice}
                            </span>
                            {product.salePrice && product.salePrice < product.basePrice && (
                              <div className="text-xs text-gray-500 line-through">
                                ${product.basePrice}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            product.stockQuantity < product.lowStockThreshold ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-900 ml-1">
                              {product.averageRating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({product.reviewCount || 0})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/products/${product.id}`}
                              target="_blank"
                              className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                              title="View Product"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-gray-400 hover:text-green-600 transition-colors duration-200"
                              title="Edit Product"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </Link>
                            <button 
                              onClick={() => setDeleteModal({ isOpen: true, product })}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                              title="Delete Product"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== 'All Categories' || selectedStatus !== 'All Status'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first product'
                  }
                </p>
                {!searchTerm && selectedCategory === 'All Categories' && selectedStatus === 'All Status' && (
                  <Link
                    href="/admin/products/add"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Product
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((pagination.currentPage - 1) * 20) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.currentPage * 20, pagination.totalProducts)}
              </span> of{' '}
              <span className="font-medium">{pagination.totalProducts}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      pageNum === pagination.currentPage
                        ? 'bg-purple-600 text-white'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, product: null })}
          onConfirm={handleDeleteProduct}
          productName={deleteModal.product?.name || ''}
          loading={deleteLoading}
        />
      </div>
    </AdminLayout>
  );
}