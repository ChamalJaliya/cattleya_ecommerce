'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { customToast } from '@/shared/utils/toast';
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import HeroSection from '@/shared/components/HeroSection';

const contactSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Please enter a valid email'),
  subject: yup.string().required('Subject is required').min(5, 'Subject must be at least 5 characters'),
  message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = yup.InferType<typeof contactSchema>;

const contactInfo = [
  {
    icon: PhoneIcon,
    title: 'Phone Support',
    content: '+1 (555) 123-4567',
    description: 'Mon-Fri, 9AM-6PM EST'
  },
  {
    icon: EnvelopeIcon,
    title: 'Email Us',
    content: 'hello@cattleya.com',
    description: 'We respond within 24 hours'
  },
  {
    icon: MapPinIcon,
    title: 'Visit Our Greenhouse',
    content: '123 Botanical Gardens Drive',
    description: 'Miami, FL 33101'
  },
  {
    icon: ClockIcon,
    title: 'Business Hours',
    content: 'Mon-Fri: 9AM-6PM',
    description: 'Sat-Sun: 10AM-4PM'
  },
];

const faqs = [
  {
    question: 'How do you ensure orchids arrive healthy?',
    answer: 'We use specialized climate-controlled packaging and partner with experienced shipping companies. Each orchid is carefully inspected before shipping and includes detailed care instructions.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day health guarantee. If your orchid arrives damaged or shows signs of poor health within 30 days, we will replace it or provide a full refund.'
  },
  {
    question: 'Do you offer care support after purchase?',
    answer: 'Absolutely! Our expert team provides ongoing care support via email, phone, and our online community. We are committed to your orchid\'s long-term success.'
  },
  {
    question: 'Can I visit your greenhouse?',
    answer: 'Yes! We offer guided tours of our greenhouse facility. Please call ahead to schedule your visit and learn about our growing processes firsthand.'
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      customToast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      console.error('Failed to send message:', error);
      customToast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background to match Collection */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-white" />
        {/* Floating Orbs (optional, for extra effect) */}
        {/* You can copy the motion.divs from Collection if you want the full effect */}
      </div>

      {/* Hero Section */}
      <HeroSection
        badgeText="Get in Touch"
        badgeIcon={<ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-purple-500" />}
        title={<span className="font-serif">Contact Us</span>}
        subtitle="We'd love to hear from you! Reach out for support, partnership, or just to say hello."
        backgroundType="gradient"
      />

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-purple-600 font-semibold mb-1">{info.content}</p>
                <p className="text-gray-600 text-sm">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    id="subject"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.subject ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="What can we help you with?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    {...register('message')}
                    id="message"
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRightIcon className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Map & Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                  Visit Our Greenhouse
                </h3>
                <p className="text-gray-600 mb-6">
                  Experience our collection firsthand at our state-of-the-art greenhouse facility in Miami.
                </p>
                
                <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-white rounded-2xl p-8 h-64 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <MapPinIcon className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">Interactive Map Coming Soon</p>
                    <p className="text-gray-600 text-sm">123 Botanical Gardens Drive, Miami, FL</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Why Choose Cattleya?</h4>
                <ul className="space-y-3">
                  {[
                    'Expert care guidance from certified horticulturists',
                    '30-day health guarantee on all orchids',
                    'Climate-controlled shipping worldwide',
                    'Exclusive access to rare varieties',
                    '24/7 customer support community'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions about our orchids and services.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see your question answered?
            </p>
            <Link 
              href="mailto:hello@cattleya.com"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
            >
              Send us an email
              <ArrowRightIcon className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
              Ready to Start Growing?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Browse our collection of premium orchids and find your perfect botanical companion.
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Shop Collection
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-3xl font-serif font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cattleya
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Cultivating beauty through premium orchids. We bring you the world's finest orchid varieties with expert care and unmatched service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Shop</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Orchids</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/featured" className="hover:text-white transition-colors">Featured</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/care-guide" className="hover:text-white transition-colors">Care Guide</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cattleya. All rights reserved. Crafted with care for orchid enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 