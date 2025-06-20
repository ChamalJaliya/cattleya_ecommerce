'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = '',
  showInfo = true
}: PaginationProps) {
  const [pages, setPages] = useState<(number | 'ellipsis')[]>([]);

  useEffect(() => {
    const generatePages = (): (number | 'ellipsis')[] => {
      const delta = 2; // Number of pages to show on each side
      const range: number[] = [];
      const rangeWithDots: (number | 'ellipsis')[] = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, 'ellipsis');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('ellipsis', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      // Remove duplicates and handle edge cases
      const uniquePages = rangeWithDots.filter((page, index, array) => {
        if (page === 'ellipsis') return true;
        return array.indexOf(page) === index;
      });

      // Handle single page case
      if (totalPages === 1) {
        return [1];
      }

      return uniquePages;
    };

    setPages(generatePages());
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Pagination Info */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
        >
          Showing <span className="font-semibold text-purple-600">{startItem.toLocaleString()}</span> to{' '}
          <span className="font-semibold text-purple-600">{endItem.toLocaleString()}</span> of{' '}
          <span className="font-semibold text-purple-600">{totalItems.toLocaleString()}</span> results
        </motion.div>
      )}

      {/* Pagination Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-2"
      >
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 shadow-sm border border-gray-200 hover:border-purple-200 hover:shadow-md'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Previous
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          <AnimatePresence mode="wait">
            {pages.map((page, index) => (
              <motion.div
                key={`${page}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {page === 'ellipsis' ? (
                  <div className="flex items-center justify-center w-10 h-10">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 shadow-sm border border-gray-200 hover:border-purple-200 hover:shadow-md'
                    }`}
                  >
                    {page}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 shadow-sm border border-gray-200 hover:border-purple-200 hover:shadow-md'
          }`}
        >
          Next
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </motion.button>
      </motion.div>

      {/* Quick Navigation (for large page counts) */}
      {totalPages > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2"
        >
          <span className="text-sm text-gray-500">Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                handlePageChange(page);
              }
            }}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
          />
          <span className="text-sm text-gray-500">of {totalPages}</span>
        </motion.div>
      )}
    </div>
  );
} 