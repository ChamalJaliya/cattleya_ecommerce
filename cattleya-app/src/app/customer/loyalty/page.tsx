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
  CheckCircleIcon
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, Orchid Enthusiast! 🌺</h2>
            <p className="text-purple-100">You&apos;re doing amazing in our loyalty program</p>
          </div>
          <div className="text-6xl">{tiers[currentTierIndex].icon}</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-purple-100 text-sm">Current Points</p>
            <p className="text-3xl font-bold">{loyaltyData.currentPoints.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-purple-100 text-sm">Current Tier</p>
            <p className="text-3xl font-bold">{loyaltyData.currentTier}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-purple-100 text-sm">Total Spent</p>
            <p className="text-3xl font-bold">${loyaltyData.totalSpent}</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Tier */}
      {nextTierIndex < tiers.length && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Progress to {loyaltyData.nextTier}</h3>
            <span className="text-sm text-gray-600">
              {loyaltyData.pointsToNextTier} points to go
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>{tiers[currentTierIndex].minPoints}</span>
              <span>{tiers[nextTierIndex].minPoints}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tier Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Tier Benefits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${tiers[currentTierIndex].color} rounded-xl flex items-center justify-center text-white text-xl mr-4`}>
              {tiers[currentTierIndex].icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your {loyaltyData.currentTier} Benefits</h3>
              <p className="text-gray-600 text-sm">Active now</p>
            </div>
          </div>
          <ul className="space-y-2">
            {tiers[currentTierIndex].benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Tier Benefits */}
        {nextTierIndex < tiers.length && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${tiers[nextTierIndex].color} rounded-xl flex items-center justify-center text-white text-xl mr-4`}>
                {tiers[nextTierIndex].icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Unlock {loyaltyData.nextTier}</h3>
                <p className="text-gray-600 text-sm">{loyaltyData.pointsToNextTier} points away</p>
              </div>
            </div>
            <ul className="space-y-2">
              {tiers[nextTierIndex].benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <StarSolidIcon className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* All Tiers Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Loyalty Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {tiers.map((tier, index) => (
            <div 
              key={tier.name} 
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                tier.name === loyaltyData.currentTier 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{tier.icon}</div>
                <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {tier.minPoints}+ points
                </p>
                {tier.name === loyaltyData.currentTier && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableRewards.map((reward, index) => (
        <motion.div
          key={reward.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
              {reward.image}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{reward.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost:</span>
              <span className="font-semibold text-purple-600">{reward.pointsCost} points</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expires:</span>
              <span className="text-sm text-gray-900">{reward.expiryDays} days</span>
            </div>
          </div>

          <button
            onClick={() => handleRedeemReward(reward.id)}
            disabled={loyaltyData.currentPoints < reward.pointsCost || redeemedRewards.includes(reward.id)}
            className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              redeemedRewards.includes(reward.id)
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : loyaltyData.currentPoints >= reward.pointsCost
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {redeemedRewards.includes(reward.id) 
              ? 'Redeemed ✓' 
              : loyaltyData.currentPoints >= reward.pointsCost 
              ? 'Redeem Now' 
              : 'Not Enough Points'
            }
          </button>
        </motion.div>
      ))}
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Points History</h3>
        <p className="text-gray-600 text-sm">Track your earning and spending activity</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {pointsHistory.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                transaction.type === 'earned' ? 'bg-green-100' :
                transaction.type === 'redeemed' ? 'bg-red-100' : 'bg-purple-100'
              }`}>
                {transaction.type === 'earned' ? (
                  <ShoppingBagIcon className="w-5 h-5 text-green-600" />
                ) : transaction.type === 'redeemed' ? (
                  <GiftIcon className="w-5 h-5 text-red-600" />
                ) : (
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-600">{transaction.date}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`font-semibold ${
                transaction.points > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} pts
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <CustomerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
          <p className="text-gray-600 mt-2">Earn points, unlock rewards, and enjoy exclusive benefits</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'rewards' && renderRewards()}
          {activeTab === 'history' && renderHistory()}
        </motion.div>
      </div>
    </CustomerLayout>
  );
} 