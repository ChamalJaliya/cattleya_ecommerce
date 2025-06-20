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
  FunnelIcon
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
    performAdvancedSearch
  } = useProductStore();

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const newSuggestions = getSearchSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, getSearchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowFiltersPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToSearchHistory(query);
      performAdvancedSearch(query);
      onSearch?.(query);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    updateFilters({ searchQuery: '' });
    inputRef.current?.focus();
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    updateFilters({ [filterKey]: value });
  };

  const toggleArrayFilter = (filterKey: string, value: any) => {
    if (!filters) return;
    
    const currentValues = (filters[filterKey as keyof typeof filters] as any[]) || [];
    
    // Ensure currentValues is an array
    const safeCurrentValues = Array.isArray(currentValues) ? currentValues : [];
    
    const newValues = safeCurrentValues.includes(value)
      ? safeCurrentValues.filter((v: any) => v !== value)
      : [...safeCurrentValues, value];
      
    updateFilters({ [filterKey]: newValues });
  };

  const getActiveFiltersCount = () => {
    if (!filters) return 0;
    
    let count = 0;
    if (filters.category) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.sizes && filters.sizes.length > 0) count++;
    if (filters.careLevel && filters.careLevel.length > 0) count++;
    if (filters.bloomSeason && filters.bloomSeason.length > 0) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 500)) count++;
    return count;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-4 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-4">
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                showFiltersPanel || getActiveFiltersCount() > 0
                  ? 'bg-purple-100 text-purple-600'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto"
          >
            {/* Search History */}
            {searchHistory.length > 0 && suggestions.length === 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(term)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggestions</h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors duration-200 flex items-center"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-40 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2" />
                Advanced Filters
              </h3>
              <button
                onClick={() => {
                  resetFilters();
                  setSearchQuery('');
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Price Range
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      value={(filters.priceRange || [0, 500])[0]}
                      onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), (filters.priceRange || [0, 500])[1]])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Min"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={(filters.priceRange || [0, 500])[1]}
                      onChange={(e) => handleFilterChange('priceRange', [(filters.priceRange || [0, 500])[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <StarIcon className="w-4 h-4 mr-2" />
                  Minimum Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', rating === (filters.rating || 0) ? 0 : rating)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors duration-200 ${
                        (filters.rating || 0) >= rating
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <SwatchIcon className="w-4 h-4 mr-2" />
                  Colors
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => toggleArrayFilter('colors', color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        (filters.colors || []).includes(color.value)
                          ? 'border-purple-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Plant Sizes
                </label>
                <div className="space-y-2">
                  {sizeOptions.map((size) => (
                    <label key={size.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(filters.sizes || []).includes(size.value)}
                        onChange={() => toggleArrayFilter('sizes', size.value)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{size.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Care Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Care Level
                </label>
                <div className="space-y-2">
                  {careLevelOptions.map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(filters.careLevel || []).includes(level)}
                        onChange={() => toggleArrayFilter('careLevel', level)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bloom Season */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Bloom Season
                </label>
                <div className="space-y-2">
                  {bloomSeasonOptions.map((season) => (
                    <label key={season} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(filters.bloomSeason || []).includes(season)}
                        onChange={() => toggleArrayFilter('bloomSeason', season)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{season}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Other Options */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'name'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 