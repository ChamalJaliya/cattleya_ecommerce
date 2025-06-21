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
  GiftIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { UserRole } from '@/core/domain/entities/User';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const router = useRouter();
  const cartCount = getItemCount();

  // Mock data for customer dashboard (updated with real cart count)
  const userStats = [
    {
      name: 'Cart Items',
      value: cartCount.toString(),
      change: '+2',
      changeType: 'increase',
      icon: ShoppingBagIcon,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      description: 'Items in cart',
      href: '/customer/cart'
    },
    {
      name: 'Wishlist',
      value: '12',
      change: '+3',
      changeType: 'increase',
      icon: HeartIcon,
      gradient: 'from-red-500 via-pink-500 to-rose-500',
      description: 'Saved items',
      href: '/customer/wishlist'
    },
    {
      name: 'Orders',
      value: '8',
      change: '',
      changeType: 'neutral',
      icon: ClipboardDocumentListIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      description: 'Total orders',
      href: '/customer/orders'
    },
    {
      name: 'Profile',
      value: `${85}%`,
      change: '+5%',
      changeType: 'increase',
      icon: UserIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      description: 'Profile complete',
      href: '/customer/profile'
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
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl -z-10"></div>
          
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
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
                      <span>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm">
                    🌸
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative cursor-pointer"
              onClick={() => router.push(stat.href)}
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent my-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center space-x-2">
                      {stat.change && (
                        <div className={`flex items-center px-2 py-1 rounded-full ${
                          stat.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {stat.changeType === 'increase' && <ArrowUpIcon className="w-3 h-3 mr-1 text-green-600" />}
                          <span className={`text-xs font-bold ${
                            stat.changeType === 'increase' ? 'text-green-700' : 'text-red-700'
                          }`}>{stat.change}</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500">{stat.description}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <button 
                    onClick={() => router.push('/customer/orders')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:scale-105 transition-transform duration-200"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div 
                      key={order.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="group/item relative overflow-hidden"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-5 group-hover/item:opacity-20 transition duration-300"></div>
                      <div className="relative flex items-center space-x-4 p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-100/50 transition-all duration-200">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
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
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Recommended Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:scale-105 transition-transform duration-200">
                    View all
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recommendedProducts.map((product, index) => (
                    <motion.div 
                      key={product.name} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="group/item relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-5 group-hover/item:opacity-20 transition duration-300"></div>
                      <div className="relative flex items-center space-x-4 p-4 bg-gray-50/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-gray-100/50 transition-all duration-200">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                          {product.image}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              product.badge === 'Popular' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              product.badge === 'Best Seller' ? 'bg-green-100 text-green-800 border-green-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
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
                          <button className="group/btn relative overflow-hidden mt-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm rounded-lg hover:shadow-md transition-all duration-200">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-0 group-hover/btn:opacity-20 transition duration-300"></div>
                            <div className="relative">Add to Cart</div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Daily Care Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="group relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Daily Orchid Care Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {careTips.map((tip, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group/tip relative overflow-hidden"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl blur opacity-10 group-hover/tip:opacity-20 transition duration-300"></div>
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{tip.icon}</span>
                      <h4 className="font-semibold text-green-900">{tip.title}</h4>
                    </div>
                    <p className="text-green-700 text-sm">{tip.tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </CustomerLayout>
  );
} 