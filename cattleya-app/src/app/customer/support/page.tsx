'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import CustomerLayout from '@/shared/components/layouts/CustomerLayout';

// Mock support data
const supportChannels = [
  {
    id: 'live-chat',
    name: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: ChatBubbleLeftRightIcon,
    availability: 'Available now',
    responseTime: 'Instant',
    color: 'from-blue-500 to-cyan-500',
    available: true
  },
  {
    id: 'phone',
    name: 'Phone Support',
    description: 'Speak directly with our orchid experts',
    icon: PhoneIcon,
    availability: 'Mon-Fri 9AM-6PM EST',
    responseTime: 'Immediate',
    color: 'from-green-500 to-emerald-500',
    available: true,
    phone: '+1 (555) 123-ORCHID'
  },
  {
    id: 'email',
    name: 'Email Support',
    description: 'Send us a detailed message about your inquiry',
    icon: EnvelopeIcon,
    availability: 'Always available',
    responseTime: 'Within 24 hours',
    color: 'from-purple-500 to-pink-500',
    available: true,
    email: 'support@cattleya.com'
  },
  {
    id: 'video-call',
    name: 'Video Consultation',
    description: 'Schedule a video call with our orchid specialists',
    icon: VideoCameraIcon,
    availability: 'By appointment',
    responseTime: 'Same day booking',
    color: 'from-orange-500 to-red-500',
    available: true
  }
];

const faqCategories = [
  {
    id: 'orders',
    name: 'Orders & Shipping',
    icon: '📦',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days. We also offer overnight shipping for urgent orders.'
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes! Once your order ships, you\'ll receive a tracking number via email. You can also track your orders in your account dashboard.'
      },
      {
        question: 'What if my orchid arrives damaged?',
        answer: 'We have a 30-day guarantee on all live plants. If your orchid arrives damaged, contact us within 48 hours with photos and we\'ll send a replacement or full refund.'
      },
      {
        question: 'Can I change or cancel my order?',
        answer: 'You can modify or cancel your order within 2 hours of placing it. After that, please contact our support team for assistance.'
      }
    ]
  },
  {
    id: 'care',
    name: 'Orchid Care',
    icon: '🌺',
    questions: [
      {
        question: 'How often should I water my Cattleya orchid?',
        answer: 'Water your Cattleya orchid when the potting medium is almost dry, typically every 7-10 days. The frequency depends on humidity, temperature, and pot size.'
      },
      {
        question: 'What kind of light do orchids need?',
        answer: 'Cattleya orchids prefer bright, indirect light. An east or west-facing window is ideal. Avoid direct sunlight which can burn the leaves.'
      },
      {
        question: 'Why are my orchid leaves turning yellow?',
        answer: 'Yellow leaves can indicate overwatering, natural aging, or insufficient light. Check the roots for rot and adjust your care routine accordingly.'
      },
      {
        question: 'How do I repot my orchid?',
        answer: 'Repot every 2-3 years or when the potting medium breaks down. Use orchid-specific bark mix and ensure good drainage.'
      }
    ]
  },
  {
    id: 'account',
    name: 'Account & Loyalty',
    icon: '👤',
    questions: [
      {
        question: 'How do I earn loyalty points?',
        answer: 'You earn 1 point for every dollar spent. Bonus points are awarded for reviews, referrals, and special promotions.'
      },
      {
        question: 'How do I redeem my loyalty points?',
        answer: 'Visit the Loyalty section in your account to view available rewards. Points can be redeemed for discounts, free products, or services.'
      },
      {
        question: 'Can I change my email address?',
        answer: 'Yes, you can update your email address in your account profile settings. You\'ll need to verify the new email address.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive instructions to reset your password.'
      }
    ]
  },
  {
    id: 'products',
    name: 'Products & Pricing',
    icon: '🏷️',
    questions: [
      {
        question: 'Are your orchids guaranteed to bloom?',
        answer: 'Yes! All our mature orchids are guaranteed to bloom within 12 months with proper care. We provide detailed care instructions with every purchase.'
      },
      {
        question: 'Do you offer bulk discounts?',
        answer: 'Yes, we offer volume discounts for orders of 5 or more plants. Contact our sales team for custom pricing on large orders.'
      },
      {
        question: 'What\'s included with my orchid purchase?',
        answer: 'Each orchid comes with detailed care instructions, a care calendar, and access to our expert support team.'
      },
      {
        question: 'Do you sell orchid supplies?',
        answer: 'Yes! We offer a complete range of orchid care supplies including potting mixes, fertilizers, pots, and tools.'
      }
    ]
  }
];

const helpResources = [
  {
    id: 'care-guide',
    title: 'Complete Orchid Care Guide',
    description: 'Comprehensive guide covering all aspects of orchid care',
    type: 'PDF Guide',
    icon: '📖',
    downloadUrl: '#'
  },
  {
    id: 'video-tutorials',
    title: 'Video Care Tutorials',
    description: 'Step-by-step video guides for orchid care',
    type: 'Video Series',
    icon: '🎥',
    downloadUrl: '#'
  },
  {
    id: 'care-calendar',
    title: 'Seasonal Care Calendar',
    description: 'Month-by-month orchid care schedule',
    type: 'Interactive Calendar',
    icon: '📅',
    downloadUrl: '#'
  },
  {
    id: 'troubleshooting',
    title: 'Problem Diagnosis Tool',
    description: 'Interactive tool to diagnose orchid problems',
    type: 'Interactive Tool',
    icon: '🔧',
    downloadUrl: '#'
  }
];

export default function CustomerSupportPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const filteredQuestions = faqCategories
    .find(cat => cat.id === activeCategory)
    ?.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                  Customer Support
                </h1>
                <p className="text-gray-600">We're here to help with all your orchid needs</p>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <QuestionMarkCircleIcon className="w-8 h-8" />
                <span className="text-2xl font-bold">24/7</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support Channels */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
            <span>Get Help</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${channel.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{channel.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Availability</span>
                      <span className="text-gray-900">{channel.availability}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Response</span>
                      <span className="text-gray-900">{channel.responseTime}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200">
                    Contact Now
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Help Resources */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <BookOpenIcon className="w-5 h-5 text-purple-600" />
            <span>Help Resources</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
              >
                <div className="text-3xl mb-3">{resource.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full">
                  {resource.type}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl shadow-purple-500/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600" />
                <span>Frequently Asked Questions</span>
              </h2>
              
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-1 mb-6">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(`q${index}`)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="font-medium text-gray-900">{question.question}</span>
                    {openQuestions.includes(`q${index}`) ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {openQuestions.includes(`q${index}`) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-600 leading-relaxed">{question.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl shadow-purple-500/5">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <EnvelopeIcon className="w-5 h-5 text-purple-600" />
              <span>Still Need Help?</span>
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200">
                  <option>General Inquiry</option>
                  <option>Order Issue</option>
                  <option>Product Question</option>
                  <option>Technical Support</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </CustomerLayout>
  );
} 