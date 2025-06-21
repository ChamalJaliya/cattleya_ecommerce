'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  if (items.length <= 1) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="relative">
        {/* Subtle background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 via-violet-600/10 to-indigo-600/10 rounded-2xl blur opacity-30"></div>
        
        <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 px-6 py-4">
          <div className="flex items-center space-x-2 text-sm">
            {items.map((item, index) => (
              <div key={item.href} className="flex items-center">
                {index === 0 && (
                  <HomeIcon className="w-4 h-4 mr-2 text-purple-500" />
                )}
                
                {index < items.length - 1 ? (
                  <Link 
                    href={item.href}
                    className="group relative overflow-hidden px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-purple-50/80"
                  >
                    <span className="relative text-gray-600 group-hover:text-purple-600 font-medium transition-colors duration-200">
                      {item.label}
                    </span>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                  </Link>
                ) : (
                  <span className="text-gray-900 font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent px-3 py-1.5">
                    {item.label}
                  </span>
                )}
                
                {index < items.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 