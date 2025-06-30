'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  CogIcon,
  WrenchScrewdriverIcon,
  SwatchIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  XCircleIcon,
  LightBulbIcon,
  ChartBarIcon,
  HeartIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CommandLineIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import AdminBreadcrumb from '@/shared/components/AdminBreadcrumb';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import AttributeCard from './AttributeCard';

interface Attribute {
  id: string;
  name: string;
  code: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'COLOR' | 'SIZE' | 'SELECT' | 'MULTISELECT';
  description?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  isVisible: boolean;
  isVariantDefining: boolean;
  isVariantOverridable: boolean;
  defaultValue?: string;
  options?: Array<{ value: string; label: string; isDefault: boolean }>;
  validationRules?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SearchSuggestion {
  type: 'name' | 'code' | 'type' | 'description';
  value: string;
  label: string;
}

function AttributesContent() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    isRequired: false,
    isFilterable: false,
    isSearchable: false,
    isComparable: false,
    isVisible: false,
    isVariantDefining: false,
    isVariantOverridable: false,
    hasOptions: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'createdAt' | 'sortOrder'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAllOptionsIndex, setShowAllOptionsIndex] = useState<number | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const [paginatedAttributes, setPaginatedAttributes] = useState<Attribute[]>([]);
  const totalPages = Math.ceil(total / pageSize);

  // Search suggestions
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    if (!searchQuery.trim()) return [];
    
    const suggestions: SearchSuggestion[] = [];
    const query = searchQuery.toLowerCase();
    
    // Name suggestions
    attributes.forEach(attr => {
      if (attr.name.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'name',
          value: attr.name,
          label: `Name: ${attr.name}`
        });
      }
    });
    
    // Code suggestions
    attributes.forEach(attr => {
      if (attr.code.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'code',
          value: attr.code,
          label: `Code: ${attr.code}`
        });
      }
    });
    
    // Type suggestions
    const types = ['TEXT', 'NUMBER', 'BOOLEAN', 'COLOR', 'SIZE', 'SELECT', 'MULTISELECT'];
    types.forEach(type => {
      if (type.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'type',
          value: type,
          label: `Type: ${type}`
        });
      }
    });
    
    // Description suggestions
    attributes.forEach(attr => {
      if (attr.description && attr.description.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'description',
          value: attr.description,
          label: `Description: ${attr.description.substring(0, 50)}...`
        });
      }
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [searchQuery, attributes]);

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setSearchQuery(query);
          setPage(1); // Reset to first page when searching
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    fetchAttributes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, filterType, advancedFilters, sortBy, sortOrder]);

  const fetchAttributes = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/attributes', {
        params: { 
          page: pageNum, 
          limit: pageSize, 
          search: searchQuery, 
          filterType,
          ...advancedFilters,
          sortBy,
          sortOrder
        },
      });
      let attrs = Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
      setPaginatedAttributes(attrs);
      setTotal(res.data?.data?.total || 0);
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      toast.error('Failed to fetch attributes');
      setPaginatedAttributes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
    setShowSearchSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value);
    setShowSearchSuggestions(false);
    addToSearchHistory(suggestion.value);
  };

  const addToSearchHistory = (query: string) => {
    if (query.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== query);
        return [query, ...filtered].slice(0, 5); // Keep last 5 searches
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      isRequired: false,
      isFilterable: false,
      isSearchable: false,
      isComparable: false,
      isVisible: false,
      isVariantDefining: false,
      isVariantOverridable: false,
      hasOptions: false
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(advancedFilters).filter(Boolean).length;
  };

  const handleDelete = async (attributeId: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return;
    try {
      await axios.delete(`/api/attributes/${attributeId}`);
      toast.success('Attribute deleted successfully!');
      await fetchAttributes();
    } catch (error) {
      console.error('Failed to delete attribute:', error);
      toast.error('Failed to delete attribute');
    }
  };

  const handleEdit = (attribute: Attribute) => {
    router.push(`/admin/attributes/${attribute.id}`);
  };

  const openAddModal = () => {
    router.push('/admin/attributes/add');
  };

  const getTypeIcon = (type: Attribute['type']) => {
    switch (type) {
      case 'TEXT': return <CommandLineIcon className="w-4 h-4" />;
      case 'NUMBER': return <CpuChipIcon className="w-4 h-4" />;
      case 'BOOLEAN': return <PuzzlePieceIcon className="w-4 h-4" />;
      case 'COLOR': return <SwatchIcon className="w-4 h-4" />;
      case 'SIZE': return <CubeIcon className="w-4 h-4" />;
      case 'SELECT': return <GlobeAltIcon className="w-4 h-4" />;
      case 'MULTISELECT': return <GlobeAltIcon className="w-4 h-4" />;
      default: return <CogIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Attribute['type']) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NUMBER': return 'bg-green-100 text-green-800 border-green-200';
      case 'BOOLEAN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COLOR': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'SIZE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SELECT': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'MULTISELECT': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Attributes', href: '/admin/attributes' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div
              className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
            />
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/10 via-purple-400/8 to-violet-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/5 via-pink-400/8 to-purple-400/8 rounded-full blur-3xl"></div>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
          {/* Header */}
          <div
            className="mb-8"
          >
            <AdminBreadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Attribute Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <CogIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Manage product attributes and their configurations
                </p>
              </div>
              
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
              >
                <span className="flex items-center">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Attribute
                </span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div
            className="mb-8 space-y-6"
          >
            {/* Main Search Bar */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2 text-blue-500" />
                    Search Attributes
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by name, code, type, or description..."
                      className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                      >
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Suggestions */}
                  {showSearchSuggestions && searchSuggestions.length > 0 && (
                    <div
                      className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
                    >
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${index}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            suggestion.type === 'name' ? 'bg-blue-500' :
                            suggestion.type === 'code' ? 'bg-green-500' :
                            suggestion.type === 'type' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`} />
                          <span className="text-sm text-gray-700">{suggestion.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <FunnelIcon className="w-4 h-4 mr-2 text-purple-500" />
                      Type Filter
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Types</option>
                      <option value="TEXT">Text</option>
                      <option value="NUMBER">Number</option>
                      <option value="BOOLEAN">Boolean</option>
                      <option value="COLOR">Color</option>
                      <option value="SIZE">Size</option>
                      <option value="SELECT">Select</option>
                      <option value="MULTISELECT">Multi-Select</option>
                    </select>
                  </div>

                  <div className="sm:w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <ChartBarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="name">Name</option>
                      <option value="type">Type</option>
                      <option value="createdAt">Created Date</option>
                      <option value="sortOrder">Sort Order</option>
                    </select>
                  </div>

                  <div className="sm:w-32">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2 text-teal-500" />
                      Order
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  <span>Advanced Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div
                className="group relative overflow-hidden"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6 hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <LightBulbIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Advanced Filters
                    </h3>
                    <button
                      onClick={clearAdvancedFilters}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'isRequired', label: 'Required', icon: ShieldCheckIcon, color: 'green' },
                      { key: 'isFilterable', label: 'Filterable', icon: FunnelIcon, color: 'blue' },
                      { key: 'isSearchable', label: 'Searchable', icon: MagnifyingGlassIcon, color: 'purple' },
                      { key: 'isComparable', label: 'Comparable', icon: ChartBarIcon, color: 'orange' },
                      { key: 'isVisible', label: 'Visible', icon: EyeIcon, color: 'indigo' },
                      { key: 'isVariantDefining', label: 'Variant', icon: CubeIcon, color: 'teal' },
                      { key: 'isVariantOverridable', label: 'Variant Overridable', icon: GlobeAltIcon, color: 'teal' },
                      { key: 'hasOptions', label: 'Has Options', icon: GlobeAltIcon, color: 'teal' }
                    ].map((filter) => (
                      <label key={filter.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={advancedFilters[filter.key as keyof typeof advancedFilters]}
                          onChange={(e) => setAdvancedFilters(prev => ({
                            ...prev,
                            [filter.key]: e.target.checked
                          }))}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <filter.icon className={`w-4 h-4 text-${filter.color}-500`} />
                        <span className="text-sm font-medium text-gray-700">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && !searchQuery && (
              <div
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600/10 to-gray-600/10 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 p-4 hover:shadow-gray-500/10 transition-all duration-300">
                  <div className="flex items-center space-x-2 mb-3">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(query);
                          addToSearchHistory(query);
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors duration-200"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attributes Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedAttributes.map((attribute, index) => (
              <AttributeCard 
                key={attribute.id} 
                attribute={attribute} 
                index={index} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                showAllOptionsIndex={showAllOptionsIndex}
                setShowAllOptionsIndex={setShowAllOptionsIndex}
              />
            ))}
          </div>

          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div 
              className="flex justify-center mt-12"
            >
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-4 flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      page === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/30'
                    }`}
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPage(idx + 1)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                          page === idx + 1 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      page === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/30'
                    }`}
                  >
                    Next
                    <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {paginatedAttributes.length === 0 && (
            <div
              className="text-center py-16"
            >
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CogIcon className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    No attributes found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchQuery || filterType !== 'all' 
                      ? 'No attributes match your current filters. Try adjusting your search criteria.'
                      : 'Create your first attribute to start managing product properties like size, color, material, and more.'
                    }
                  </p>
                  <button
                    onClick={openAddModal}
                    className="group/btn relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                    <span className="relative flex items-center">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Add First Attribute
                      <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AttributesPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div
              className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
            />
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
        </div>
      </AdminLayout>
    }>
      <AttributesContent />
    </Suspense>
  );
} 