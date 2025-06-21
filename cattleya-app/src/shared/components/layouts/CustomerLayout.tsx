'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  CreditCardIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';

interface CustomerLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Your Overview'
  },
  {
    name: 'Orders',
    href: '/customer/orders',
    icon: ClipboardDocumentListIcon,
    description: 'Order History'
  },
  {
    name: 'Wishlist',
    href: '/customer/wishlist',
    icon: HeartIcon,
    description: 'Saved Items'
  },
  {
    name: 'Cart',
    href: '/customer/cart',
    icon: ShoppingBagIcon,
    description: 'Shopping Cart'
  },
  {
    name: 'Profile',
    href: '/customer/profile',
    icon: UserIcon,
    description: 'Account Settings'
  },
  {
    name: 'Addresses',
    href: '/customer/addresses',
    icon: MapPinIcon,
    description: 'Delivery Addresses'
  },
  {
    name: 'Payment Methods',
    href: '/customer/payment-methods',
    icon: CreditCardIcon,
    description: 'Saved Cards'
  },
  {
    name: 'Loyalty Rewards',
    href: '/customer/loyalty',
    icon: GiftIcon,
    description: 'Points & Benefits'
  },
  {
    name: 'Support',
    href: '/customer/support',
    icon: ChatBubbleLeftRightIcon,
    description: 'Help & Contact'
  }
];

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-cyan-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-full blur-2xl -z-10"></div>
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-80 h-full bg-white shadow-2xl"
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
        <SidebarContent 
          navigationItems={navigationItems}
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
          isMobile={false}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-80 flex flex-col h-screen">
        {/* Enhanced Top bar */}
        <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-purple-200/50 sticky top-0 z-50 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
          <div className="px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-100 transition-all duration-200 group"
                >
                  <Bars3Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                </button>
                <div className="ml-4 lg:ml-0 flex items-center space-x-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    My Dashboard
                  </h1>
                  <div className="flex items-center space-x-1">
                    <SparklesIcon className="w-5 h-5 text-purple-500 animate-pulse" />
                    <FireIcon className="w-4 h-4 text-orange-500 animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="group relative overflow-hidden p-3 text-gray-400 hover:text-purple-600 rounded-xl hover:bg-purple-100/50 transition-all duration-200">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  <BellIcon className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-pink-400 animate-pulse"></span>
                </button>
                
                <div className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <span className="text-white font-semibold text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <StarIcon className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs text-purple-600 font-medium flex items-center">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        {user?.loyaltyPoints || 0} loyalty points
                      </p>
                      <BoltIcon className="w-3 h-3 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 scrollbar-auto overflow-x-hidden">
          <div className="py-6">
            {children}
          </div>
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
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm border-r border-purple-200/50 shadow-2xl relative overflow-hidden">
      {/* Ambient sidebar effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-l from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-r from-blue-400/5 to-cyan-400/5 rounded-full blur-2xl"></div>
      
      {/* Enhanced Logo and close button */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-purple-200/30 relative">
        <Link href="/" className="flex items-center group">
          <div className="relative">
            <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
              Cattleya
            </h1>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
          </div>
          <span className="ml-3 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
            Customer
          </span>
          <SparklesIcon className="w-4 h-4 text-purple-500 ml-2 animate-pulse" />
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="group p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-100/50 transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
          </button>
        )}
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto relative sidebar-scroll">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group relative overflow-hidden flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white shadow-xl shadow-purple-500/30 scale-105'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-gray-900 hover:scale-105 hover:shadow-lg'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30"></div>
              )}
              <div className="relative flex items-center w-full">
                <div className={`mr-3 p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'group-hover:bg-purple-100 group-hover:scale-110'
                }`}>
                  <item.icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className={`font-bold transition-all duration-200 ${
                    isActive ? 'text-white' : 'group-hover:text-purple-700'
                  }`}>
                    {item.name}
                  </div>
                  <div className={`text-xs transition-all duration-200 ${
                    isActive ? 'text-purple-100' : 'text-gray-500 group-hover:text-purple-600'
                  }`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-3 h-3 text-yellow-300 animate-pulse" />
                    <BoltIcon className="w-3 h-3 text-yellow-300" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Enhanced User info and logout */}
      <div className="p-4 border-t border-purple-200/30 relative">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-2xl mb-4 group hover:shadow-lg transition-all duration-300">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
              <StarIcon className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="flex items-center space-x-1">
              <p className="text-xs text-purple-600 font-medium flex items-center">
                <SparklesIcon className="w-3 h-3 mr-1" />
                {user?.loyaltyPoints || 0} loyalty points
              </p>
              <BoltIcon className="w-3 h-3 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full group relative overflow-hidden flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
          <div className="relative flex items-center w-full">
            <div className="mr-3 p-2 rounded-lg group-hover:bg-red-100 group-hover:scale-110 transition-all duration-200">
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
            </div>
            <span className="font-bold">Sign Out</span>
            <div className="ml-auto">
              <FireIcon className="w-4 h-4 text-red-400 group-hover:text-red-500 group-hover:animate-bounce transition-all duration-200" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
} 