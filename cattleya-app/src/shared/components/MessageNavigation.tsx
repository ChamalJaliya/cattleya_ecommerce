'use client';

import {
  InboxIcon,
  ShoppingBagIcon,
  ArrowUturnLeftIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  UserIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const categories = [
  { id: 'all', name: 'All Messages', icon: InboxIcon, count: 6, color: 'from-blue-500 to-cyan-500' },
  { id: 'orders', name: 'Orders', icon: ShoppingBagIcon, count: 1, color: 'from-green-500 to-emerald-500' },
  { id: 'refunds', name: 'Refunds', icon: ArrowUturnLeftIcon, count: 1, color: 'from-red-500 to-rose-500' },
  { id: 'alerts', name: 'Alerts', icon: ExclamationCircleIcon, count: 1, color: 'from-yellow-500 to-orange-500' },
  { id: 'support', name: 'Support', icon: ChatBubbleLeftEllipsisIcon, count: 1, color: 'from-purple-500 to-pink-500' },
  { id: 'rewards', name: 'Rewards', icon: StarIcon, count: 1, color: 'from-indigo-500 to-blue-500' },
  { id: 'customers', name: 'Customers', icon: UserIcon, count: 1, color: 'from-teal-500 to-cyan-500' }
];

interface MessageNavigationProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onCompose: () => void;
}

export default function MessageNavigation({ selectedCategory, onSelectCategory, onCompose }: MessageNavigationProps) {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-gray-200/50 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onCompose}
            className="group relative overflow-hidden"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
              <PlusIcon className="w-5 h-5 mr-2" />
              Compose
            </div>
          </button>
        </div>
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
          {categories.map((category) => (
             <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-white shadow-sm text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                <span>{category.name}</span>
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </button>
          ))}
        </div>
      </div>
    </div>
  );
} 