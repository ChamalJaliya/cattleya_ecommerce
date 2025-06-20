'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  GlobeAltIcon,
  UserGroupIcon,
  AcademicCapIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Header from '@/shared/components/Header';

const values = [
  {
    icon: HeartIcon,
    title: 'Passion for Excellence',
    description: 'Every orchid in our collection is chosen with meticulous care, ensuring only the finest specimens reach our customers.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Network',
    description: 'We partner with certified growers worldwide to bring you rare and exotic orchid varieties from every continent.'
  },
  {
    icon: UserGroupIcon,
    title: 'Community First',
    description: 'Building a thriving community of orchid enthusiasts through education, support, and shared passion.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Expert Knowledge',
    description: 'Our team of certified horticulturists provides unparalleled expertise in orchid care and cultivation.'
  },
];

const stats = [
  { number: '10+', label: 'Years of Excellence' },
  { number: '500+', label: 'Orchid Varieties' },
  { number: '15,000+', label: 'Happy Customers' },
  { number: '98%', label: 'Satisfaction Rate' },
];

const team = [
  {
    name: 'Dr. Elena Rodriguez',
    role: 'Chief Horticulturist',
    bio: 'PhD in Botanical Sciences with 15+ years specializing in orchid genetics and cultivation.',
    image: '/api/placeholder/300/300'
  },
  {
    name: 'Marcus Chen',
    role: 'Head of Operations',
    bio: 'Expert in sustainable growing practices and international orchid trade regulations.',
    image: '/api/placeholder/300/300'
  },
  {
    name: 'Sarah Williams',
    role: 'Customer Experience Lead',
    bio: 'Passionate about connecting people with their perfect orchid companions.',
    image: '/api/placeholder/300/300'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Component */}
      <Header 
        title="About Cattleya"
        subtitle="Cultivating beauty and wonder through the world's finest orchid collection"
      />

      {/* Decorative Background */}
      <div className="relative pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-white"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
                Our Journey
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2014 by a group of passionate botanists, Cattleya began as a small greenhouse operation with a simple mission: to share the extraordinary beauty of orchids with the world.
                </p>
                <p>
                  What started with just 50 varieties has grown into one of the world's most respected orchid collections, featuring over 500 rare and exotic species from every corner of the globe.
                </p>
                <p>
                  Today, we're proud to serve over 15,000 customers worldwide, from beginners taking their first steps into orchid care to seasoned collectors seeking the rarest specimens.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full h-[500px] bg-gradient-to-br from-purple-100 via-pink-100 to-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl">🌺</div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-40 blur-xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do, from sourcing to customer care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-gray-50 p-8 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
              Meet Our Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate team behind Cattleya's success, bringing decades of combined expertise.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-white overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500">👨‍🔬</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-purple-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
              Recognition & Awards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence has been recognized by leading horticultural organizations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { year: '2023', award: 'Best Online Orchid Retailer', org: 'International Orchid Society' },
              { year: '2022', award: 'Excellence in Customer Service', org: 'Horticultural Trade Association' },
              { year: '2021', award: 'Sustainable Growing Practices', org: 'Green Business Council' },
            ].map((award, index) => (
              <motion.div
                key={award.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-2">{award.year}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{award.award}</h3>
                <p className="text-gray-600">{award.org}</p>
              </motion.div>
            ))}
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
              Join Our Community
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Become part of a passionate community dedicated to the art and science of orchid cultivation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register"
                className="inline-flex items-center bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Your Journey
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                Get in Touch
              </Link>
            </div>
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