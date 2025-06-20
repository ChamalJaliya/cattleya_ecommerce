'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  TagIcon,
  SwatchIcon,
  StarIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  SparklesIcon,
  FireIcon,
  CheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { OrchidSize } from '@/core/domain/entities/Product';

interface AdvancedSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

const colorOptions = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' }
];

const sizeOptions = [
  { value: OrchidSize.SEEDLING, label: 'Seedling' },
  { value: OrchidSize.SAPLING, label: 'Sapling' },
  { value: OrchidSize.YOUNG_PLANT, label: 'Young Plant' },
  { value: OrchidSize.MATURE, label: 'Mature' },
  { value: OrchidSize.BLOOMING_SIZE, label: 'Blooming Size' },
  { value: OrchidSize.SPECIMEN, label: 'Specimen' }
];

const careLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];
const bloomSeasonOptions = ['Spring', 'Summer', 'Fall', 'Winter', 'Year-round'];

export default function AdvancedSearch({ 
  onSearch, 
  placeholder = "Search orchids...", 
  showFilters = true,
  className = ""
}: AdvancedSearchProps) {
  const {
    filters,
    updateFilters,
    resetFilters,
    searchHistory,
    getSearchSuggestions,
    addToSearchHistory,
    clearSearchHistory,
    fetchProducts,
    pagination,
    setPagination
  } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
    if (filters?.searchQuery) {
      setSearchQuery(filters.searchQuery);
    }
  }, []);

  useEffect(() => {
    if (mounted && searchQuery.length > 0) {
      const newSuggestions = getSearchSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, getSearchSuggestions, mounted]);

  // Sync local search query with global filters (only after mount)
  useEffect(() => {
    if (mounted && filters?.searchQuery !== undefined) {
      setSearchQuery(filters.searchQuery || '');
    }
  }, [filters?.searchQuery, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  const triggerAPISearch = async () => {
    if (!mounted) return;
    
    setIsSearching(true);
    setPagination({ currentPage: 1 });
    
    const apiQuery = {
      search: searchQuery || undefined,
      page: 1,
      limit: 12,
      categoryId: filters?.category || undefined,
      minPrice: filters?.priceRange?.[0] > 0 ? filters.priceRange[0] : undefined,
      maxPrice: filters?.priceRange?.[1] < 1000 ? filters.priceRange[1] : undefined,
      inStock: filters?.inStock || undefined,
      tags: filters?.tags && filters.tags.length > 0 ? filters.tags : undefined,
      rating: filters?.rating > 0 ? filters.rating : undefined,
      sortBy: filters?.sortBy === 'name' ? 'name' : 
              filters?.sortBy === 'price-asc' ? 'basePrice' :
              filters?.sortBy === 'price-desc' ? 'basePrice' :
              filters?.sortBy === 'rating' ? 'averageRating' :
              filters?.sortBy === 'newest' ? 'createdAt' : 
              filters?.sortBy === 'popularity' ? 'viewCount' : 'name',
      sortOrder: filters?.sortBy === 'price-desc' ? 'desc' : 
                 filters?.sortBy === 'rating' ? 'desc' :
                 filters?.sortBy === 'popularity' ? 'desc' :
                 filters?.sortBy === 'newest' ? 'desc' : 'asc'
    };

    const cleanQuery = Object.fromEntries(
      Object.entries(apiQuery).filter(([_, value]) => value !== undefined)
    );

    try {
      await fetchProducts(cleanQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!mounted) return;
    
    if (query.trim()) {
      addToSearchHistory(query);
      updateFilters({ searchQuery: query });
      setSearchQuery(query);
      await triggerAPISearch();
      onSearch?.(query);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mounted) return;
    
    const value = e.target.value;
    setSearchQuery(value);
    updateFilters({ searchQuery: value });
    setShowSuggestions(value.length > 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!mounted) return;
    
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!mounted) return;
    
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClearSearch = async () => {
    if (!mounted) return;
    
    setSearchQuery('');
    updateFilters({ searchQuery: '' });
    setShowSuggestions(false);
    
    await fetchProducts({
      page: 1,
      limit: 12,
      sortBy: 'name',
      sortOrder: 'asc'
    });
    
    inputRef.current?.focus();
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    if (!mounted) return;
    updateFilters({ [filterKey]: value });
  };

  const toggleArrayFilter = (filterKey: string, value: any) => {
    if (!mounted || !filters) return;
    
    const currentValues = (filters[filterKey as keyof typeof filters] as any[]) || [];
    const safeCurrentValues = Array.isArray(currentValues) ? currentValues : [];
    
    const newValues = safeCurrentValues.includes(value)
      ? safeCurrentValues.filter((v: any) => v !== value)
      : [...safeCurrentValues, value];
      
    updateFilters({ [filterKey]: newValues });
  };

  const handleApplyFilters = async () => {
    if (!mounted) return;
    
    await triggerAPISearch();
    setShowFiltersPanel(false);
  };

  const handleResetFilters = async () => {
    if (!mounted) return;
    
    resetFilters();
    setSearchQuery('');
    setShowFiltersPanel(false);
    
    await fetchProducts({
      page: 1,
      limit: 12,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const getActiveFiltersCount = () => {
    if (!mounted || !filters) return 0;
    
    let count = 0;
    if (filters.category) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.sizes && filters.sizes.length > 0) count++;
    if (filters.careLevel && filters.careLevel.length > 0) count++;
    if (filters.bloomSeason && filters.bloomSeason.length > 0) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)) count++;
    return count;
  };

  // Prevent rendering until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="w-full pl-12 pr-20 py-4 text-lg border border-gray-200 rounded-2xl bg-white shadow-sm h-16 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Enhanced Search Input */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
          <motion.div
            animate={isSearching ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isSearching ? Infinity : 0, ease: "linear" }}
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-purple-500" />
          </motion.div>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-16 pr-24 py-5 text-lg border-0 rounded-3xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 placeholder-gray-400"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-6">
          <AnimatePresence>
            {searchQuery && searchQuery.length > 0 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleClearSearch}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer z-10 group"
                title="Clear search"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {showFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`p-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                showFiltersPanel || getActiveFiltersCount() > 0
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-purple-600'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-6 w-6 z-10 relative" />
              <AnimatePresence>
                {getActiveFiltersCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg"
                  >
                    {getActiveFiltersCount()}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Enhanced Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 z-50 max-h-96 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}
          >
            <div className="max-h-96 overflow-y-auto">
              {/* Search History */}
              {searchHistory.length > 0 && suggestions.length === 0 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium px-3 py-1 rounded-full hover:bg-purple-50 transition-all duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((term, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        onClick={() => handleSuggestionClick(term)}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-xl text-sm text-gray-700 transition-all duration-200 flex items-center group"
                      >
                        <ClockIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                        <span className="font-medium">{term}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Suggestions
                  </h3>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-xl text-sm text-gray-700 transition-all duration-200 flex items-center group"
                      >
                        <MagnifyingGlassIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                        <span className="font-medium">{suggestion}</span>
                        <ChevronDownIcon className="w-4 h-4 ml-auto text-gray-300 group-hover:text-purple-400 transition-colors duration-200 rotate-[-90deg]" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Advanced Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 z-40 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            }}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center"
                >
                  <FunnelIcon className="w-6 h-6 mr-3 text-purple-500" />
                  Advanced Filters
                </motion.h3>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResetFilters}
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold px-4 py-2 rounded-xl hover:bg-purple-50 transition-all duration-200"
                >
                  Reset All
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Enhanced Price Range */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                >
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                    Price Range
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters?.priceRange?.[0] || 0}
                        onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters?.priceRange?.[1] || 1000])}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      />
                      <span className="text-gray-500 font-medium">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters?.priceRange?.[1] || 1000}
                        onChange={(e) => handleFilterChange('priceRange', [filters?.priceRange?.[0] || 0, Number(e.target.value)])}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Rating */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                >
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
                    Minimum Rating
                  </label>
                  <select
                    value={filters?.rating || 0}
                    onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={1}>1+ Stars</option>
                    <option value={2}>2+ Stars</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </motion.div>

                {/* Enhanced Availability */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                >
                  <label className="block text-sm font-bold text-gray-800 mb-4">
                    Availability
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters?.inStock || false}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">In stock only</span>
                  </label>
                </motion.div>

                {/* Enhanced Orchid Sizes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                >
                  <label className="block text-sm font-bold text-gray-800 mb-4">
                    Orchid Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <motion.button
                        key={size.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleArrayFilter('sizes', size.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          filters?.sizes?.includes(size.value)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size?.label || 'Unknown Size'}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Enhanced Colors */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                >
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <SwatchIcon className="w-5 h-5 mr-2 text-pink-500" />
                    Colors
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleArrayFilter('colors', color.value)}
                        className={`w-10 h-10 rounded-full border-4 transition-all duration-200 relative ${
                          filters?.colors?.includes(color.value)
                            ? 'border-purple-500 ring-4 ring-purple-200 shadow-lg'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {filters?.colors?.includes(color.value) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <CheckIcon className="w-5 h-5 text-white drop-shadow-lg" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Enhanced Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
                >
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['fragrant', 'beginner-friendly', 'easy-care', 'large-flowers', 'long-blooming', 'elegant', 'spectacular', 'decorative', 'rare'].map((tag) => (
                      <motion.button
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleArrayFilter('tags', tag)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          filters?.tags?.includes(tag)
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 pt-6 border-t border-gray-200/50"
              >
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFiltersPanel(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApplyFilters}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <FireIcon className="w-5 h-5" />
                    <span>Apply Filters</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 