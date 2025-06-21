'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  GiftIcon,
  TrophyIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock loyalty data
const loyaltyData = {
  currentPoints: 2847,
  currentTier: 'Gold',
  nextTier: 'Platinum',
  pointsToNextTier: 653,
  totalSpent: 1247.50,
  memberSince: '2023-01-15',
  lifetimePoints: 4521
};

const tiers = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    color: 'from-orange-400 to-orange-600',
    benefits: ['5% off on orders', 'Free shipping over $75', 'Birthday discount'],
    icon: '🥉'
  },
  {
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 2499,
    color: 'from-gray-400 to-gray-600',
    benefits: ['10% off on orders', 'Free shipping over $50', 'Early access to sales', 'Priority support'],
    icon: '🥈'
  },
  {
    name: 'Gold',
    minPoints: 2500,
    maxPoints: 4999,
    color: 'from-yellow-400 to-yellow-600',
    benefits: ['15% off on orders', 'Free shipping on all orders', 'Exclusive products', 'Personal shopper'],
    icon: '🥇'
  },
  {
    name: 'Platinum',
    minPoints: 5000,
    maxPoints: 9999,
    color: 'from-purple-400 to-purple-600',
    benefits: ['20% off on orders', 'VIP customer service', 'Exclusive events', 'Free premium care kit'],
    icon: '💎'
  },
  {
    name: 'Diamond',
    minPoints: 10000,
    maxPoints: Infinity,
    color: 'from-blue-400 to-blue-600',
    benefits: ['25% off on orders', 'White-glove service', 'Exclusive masterclasses', 'Custom orchid consultation'],
    icon: '👑'
  }
];

const availableRewards = [
  {
    id: '1',
    name: '$10 Off Your Next Order',
    description: 'Get $10 discount on orders over $50',
    pointsCost: 500,
    type: 'discount',
    expiryDays: 30,
    image: '💰'
  },
  {
    id: '2',
    name: 'Free Orchid Care Kit',
    description: 'Complete care kit with fertilizer and tools',
    pointsCost: 1200,
    type: 'product',
    expiryDays: 60,
    image: '🧴'
  },
  {
    id: '3',
    name: 'Free Shipping for 3 Months',
    description: 'Enjoy free shipping on all orders for 3 months',
    pointsCost: 800,
    type: 'service',
    expiryDays: 90,
    image: '🚚'
  },
  {
    id: '4',
    name: 'Premium Cattleya Orchid',
    description: 'Beautiful premium Cattleya orchid of your choice',
    pointsCost: 2500,
    type: 'product',
    expiryDays: 45,
    image: '🌺'
  },
  {
    id: '5',
    name: '$25 Off Your Next Order',
    description: 'Get $25 discount on orders over $100',
    pointsCost: 1000,
    type: 'discount',
    expiryDays: 30,
    image: '💳'
  },
  {
    id: '6',
    name: 'VIP Orchid Consultation',
    description: '1-hour personal consultation with our orchid expert',
    pointsCost: 1800,
    type: 'service',
    expiryDays: 120,
    image: '👨‍🏫'
  }
];

const pointsHistory = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Purchase - Order #ORD-001',
    points: 149,
    type: 'earned'
  },
  {
    id: '2',
    date: '2024-01-12',
    description: 'Redeemed - $10 Off Coupon',
    points: -500,
    type: 'redeemed'
  },
  {
    id: '3',
    date: '2024-01-10',
    description: 'Purchase - Order #ORD-002',
    points: 89,
    type: 'earned'
  },
  {
    id: '4',
    date: '2024-01-08',
    description: 'Birthday Bonus',
    points: 250,
    type: 'bonus'
  },
  {
    id: '5',
    date: '2024-01-05',
    description: 'Purchase - Order #ORD-003',
    points: 299,
    type: 'earned'
  }
];

export default function CustomerLoyaltyPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);

  const currentTierIndex = tiers.findIndex(tier => tier.name === loyaltyData.currentTier);
  const nextTierIndex = currentTierIndex + 1;
  const progressPercentage = nextTierIndex < tiers.length 
    ? ((loyaltyData.currentPoints - tiers[currentTierIndex].minPoints) / 
       (tiers[nextTierIndex].minPoints - tiers[currentTierIndex].minPoints)) * 100
    : 100;

  const handleRedeemReward = (rewardId: string) => {
    setRedeemedRewards(prev => [...prev, rewardId]);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrophyIcon },
    { id: 'rewards', name: 'Rewards', icon: GiftIcon },
    { id: 'history', name: 'History', icon: ClockIcon }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Current Status */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Orchid Enthusiast! 🌺</h2>
              <p className="text-purple-100">You&apos;re doing amazing in our loyalty program</p>
            </div>
            <div className="text-6xl">{tiers[currentTierIndex].icon}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-purple-100 text-sm mb-1">Current Points</p>
              <p className="text-2xl font-bold">{loyaltyData.currentPoints.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-purple-100 text-sm mb-1">Current Tier</p>
              <p className="text-2xl font-bold">{loyaltyData.currentTier}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-purple-100 text-sm mb-1">Total Spent</p>
              <p className="text-2xl font-bold">${loyaltyData.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress to Next Tier */}
      {nextTierIndex < tiers.length && (
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-purple-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress to {loyaltyData.nextTier}</h3>
            <span className="text-sm text-gray-600">{loyaltyData.pointsToNextTier} points needed</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.2, duration: 1 }}
            />
          </div>
          
          <p className="text-sm text-gray-600">
            {loyaltyData.currentPoints} / {tiers[nextTierIndex].minPoints} points
          </p>
        </motion.div>
      )}

      {/* Current Tier Benefits */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-purple-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrophyIcon className="w-5 h-5 text-purple-600" />
          <span>{loyaltyData.currentTier} Tier Benefits</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers[currentTierIndex].benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-purple-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Lifetime Points</p>
              <p className="text-2xl font-bold text-gray-900">{loyaltyData.lifetimePoints.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-purple-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-2xl font-bold text-gray-900">{new Date(loyaltyData.memberSince).getFullYear()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-purple-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Rewards</p>
              <p className="text-2xl font-bold text-gray-900">{availableRewards.length}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-6">
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-purple-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <GiftIcon className="w-5 h-5 text-purple-600" />
          <span>Available Rewards</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{reward.image}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{reward.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Expires in {reward.expiryDays} days</span>
                <span className="text-sm font-medium text-purple-600">{reward.pointsCost} points</span>
              </div>
              
              <button
                onClick={() => handleRedeemReward(reward.id)}
                disabled={loyaltyData.currentPoints < reward.pointsCost || redeemedRewards.includes(reward.id)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {redeemedRewards.includes(reward.id) ? 'Redeemed' : 'Redeem Reward'}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-purple-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <ClockIcon className="w-5 h-5 text-purple-600" />
          <span>Points History</span>
        </h3>
        
        <div className="space-y-4">
          {pointsHistory.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  entry.type === 'earned' ? 'bg-green-100' : 
                  entry.type === 'redeemed' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {entry.type === 'earned' ? (
                    <PlusIcon className="w-4 h-4 text-green-600" />
                  ) : entry.type === 'redeemed' ? (
                    <MinusIcon className="w-4 h-4 text-red-600" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{entry.description}</p>
                  <p className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <span className={`font-semibold ${
                entry.points > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {entry.points > 0 ? '+' : ''}{entry.points}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Loyalty Program
                </h1>
                <p className="text-gray-600">Earn points and unlock exclusive rewards</p>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <StarIcon className="w-8 h-8" />
                <span className="text-2xl font-bold">{loyaltyData.currentPoints}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-2 mb-8 shadow-xl shadow-purple-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'rewards' && renderRewards()}
          {activeTab === 'history' && renderHistory()}
        </motion.div>
      </div>
    </CustomerLayout>
  );
} 