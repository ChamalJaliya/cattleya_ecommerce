'use client';

import { useState, ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  PlusIcon,
  ChevronDownIcon,
  RocketLaunchIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import NotificationBell from '@/shared/components/NotificationBell';
import NotificationDropdown from '@/shared/components/NotificationDropdown';
import { useNotifications } from '@/shared/hooks/useNotifications';

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
    description: 'Image Library'
  },
  {
    name: 'Messages',
    href: '/admin/messages',
    icon: ChatBubbleLeftRightIcon,
    description: 'Customer Support'
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: BellIcon,
    description: 'System Alerts & Updates'
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
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setQuickActionsOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    if (quickActionsOpen || isNotificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [quickActionsOpen, isNotificationDropdownOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNotificationClick = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    setIsNotificationDropdownOpen(false);
    router.push('/admin/notifications');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex relative">
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
        <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-purple-200/50 sticky top-0 z-50 relative flex-shrink-0">
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
                    Admin Dashboard
                  </h1>
                  <div className="flex items-center space-x-1">
                    <SparklesIcon className="w-5 h-5 text-purple-500 animate-pulse" />
                    <FireIcon className="w-4 h-4 text-orange-500 animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Quick Actions Dropdown */}
                <div className="relative" ref={quickActionsRef}>
                  <button
                    onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                    className="group relative overflow-hidden p-3 text-gray-400 hover:text-purple-600 rounded-xl hover:bg-purple-100/50 transition-all duration-200"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                    <div className="relative z-10 flex items-center space-x-1">
                      <RocketLaunchIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                      <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${quickActionsOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                                    <AnimatePresence>
                    {quickActionsOpen && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9998]"
                          onClick={() => setQuickActionsOpen(false)}
                        />
                        
                        {/* Dropdown */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="fixed right-4 top-20 w-80 z-[9999]"
                          style={{ zIndex: 9999 }}
                        >
                        <div className="group relative">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <CommandLineIcon className="w-5 h-5 text-purple-600" />
                                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                                    Quick Actions
                                  </h3>
                                </div>
                                <button
                                  onClick={() => setQuickActionsOpen(false)}
                                  className="p-1 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                                >
                                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>

                            {/* Actions Grid */}
                            <div className="p-4">
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => {
                                    router.push('/admin/products/add');
                                    setQuickActionsOpen(false);
                                  }}
                                  className="group/action relative overflow-hidden p-4 rounded-xl hover:scale-105 transition-all duration-200"
                                >
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-0 group-hover/action:opacity-20 transition duration-300"></div>
                                  <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 group-hover/action:from-green-100 group-hover/action:to-emerald-100 transition-all duration-200 p-3 rounded-lg">
                                    <PlusIcon className="w-6 h-6 text-green-600 mb-2" />
                                    <div className="text-sm font-bold text-green-700">Add Product</div>
                                    <div className="text-xs text-green-600">Create new item</div>
                                  </div>
                                </button>

                                <button
                                  onClick={() => {
                                    router.push('/admin/customers');
                                    setQuickActionsOpen(false);
                                  }}
                                  className="group/action relative overflow-hidden p-4 rounded-xl hover:scale-105 transition-all duration-200"
                                >
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-0 group-hover/action:opacity-20 transition duration-300"></div>
                                  <div className="relative bg-gradient-to-r from-blue-50 to-cyan-50 group-hover/action:from-blue-100 group-hover/action:to-cyan-100 transition-all duration-200 p-3 rounded-lg">
                                    <UsersIcon className="w-6 h-6 text-blue-600 mb-2" />
                                    <div className="text-sm font-bold text-blue-700">Customers</div>
                                    <div className="text-xs text-blue-600">Manage users</div>
                                  </div>
                                </button>

                                <button
                                  onClick={() => {
                                    router.push('/admin/orders');
                                    setQuickActionsOpen(false);
                                  }}
                                  className="group/action relative overflow-hidden p-4 rounded-xl hover:scale-105 transition-all duration-200"
                                >
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-0 group-hover/action:opacity-20 transition duration-300"></div>
                                  <div className="relative bg-gradient-to-r from-orange-50 to-red-50 group-hover/action:from-orange-100 group-hover/action:to-red-100 transition-all duration-200 p-3 rounded-lg">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-orange-600 mb-2" />
                                    <div className="text-sm font-bold text-orange-700">Orders</div>
                                    <div className="text-xs text-orange-600">View recent</div>
                                  </div>
                                </button>

                                <button
                                  onClick={() => {
                                    router.push('/admin/analytics');
                                    setQuickActionsOpen(false);
                                  }}
                                  className="group/action relative overflow-hidden p-4 rounded-xl hover:scale-105 transition-all duration-200"
                                >
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover/action:opacity-20 transition duration-300"></div>
                                  <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 group-hover/action:from-purple-100 group-hover/action:to-pink-100 transition-all duration-200 p-3 rounded-lg">
                                    <ChartBarIcon className="w-6 h-6 text-purple-600 mb-2" />
                                    <div className="text-sm font-bold text-purple-700">Analytics</div>
                                    <div className="text-xs text-purple-600">View stats</div>
                                  </div>
                                </button>
                              </div>

                              {/* Quick Stats */}
                              <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Quick Stats</span>
                                  <SparklesIcon className="w-4 h-4 text-purple-500 animate-pulse" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                                  <div>
                                    <div className="text-lg font-bold text-blue-600">24</div>
                                    <div className="text-xs text-gray-500">Products</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-green-600">12</div>
                                    <div className="text-xs text-gray-500">Orders</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-purple-600">8</div>
                                    <div className="text-xs text-gray-500">Customers</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative" ref={notificationDropdownRef}>
                  <NotificationBell 
                    unreadCount={unreadCount}
                    onClick={handleNotificationClick} 
                  />
                  
                  <NotificationDropdown
                    isOpen={isNotificationDropdownOpen}
                    onClose={() => setIsNotificationDropdownOpen(false)}
                    notifications={notifications.slice(0, 5)} // Show only first 5 notifications
                    unreadCount={unreadCount}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onViewAll={handleViewAll}
                  />
                </div>
                
                <div className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <ShieldCheckIcon className="w-5 h-5 text-white" />
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
                      <p className="text-xs text-purple-600 font-medium capitalize">{user?.role?.toLowerCase()}</p>
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
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm border-r border-purple-200/50 shadow-2xl relative">
      {/* Ambient sidebar effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-l from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-r from-blue-400/5 to-cyan-400/5 rounded-full blur-2xl"></div>
      {/* Enhanced Logo and close button */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-purple-200/30 relative">
        <Link href="/admin/dashboard" className="flex items-center group">
          <div className="relative">
            <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
              Cattleya
            </h1>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
          </div>
          <span className="ml-3 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
            Admin
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
              <p className="text-xs text-purple-600 font-medium">{user?.email}</p>
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