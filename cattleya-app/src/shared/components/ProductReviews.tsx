'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import { useProductStore } from '@/core/application/stores/useProductStore';
import { useAuthStore } from '@/core/application/stores/useAuthStore';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
  className?: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export default function ProductReviews({ productId, className = "" }: ProductReviewsProps) {
  const {
    getProductReviews,
    addReview,
    updateReviewHelpful,
    getAverageRating
  } = useProductStore();
  
  const { user, isAuthenticated } = useAuthStore();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ReviewFormData>();

  const reviews = getProductReviews(productId);
  const averageRating = getAverageRating(productId);
  
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to write a review');
      return;
    }

    if (selectedRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      addReview({
        productId,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.avatar || `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
        rating: selectedRating,
        title: data.title,
        comment: data.comment,
        verified: true, // In real app, check if user actually purchased
        helpful: 0,
        images: []
      });

      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setSelectedRating(0);
      reset();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className={className}>
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-purple-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <p className="text-gray-600">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} • Average rating: {averageRating.toFixed(1)}
            </p>
          </div>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Write Review
          </button>
        )}
      </div>

      {/* Rating Overview */}
      {reviews.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarSolidIcon
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">Based on {reviews.length} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center">
                  <span className="w-8 text-sm text-gray-600">{rating}★</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Rating *
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(rating)}
                      onMouseEnter={() => setHoverRating(rating)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform duration-200 hover:scale-110"
                    >
                      <StarSolidIcon
                        className={`w-8 h-8 ${
                          rating <= (hoverRating || selectedRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">
                    {selectedRating > 0 && (
                      <>
                        {selectedRating}/5 - {
                          selectedRating === 5 ? 'Excellent' :
                          selectedRating === 4 ? 'Good' :
                          selectedRating === 3 ? 'Average' :
                          selectedRating === 2 ? 'Poor' : 'Terrible'
                        }
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Summarize your experience"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  {...register('comment', { required: 'Review is required', minLength: { value: 10, message: 'Review must be at least 10 characters' } })}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.comment ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Share your thoughts about this orchid..."
                />
                {errors.comment && (
                  <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftEllipsisIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience with this orchid!</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              >
                Write First Review
              </button>
            )}
          </div>
        ) : (
          sortedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {review.userAvatar || review.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                      {review.verified && (
                        <CheckBadgeIcon className="w-5 h-5 text-green-500 ml-2" title="Verified Purchase" />
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

              {/* Review Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => updateReviewHelpful(review.id)}
                  className="flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  <HandThumbUpIcon className="w-4 h-4 mr-1" />
                  Helpful ({review.helpful})
                </button>
                
                {review.verified && (
                  <span className="flex items-center text-sm text-green-600">
                    <CheckBadgeIcon className="w-4 h-4 mr-1" />
                    Verified Purchase
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Login Prompt */}
      {!isAuthenticated && (
        <div className="text-center py-8 bg-gray-50 rounded-2xl mt-8">
          <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Share Your Experience</h3>
          <p className="text-gray-600 mb-4">Login to write a review and help other orchid enthusiasts!</p>
          <a
            href="/auth/login"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          >
            Login to Review
          </a>
        </div>
      )}
    </div>
  );
} 