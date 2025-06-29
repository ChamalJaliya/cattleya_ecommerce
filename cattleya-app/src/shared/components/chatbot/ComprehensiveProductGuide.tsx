import React, { useState } from 'react';
import { ProductSearchResult } from '@/core/infrastructure/api/chatbotApi';
import {
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Flower,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Heart,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronUp,
  Leaf,
  Sprout
} from 'lucide-react';

interface ComprehensiveProductGuideProps {
  product: ProductSearchResult;
  onAddToCart?: (product: ProductSearchResult) => void;
  onAddToWishlist?: (product: ProductSearchResult) => void;
  onGetSimilar?: (product: ProductSearchResult) => void;
}

export const ComprehensiveProductGuide: React.FC<ComprehensiveProductGuideProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onGetSimilar
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['watering']);
  const [showModal, setShowModal] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const careGuides = [
    {
      id: 'watering',
      title: 'Watering Guide',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      content: product.wateringGuide,
      tips: ['Water when top inch is dry', 'Use room temperature water', 'Avoid overwatering']
    },
    {
      id: 'lighting',
      title: 'Light Requirements',
      icon: Sun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      content: product.lightingGuide,
      tips: ['Bright indirect light', 'Avoid direct sunlight', 'East or west window ideal']
    },
    {
      id: 'temperature',
      title: 'Temperature Guide',
      icon: Thermometer,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      content: product.temperatureGuide,
      tips: ['Day: 70-85°F', 'Night: 60-70°F', 'Avoid drafts']
    },
    {
      id: 'humidity',
      title: 'Humidity Guide',
      icon: Wind,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      content: product.humidityGuide,
      tips: ['50-70% humidity', 'Use humidity tray', 'Group plants together']
    },
    {
      id: 'fertilizer',
      title: 'Fertilizer Info',
      icon: Leaf,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      content: product.fertilizerInfo,
      tips: ['Use orchid fertilizer', 'Dilute to half strength', 'Fertilize monthly']
    },
    {
      id: 'repotting',
      title: 'Repotting Guide',
      icon: Sprout,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      content: product.repottingGuide,
      tips: ['Repot every 1-2 years', 'Use orchid bark mix', 'Don\'t repot while blooming']
    }
  ];

  const expertSections = [
    {
      id: 'blooming',
      title: 'Blooming Tips',
      icon: Flower,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      content: product.bloomingTips
    },
    {
      id: 'expert',
      title: 'Expert Tips',
      icon: Lightbulb,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      content: product.expertTips
    },
    {
      id: 'issues',
      title: 'Common Issues',
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      content: product.commonIssues
    }
  ];

  // --- Compact Card for Chat ---
  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Flower size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{product.name}</h2>
                <p className="text-sm opacity-90">Comprehensive Care Guide</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddToWishlist?.(product)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Heart size={20} />
              </button>
              <button
                onClick={() => onAddToCart?.(product)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        {/* Product Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${product.basePrice}</div>
              <div className="text-sm text-gray-600">Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{product.stockQuantity}</div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-sm text-gray-600">Rated 5.0</div>
            </div>
          </div>
        </div>
        {/* Care Guides (compact, single column, dazzling) */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            Essential Care Guides
          </h3>
          <div className="flex flex-col gap-4 mb-6">
            {careGuides.map((guide, idx) => (
              <div key={guide.id} className={`border-2 border-blue-200 rounded-2xl shadow bg-gradient-to-br from-white via-${guide.bgColor.replace('bg-', '')} to-blue-50 p-4 transition-all hover:scale-[1.01] hover:shadow-xl`}>
                <button
                  onClick={() => toggleSection(guide.id)}
                  className="w-full flex items-center justify-between bg-transparent">
                  <div className="flex items-center gap-3">
                    <guide.icon size={20} className={guide.color + ' drop-shadow'} />
                    <span className="font-semibold text-gray-900">{guide.title}</span>
                  </div>
                  {expandedSections.includes(guide.id) ? (
                    <ChevronUp size={16} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-600" />
                  )}
                </button>
                {expandedSections.includes(guide.id) && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-700 mb-2">{guide.content}</p>
                    <div className="space-y-1">
                      {guide.tips?.map((tip, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* View Full Guide Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full mt-2 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-200"
          >
            View Full Guide
          </button>
        </div>
      </div>
      {/* Modal for Full Guide */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-200 max-w-2xl w-full max-h-[95vh] flex flex-col relative animate-fade-in">
            {/* Premium Sticky Header with Left Chevron */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-3xl flex items-center justify-between px-6 py-4 shadow-lg border-b border-blue-200 min-h-[68px]">
              <div className="flex items-center gap-4 w-full">
                {/* Back Chevron Icon */}
                <button
                  onClick={() => setShowModal(false)}
                  className="mr-2 p-2 bg-white/70 hover:bg-white rounded-full shadow border border-purple-200 text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  aria-label="Back to Chat"
                >
                  <ChevronDown size={24} className="text-purple-500 rotate-90" />
                </button>
                {/* Product Name and Subtitle */}
                <div className="leading-tight flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white drop-shadow break-words whitespace-normal">{product.name}</h2>
                  <p className="text-sm text-white/80 break-words whitespace-normal">Comprehensive Orchid Care Guide</p>
                </div>
                {/* Product Icon on Right */}
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ml-2">
                  <Flower size={26} className="text-white" />
                </div>
              </div>
            </div>
            {/* Scrollable Content Area with extra top padding */}
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24"> {/* pt-6 for more space below header, pb-24 for footer space */}
              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${product.basePrice}</div>
                  <div className="text-xs text-gray-600">Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{product.stockQuantity}</div>
                  <div className="text-xs text-gray-600">In Stock</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">Rated 5.0</div>
                </div>
              </div>
              {/* All Care Guides Expanded - Single Column, Dazzling */}
              <h3 className="text-base font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                Essential Care Guides
              </h3>
              <div className="flex flex-col gap-4 mb-6">
                {careGuides.map((guide) => (
                  <div key={guide.id} className={`border-2 border-blue-200 rounded-2xl shadow-xl bg-gradient-to-br from-white via-${guide.bgColor.replace('bg-', '')} to-blue-50 p-3 transition-all hover:scale-[1.01] hover:shadow-2xl`}> 
                    <div className="flex items-center gap-2 mb-1">
                      <guide.icon size={18} className={guide.color + ' drop-shadow'} />
                      <span className="font-bold text-base text-gray-900 drop-shadow">{guide.title}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{guide.content}</p>
                    <div className="space-y-1">
                      {guide.tips?.map((tip, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Expert Sections Expanded */}
              <h3 className="text-base font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-600" />
                Expert Insights
              </h3>
              <div className="flex flex-col gap-4 mb-6">
                {expertSections.map((section) => (
                  <div key={section.id} className={`border-2 border-amber-200 rounded-2xl shadow-xl bg-gradient-to-br from-white via-${section.bgColor.replace('bg-', '')} to-amber-50 p-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <section.icon size={18} className={section.color + ' drop-shadow'} />
                      <span className="font-bold text-base text-gray-900 drop-shadow">{section.title}</span>
                    </div>
                    <p className="text-sm text-gray-700">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Compact Sticky Footer for Action Buttons */}
            <div className="sticky bottom-0 left-0 right-0 z-20 bg-white rounded-b-3xl px-5 py-3 shadow-2xl border-t border-purple-100 flex flex-col gap-2">
              <button
                onClick={() => onAddToCart?.(product)}
                className="w-full bg-blue-600 text-white py-2.5 px-3 rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => onGetSimilar?.(product)}
                className="w-full bg-gray-100 text-gray-700 py-2.5 px-3 rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
              >
                <Flower size={18} />
                Show Similar
              </button>
              <button
                onClick={() => onAddToWishlist?.(product)}
                className="w-full bg-red-50 text-red-600 py-2.5 px-3 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-bold text-base shadow-lg"
              >
                <Heart size={18} />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 