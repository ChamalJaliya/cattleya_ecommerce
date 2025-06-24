'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '@/core/application/stores/useCartStore';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { useWishlistStore } from '@/core/application/stores/useWishlistStore';
import RecentlyViewed from '@/shared/components/RecentlyViewed';
import Header from '@/shared/components/Header';
import toast from 'react-hot-toast';
import { Product } from '@/core/domain/entities/Product';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: ShoppingBagIcon,
    title: 'Premium Quality',
    description: 'Hand-selected orchids from certified growers worldwide with quality guarantees'
  },
  {
    icon: TruckIcon,
    title: 'Expert Delivery',
    description: 'Climate-controlled shipping with specialized packaging for live plant protection'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Care Guarantee',
    description: '30-day health guarantee with comprehensive care guides and expert support'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Specialist Support',
    description: 'Access to certified orchid specialists for personalized care recommendations'
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Plant Enthusiast',
    content: 'The quality is exceptional. My orchids arrived in perfect condition and the care instructions were incredibly detailed.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Interior Designer',
    content: 'Cattleya has become my go-to source for premium orchids. The selection and service are unmatched.',
    rating: 5,
  },
];

export default function HomePage() {
  const { getItemCount, addItem } = useCartStore();
  const { user } = useAuthStore();
  const cartCount = getItemCount();
  const { 
    products, 
    getPersonalizedRecommendations,
    getRecentlyViewed
  } = useProductStore();
  const { 
    isInWishlist: isInWishlistStore, 
    addToWishlist: addToWishlistStore, 
    removeFromWishlist: removeFromWishlistStore,
    fetchWishlist
  } = useWishlistStore();

  const [mounted, setMounted] = useState(false);

  // Fix hydration issues and load wishlist data
  useEffect(() => {
    setMounted(true);
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6);
  const personalizedRecommendations = getPersonalizedRecommendations(6);
  const recentlyViewedProducts = getRecentlyViewed();

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id.toString(),
      quantity: 1
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlistStore(product.id)) {
      removeFromWishlistStore(product.id);
    } else {
      addToWishlistStore(product.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 to-pink-50/30">
      {/* Header Component */}
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-white"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Premium Orchid Collection
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-gray-900 leading-tight mb-6">
                Cultivate
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent">
                  Elegance
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                Discover the world's finest orchids, carefully curated and delivered with expert care guidance for your botanical journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/products"
                  className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Explore Collection
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/about"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-purple-300 hover:text-purple-600 transition-all duration-300 flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
              
              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                    ))}
                  </div>
                  <span>2,000+ Happy Customers</span>
                </div>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[1,2,3,4,5].map((i) => <StarIcon key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative w-full h-[600px] bg-gradient-to-br from-purple-100 via-pink-100 to-white rounded-3xl shadow-2xl overflow-hidden">
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

      {/* Recently Viewed Products */}
      {recentlyViewedProducts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <RecentlyViewed limit={6} />
          </div>
        </section>
      )}

      {/* Personalized Recommendations */}
      {user && personalizedRecommendations.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Picked Just for You
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Based on your browsing history and preferences, we've curated these special orchids just for you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {personalizedRecommendations.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <Link href={`/products/${product.id}`}>
                      <img
                        src={product.images.find(img => img.isMain)?.url || product.images[0]?.url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                      {product.isFeatured && (
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                      {product.isOnSale && product.salePrice && (
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          🔥 Sale
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 shadow-sm"
                      >
                        {isInWishlistStore(product.id) ? (
                          <HeartSolidIcon className="w-4 h-4 text-red-500" />
                        ) : (
                          <HeartIcon className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs text-purple-600 font-medium">
                        {product.category.name}
                      </span>
                    </div>
                    
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-purple-600">
                          ${(product.isOnSale && product.salePrice ? product.salePrice : product.basePrice).toFixed(2)}
                        </span>
                        {product.isOnSale && product.salePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.basePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity === 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <ShoppingCartIcon className="w-4 h-4 mr-2" />
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
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
              Why Choose Cattleya
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to delivering exceptional orchids with unmatched service and expertise.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
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
              Featured Collection
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most sought-after orchid varieties
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-white overflow-hidden">
                  <div className="absolute top-4 left-4">
                    {product.tags && product.tags.length > 0 && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.tags.includes('featured') ? 'bg-purple-100 text-purple-700' :
                        product.tags.includes('bestseller') ? 'bg-green-100 text-green-700' :
                        product.tags.includes('new-arrival') ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.tags.includes('featured') ? 'Featured' :
                         product.tags.includes('bestseller') ? 'Bestseller' :
                         product.tags.includes('new-arrival') ? 'New' :
                         product.tags[0].split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                        }
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500">🌸</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.averageRating) ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.averageRating} ({product.totalReviews || 0} reviews)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.salePrice && product.salePrice < product.basePrice ? product.salePrice.toFixed(2) : product.basePrice.toFixed(2)}
                      </span>
                      {product.salePrice && product.salePrice < product.basePrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center" onClick={() => handleAddToCart(product)}>
                    <ShoppingBagIcon className="w-5 h-5 mr-2" />
                    Add to Collection
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/products"
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1"
            >
              View Complete Collection
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
              What Our Customers Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
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
              Begin Your Orchid Journey
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join our community of orchid enthusiasts and receive expert care tips, exclusive offers, and early access to rare varieties.
            </p>
            <Link 
              href="/auth/register"
              className="inline-flex items-center bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Your Collection
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
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <span className="text-sm">@</span>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Shop</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Orchids</Link></li>
                <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link href="/featured" className="hover:text-white transition-colors">Featured</Link></li>
                <li><Link href="/sale" className="hover:text-white transition-colors">Special Offers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/care-guide" className="hover:text-white transition-colors">Care Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
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
