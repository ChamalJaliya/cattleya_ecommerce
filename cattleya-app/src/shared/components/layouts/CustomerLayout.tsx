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
  GiftIcon
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
    <div className="min-h-screen bg-gray-50 flex">
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
      <div className="flex-1 lg:pl-80">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900">
                  My Dashboard
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200 relative">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-purple-400"></span>
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.loyaltyPoints || 0} loyalty points
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo and close button */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
            Cattleya
          </h1>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* User Welcome */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Welcome back, {user?.firstName}!
              </p>
              <p className="text-sm text-gray-600">
                {user?.loyaltyPoints || 0} loyalty points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className={`text-xs ${isActive ? 'text-purple-100' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2 mb-4">
          <Link
            href="/"
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <HomeIcon className="mr-3 h-4 w-4 text-gray-400" />
            Back to Store
          </Link>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
          Sign Out
        </button>
      </div>
    </div>
  );
} 