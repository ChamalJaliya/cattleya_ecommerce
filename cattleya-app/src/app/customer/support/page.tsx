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
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    priority: 'normal',
    message: ''
  });

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
    console.log('Form submitted:', contactForm);
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-gray-600 mt-2">We&apos;re here to help you grow beautiful orchids</p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${channel.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{channel.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {channel.availability}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
                    {channel.responseTime}
                  </div>
                </div>

                {channel.phone && (
                  <p className="text-sm font-medium text-gray-900 mb-2">{channel.phone}</p>
                )}
                {channel.email && (
                  <p className="text-sm font-medium text-gray-900 mb-2">{channel.email}</p>
                )}

                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200">
                  {channel.id === 'live-chat' && 'Start Chat'}
                  {channel.id === 'phone' && 'Call Now'}
                  {channel.id === 'email' && 'Send Email'}
                  {channel.id === 'video-call' && 'Book Call'}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                <QuestionMarkCircleIcon className="w-6 h-6 text-purple-600" />
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeCategory === category.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {filteredQuestions.map((faq, index) => {
                  const questionId = `${activeCategory}-${index}`;
                  const isOpen = openQuestions.includes(questionId);
                  
                  return (
                    <motion.div
                      key={questionId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(questionId)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="px-6 pb-4 text-gray-600"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="text-center py-8">
                  <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No questions found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Still Need Help?</h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Issue</option>
                    <option value="care">Plant Care</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Help Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Help Resources
              </h3>
              
              <div className="space-y-3">
                {helpResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.downloadUrl}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{resource.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{resource.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          {resource.type}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Website</span>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Live Chat</span>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600">Delayed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
} 