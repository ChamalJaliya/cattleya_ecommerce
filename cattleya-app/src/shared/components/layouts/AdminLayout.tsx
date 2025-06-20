'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: HomeIcon,
    description: 'Overview & Analytics'
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: ShoppingBagIcon,
    description: 'Manage Inventory'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ClipboardDocumentListIcon,
    description: 'Order Management'
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: UsersIcon,
    description: 'Customer Database'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    description: 'Sales & Reports'
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: TagIcon,
    description: 'Product Categories'
  },
  {
    name: 'Media',
    href: '/admin/media',
    icon: PhotoIcon,
    description: 'Image Gallery'
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: ChatBubbleLeftRightIcon,
    description: 'Customer Support'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: CogIcon,
    description: 'System Configuration'
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-80 h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20"
            >
              <SidebarContent 
                navigationItems={navigationItems}
                pathname={pathname}
                user={user}
                onLogout={handleLogout}
                onClose={() => setSidebarOpen(false)}
                isMobile={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-xl">
          <SidebarContent 
            navigationItems={navigationItems}
            pathname={pathname}
            user={user}
            onLogout={handleLogout}
            isMobile={false}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-80">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="ml-4 lg:ml-0 text-2xl font-bold bg-gradient-to-r from-slate-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 text-slate-400 hover:text-purple-600 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 relative group"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg"></span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
                </motion.button>
                
                {/* User Profile Dropdown */}
                <div className="relative group">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 cursor-pointer hover:bg-white/70 transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-medium capitalize">
                        {user?.role.toLowerCase()} • Administrator
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: 0 }}
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.2 }}
                      className="w-4 h-4 text-slate-400"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{user?.email}</p>
                          <span className="inline-block px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full mt-1">
                            ADMIN
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 group">
                        <UserIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors duration-200" />
                        <span>Profile Settings</span>
                      </button>
                      
                      <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 group">
                        <CogIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors duration-200" />
                        <span>System Settings</span>
                      </button>
                      
                      <div className="border-t border-white/20 my-2"></div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 group"
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors duration-200" />
                        <span className="font-semibold">Sign Out</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navigationItems: typeof navigationItems;
  pathname: string;
  user: any;
  onLogout: () => void;
  onClose?: () => void;
  isMobile: boolean;
}

function SidebarContent({ 
  navigationItems, 
  pathname, 
  user, 
  onLogout, 
  onClose, 
  isMobile 
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl">
      {/* Logo and close button */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center">
          <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
            Cattleya
          </h1>
          <span className="ml-2 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
            Admin
          </span>
        </Link>
        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        )}
      </div>

      {/* Admin Badge */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Administrator Panel
              </p>
              <p className="text-xs text-gray-600">Full System Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable with better structure */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div key={item.name} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-200/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`relative group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:backdrop-blur-sm'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'
                  }`} />
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-purple-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-xl mb-3 border border-white/20">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-white/60 backdrop-blur-sm rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 group border border-white/20 hover:border-red-200 shadow-lg"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
          <span className="font-semibold">Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
} 