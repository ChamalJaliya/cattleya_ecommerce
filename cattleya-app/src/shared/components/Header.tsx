'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingCartIcon, 
  ChevronRightIcon,
  HomeIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { useState } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  subtitle?: string;
}

export default function Header({ breadcrumbs = [], title, subtitle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { items, toggleCart } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs.length > 0) return breadcrumbs;
    
    const pathSegments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom labels for specific routes
      if (segment === 'products') label = 'Collection';
      if (segment === 'auth') label = 'Authentication';
      if (segment === 'admin') label = 'Admin';
      if (segment === 'customer') label = 'Account';
      if (segment === 'dashboard') label = 'Dashboard';
      
      crumbs.push({ label, href: currentPath });
    });
    
    return crumbs;
  };

  const finalBreadcrumbs = generateBreadcrumbs();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-shrink-0"
              >
                <Link href="/">
                  <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent cursor-pointer">
                    Cattleya
                  </h1>
                </Link>
              </motion.div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link 
                  href="/products" 
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname.startsWith('/products') 
                      ? 'text-purple-600 bg-purple-50 rounded-lg' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-lg'
                  }`}
                >
                  Collection
                </Link>
                <Link 
                  href="/about" 
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname === '/about' 
                      ? 'text-purple-600 bg-purple-50 rounded-lg' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-lg'
                  }`}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname === '/contact' 
                      ? 'text-purple-600 bg-purple-50 rounded-lg' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-lg'
                  }`}
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCart}
                className="relative text-gray-700 hover:text-purple-600 p-2 transition-colors duration-200 hover:bg-purple-50 rounded-lg"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Actions */}
              {user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <Link 
                    href="/dashboard" 
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      pathname.startsWith('/dashboard') || pathname.startsWith('/customer') || pathname.startsWith('/admin')
                        ? 'text-purple-600 bg-purple-50 rounded-lg' 
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-lg'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link 
                    href="/auth/login" 
                    className="text-gray-700 hover:text-purple-600 px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-purple-50/50 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 hover:text-purple-600 p-2 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100"
        >
          <div className="px-4 py-4 space-y-2">
            <Link 
              href="/products"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                pathname.startsWith('/products') 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              Collection
            </Link>
            <Link 
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                pathname === '/about' 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                pathname === '/contact' 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              Contact
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                    pathname.startsWith('/dashboard') || pathname.startsWith('/customer') || pathname.startsWith('/admin')
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/50'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50/50 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </header>

      {/* Breadcrumbs & Page Title */}
      {(finalBreadcrumbs.length > 1 || title) && (
        <div className="pt-24 pb-6 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            {finalBreadcrumbs.length > 1 && (
              <motion.nav
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-sm text-gray-600 mb-4"
              >
                {finalBreadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index === 0 && <HomeIcon className="w-4 h-4 mr-1" />}
                    {index < finalBreadcrumbs.length - 1 ? (
                      <Link 
                        href={crumb.href}
                        className="hover:text-purple-600 transition-colors duration-200 font-medium"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-semibold">{crumb.label}</span>
                    )}
                    {index < finalBreadcrumbs.length - 1 && (
                      <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400" />
                    )}
                  </div>
                ))}
              </motion.nav>
            )}

            {/* Page Title */}
            {title && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl lg:text-5xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xl text-gray-600 max-w-3xl">
                    {subtitle}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 