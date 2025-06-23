'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  FolderOpenIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryTreeViewProps {
  categories: Category[];
  onAddCategory: (parentId?: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  onViewCategory: (category: Category) => void;
  onToggleCategory: (categoryId: string) => void;
  expandedCategories: Set<string>;
  selectedCategory?: Category;
  onSelectCategory: (category: Category) => void;
}

interface CategoryNodeProps {
  category: Category;
  level: number;
  onAddCategory: (parentId?: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory?: (category: Category) => void;
  onViewCategory: (category: Category) => void;
  onToggleCategory: (categoryId: string) => void;
  expandedCategories: Set<string>;
  selectedCategory?: Category;
  onSelectCategory: (category: Category) => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onViewCategory,
  onToggleCategory,
  expandedCategories,
  selectedCategory,
  onSelectCategory,
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  const isSelected = selectedCategory?.id === category.id;

  const handleToggle = () => {
    if (hasChildren) {
      onToggleCategory(category.id);
    }
  };

  const handleSelect = () => {
    onSelectCategory(category);
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300
          ${isSelected
            ? 'bg-gradient-to-r from-purple-200/80 to-pink-200/80 border-l-4 border-purple-500 shadow-lg shadow-purple-400/30 animate-glow'
            : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-l-4 border-transparent hover:shadow-md hover:shadow-pink-200/30'}
          ${isExpanded ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80' : ''}
        `}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleSelect}
      >
        {/* Toggle Button */}
        {hasChildren && (
          <motion.button
            onClick={e => { e.stopPropagation(); handleToggle(); }}
            className="mr-2 p-1 rounded hover:bg-gray-200 transition-colors duration-200"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-purple-600 animate-chevron" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-purple-600 animate-chevron" />
            )}
          </motion.button>
        )}
        {!hasChildren && <div className="w-6 mr-2" />}

        {/* Category Icon */}
        <div className="flex-shrink-0 mr-3">
          <span className="relative block">
            {isExpanded ? (
              <FolderOpenIcon className="w-5 h-5 text-purple-600 animate-pulse-sparkle" />
            ) : (
              <FolderIcon className="w-5 h-5 text-gray-500 animate-pulse-sparkle" />
            )}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-sm opacity-70 animate-ping" />
          </span>
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium truncate ${
                isSelected ? 'text-purple-900 drop-shadow-glow' : 'text-gray-900'
              }`}>
                {category.name}
              </h4>
              {category.description && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {category.description}
                </p>
              )}
            </div>
            {/* Status and Product Count */}
            <div className="flex items-center space-x-2 ml-4">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                category.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {category.productCount} products
              </span>
              {category.children && category.children.length > 0 && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded animate-glow-badge">
                  {category.children.length} subcategories
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={e => { e.stopPropagation(); onViewCategory(category); }}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            title="View Category"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAddCategory(category.id); }}
            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
            title="Add Subcategory"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEditCategory(category); }}
            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200"
            title="Edit Category"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDeleteCategory?.(category); }}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            title="Delete Category"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {category.children?.map((child) => (
              <CategoryNode
                key={child.id}
                category={child}
                level={level + 1}
                onAddCategory={onAddCategory}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
                onViewCategory={onViewCategory}
                onToggleCategory={onToggleCategory}
                expandedCategories={expandedCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onViewCategory,
  onToggleCategory,
  expandedCategories,
  selectedCategory,
  onSelectCategory,
}) => {
  const rootCategories = categories.filter(cat => !cat.parentId);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg shadow-pink-200/40 animate-glow-container">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-pink-400 animate-sparkle" />
            Category Tree
          </h3>
          <p className="text-sm text-gray-600">Manage your hierarchical categories</p>
        </div>
        <button
          onClick={() => onAddCategory()}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 animate-glow-btn"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Root Category
        </button>
      </div>

      {/* Tree Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-2xl shadow-purple-200/30 animate-glow-container">
        {rootCategories.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse-sparkle" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first category</p>
            <button
              onClick={() => onAddCategory()}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 animate-glow-btn"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create First Category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rootCategories.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                level={0}
                onAddCategory={onAddCategory}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
                onViewCategory={onViewCategory}
                onToggleCategory={onToggleCategory}
                expandedCategories={expandedCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Category Info */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 shadow-md animate-glow-container"
        >
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-cyan-400 animate-sparkle" />
            Selected Category
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Name:</span>
              <span className="ml-2 text-blue-900">{selectedCategory.name}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Slug:</span>
              <span className="ml-2 text-blue-900">{selectedCategory.slug}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                selectedCategory.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedCategory.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Products:</span>
              <span className="ml-2 text-blue-900">{selectedCategory.productCount}</span>
            </div>
            {selectedCategory.description && (
              <div className="col-span-2">
                <span className="text-blue-700 font-medium">Description:</span>
                <span className="ml-2 text-blue-900">{selectedCategory.description}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CategoryTreeView; 