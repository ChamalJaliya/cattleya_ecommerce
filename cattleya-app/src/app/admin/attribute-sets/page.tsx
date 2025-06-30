'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  SparklesIcon,
  TagIcon,
  CubeIcon,
  CheckIcon,
  SwatchIcon,
  ArchiveBoxIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  StarIcon,
  RectangleStackIcon,
  FolderIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  LightBulbIcon,
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
  options?: string[];
  sortOrder: number;
}

interface AttributeSet {
  id: string;
  name: string;
  code: string;
  description?: string;
  attributes: Attribute[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SearchSuggestion {
  type: 'name' | 'code' | 'description';
  value: string;
  label: string;
}

function AttributeSetsContent() {
  const router = useRouter();
  const [attributeSets, setAttributeSets] = useState<AttributeSet[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    isActive: false,
    hasAttributes: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'sortOrder'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const [paginatedSets, setPaginatedSets] = useState<AttributeSet[]>([]);
  const totalPages = Math.ceil(total / pageSize);

  // Search suggestions
  const searchSuggestions = (): SearchSuggestion[] => {
    if (!searchQuery.trim()) return [];
    
    const suggestions: SearchSuggestion[] = [];
    const query = searchQuery.toLowerCase();
    
    // Name suggestions
    attributeSets.forEach(set => {
      if (set.name.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'name',
          value: set.name,
          label: `Name: ${set.name}`
        });
      }
    });
    
    // Code suggestions
    attributeSets.forEach(set => {
      if (set.code.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'code',
          value: set.code,
          label: `Code: ${set.code}`
        });
      }
    });
    
    // Description suggestions
    attributeSets.forEach(set => {
      if (set.description && set.description.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'description',
          value: set.description,
          label: `Description: ${set.description.substring(0, 50)}...`
        });
      }
    });
    
    return suggestions.slice(0, 8);
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery, filterType, advancedFilters, sortBy, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attrRes, setRes] = await Promise.all([
        axios.get('/api/attributes'),
        axios.get('/api/attribute-sets', {
          params: { 
            page, 
            limit: pageSize, 
            search: searchQuery, 
            filterType,
            ...advancedFilters,
            sortBy,
            sortOrder
          },
        }),
      ]);
      
      const attrs = Array.isArray(attrRes.data?.data) ? attrRes.data.data : [];
      const sets = Array.isArray(setRes.data?.data) ? setRes.data.data : [];
      const totalCount = setRes.data?.total || sets.length;
      
      setAttributes(attrs);
      setPaginatedSets(sets);
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch data');
      setAttributes([]);
      setPaginatedSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSearchSuggestions(value.length > 0);
    setPage(1);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value);
    setShowSearchSuggestions(false);
    addToSearchHistory(suggestion.value);
  };

  const addToSearchHistory = (query: string) => {
    if (!searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 4)];
      setSearchHistory(newHistory);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      isActive: false,
      hasAttributes: false
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(advancedFilters).filter(Boolean).length;
  };

  const handleDelete = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this attribute set?')) return;
    
    try {
      await axios.delete(`/api/attribute-sets/${setId}`);
      setPaginatedSets(paginatedSets.filter(set => set.id !== setId));
      toast.success('Attribute set deleted successfully!');
    } catch (error) {
      console.error('Failed to delete attribute set:', error);
      toast.error('Failed to delete attribute set');
    }
  };

  const handleEdit = (set: AttributeSet) => {
    router.push(`/admin/attribute-sets/${set.id}`);
  };

  const openAddModal = () => {
    router.push('/admin/attribute-sets/add');
  };

  const getTypeIcon = (type: Attribute['type']) => {
    switch (type) {
      case 'TEXT': return <TagIcon className="w-4 h-4" />;
      case 'NUMBER': return <CubeIcon className="w-4 h-4" />;
      case 'BOOLEAN': return <CheckIcon className="w-4 h-4" />;
      case 'COLOR': return <SwatchIcon className="w-4 h-4" />;
      case 'SIZE': return <ArchiveBoxIcon className="w-4 h-4" />;
      case 'SELECT': return <GlobeAltIcon className="w-4 h-4" />;
      case 'MULTISELECT': return <ShoppingBagIcon className="w-4 h-4" />;
      default: return <TagIcon className="w-4 h-4" />;
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
    { label: 'Attribute Sets', href: '/admin/attribute-sets' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-pink-400/20 via-purple-400/15 to-violet-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/10 via-pink-400/20 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 relative z-10">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
              </div>
            </div>
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
          <div className="mb-8">
            <AdminBreadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-between mt-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Attribute Sets Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <RectangleStackIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Organize and manage groups of product attributes
                </p>
              </div>
              
              <button
                onClick={openAddModal}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                <span className="relative flex items-center">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Attribute Set
                  <SparklesIcon className="w-4 h-4 ml-2 animate-pulse" />
                </span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            {/* Main Search Bar */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2 text-blue-500" />
                    Search Attribute Sets
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                      placeholder="Search by name, code, or description..."
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
                  {showSearchSuggestions && searchSuggestions().length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                      {searchSuggestions().map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${index}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            suggestion.type === 'name' ? 'bg-blue-500' :
                            suggestion.type === 'code' ? 'bg-green-500' :
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
                      Status Filter
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Sets</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
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
              <div className="group relative overflow-hidden">
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
                      { key: 'isActive', label: 'Active Only', icon: CheckIcon, color: 'green' },
                      { key: 'hasAttributes', label: 'Has Attributes', icon: TagIcon, color: 'blue' }
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
              <div className="group relative">
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

          {/* Attribute Sets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSets.map((set, index) => (
              <div
                key={set.id}
                className="group relative overflow-hidden rounded-2xl transition-all duration-300 shadow-lg border border-gray-200/50 bg-white/90 backdrop-blur-sm hover:shadow-xl hover:scale-[1.02]"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                        {set.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-md inline-block">
                        {set.code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        set.isActive 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {set.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {set.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {set.description}
                    </p>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TagIcon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {set.attributes?.length || 0} Attributes
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-500">#{set.sortOrder}</span>
                    </div>
                  </div>

                  {/* Attribute Types Preview */}
                  {set.attributes && set.attributes.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {set.attributes.slice(0, 3).map((attr, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${getTypeColor(attr.type)}`}
                          >
                            {getTypeIcon(attr.type)}
                            <span className="ml-1">{attr.type}</span>
                          </span>
                        ))}
                        {set.attributes.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 border border-gray-200">
                            +{set.attributes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date(set.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(set)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit attribute set"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(set.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete attribute set"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
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
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {paginatedSets.length === 0 && (
            <div className="text-center py-16">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RectangleStackIcon className="w-12 h-12 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    No attribute sets found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchQuery || filterType !== 'all' 
                      ? 'No attribute sets match your current filters. Try adjusting your search criteria.'
                      : 'Create your first attribute set to organize related product attributes together.'
                    }
                  </p>
                  <button
                    onClick={openAddModal}
                    className="group/btn relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur opacity-0 group-hover/btn:opacity-40 transition duration-300"></div>
                    <span className="relative flex items-center">
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Add First Attribute Set
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

export default function AttributeSetsPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400 opacity-20"></div>
          </div>
        </div>
      </AdminLayout>
    }>
      <AttributeSetsContent />
    </Suspense>
  );
} 