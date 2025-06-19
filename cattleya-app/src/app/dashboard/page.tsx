'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  StarIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { UserRole } from '@/core/domain/entities/User';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock data for customer dashboard
const userStats = [
  {
    name: 'Cart Items',
    value: '3',
    icon: ShoppingBagIcon,
    color: 'from-purple-500 to-pink-500',
    href: '/dashboard/cart'
  },
  {
    name: 'Wishlist',
    value: '12',
    icon: HeartIcon,
    color: 'from-red-500 to-pink-500',
    href: '/dashboard/wishlist'
  },
  {
    name: 'Orders',
    value: '8',
    icon: ClipboardDocumentListIcon,
    color: 'from-blue-500 to-cyan-500',
    href: '/dashboard/orders'
  },
  {
    name: 'Profile',
    value: `${85}%`,
    icon: UserIcon,
    color: 'from-green-500 to-emerald-500',
    href: '/dashboard/profile'
  }
];

const recentOrders = [
  {
    id: 'ORD-001',
    product: 'Cattleya Orchid Premium',
    status: 'delivered',
    date: '2024-01-10',
    amount: '$149.99',
    image: '🌺'
  },
  {
    id: 'ORD-002',
    product: 'Orchid Care Kit',
    status: 'shipped',
    date: '2024-01-12',
    amount: '$89.99',
    image: '🧴'
  },
  {
    id: 'ORD-003',
    product: 'Rare Cattleya Collection',
    status: 'processing',
    date: '2024-01-14',
    amount: '$299.99',
    image: '🌸'
  }
];

const recommendedProducts = [
  {
    name: 'Cattleya Sunset',
    price: '$179.99',
    rating: 4.8,
    image: '🌅',
    badge: 'Popular'
  },
  {
    name: 'Orchid Fertilizer Pro',
    price: '$29.99',
    rating: 4.9,
    image: '🌿',
    badge: 'Best Seller'
  },
  {
    name: 'Premium Potting Mix',
    price: '$24.99',
    rating: 4.7,
    image: '🏺',
    badge: 'New'
  }
];

const careTips = [
  {
    title: 'Watering Schedule',
    tip: 'Water your Cattleya orchids once a week, allowing the potting medium to dry slightly between waterings.',
    icon: '💧'
  },
  {
    title: 'Light Requirements',
    tip: 'Provide bright, indirect light. East or south-facing windows with sheer curtains work perfectly.',
    icon: '☀️'
  },
  {
    title: 'Humidity Control',
    tip: 'Maintain 50-70% humidity around your orchids. Use a humidity tray or room humidifier.',
    icon: '💨'
  }
];

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <CustomerLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.firstName}! 🌺
                </h1>
                <p className="text-purple-100 text-lg">
                  Your orchid journey continues. Discover new blooms and care for your collection.
                </p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <GiftIcon className="w-5 h-5 mr-2" />
                    <span>{user?.loyaltyPoints || 0} Loyalty Points</span>
                  </div>
                  <div className="flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    <span>Member since {new Date(user?.customerSince || '').getFullYear()}</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                  🌸
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => router.push(stat.href)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <button 
                  onClick={() => router.push('/dashboard/orders')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                      {order.image}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{order.product}</p>
                      <p className="text-sm text-gray-600">{order.id}</p>
                      <div className="flex items-center mt-1">
                        {order.status === 'delivered' && <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />}
                        {order.status === 'shipped' && <TruckIcon className="w-4 h-4 text-blue-500 mr-1" />}
                        {order.status === 'processing' && <ClockIcon className="w-4 h-4 text-yellow-500 mr-1" />}
                        <span className={`text-sm font-medium ${
                          order.status === 'delivered' ? 'text-green-600' :
                          order.status === 'shipped' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.amount}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recommended Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recommendedProducts.map((product) => (
                  <div key={product.name} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                      {product.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.badge === 'Popular' ? 'bg-purple-100 text-purple-800' :
                          product.badge === 'Best Seller' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {product.badge}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-2">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.price}</p>
                      <button className="mt-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily Care Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6"
        >
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Daily Orchid Care Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {careTips.map((tip, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{tip.icon}</span>
                  <h4 className="font-semibold text-green-900">{tip.title}</h4>
                </div>
                <p className="text-green-700 text-sm">{tip.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CustomerLayout>
  );
} 