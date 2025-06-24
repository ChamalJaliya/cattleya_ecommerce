import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, OrchidSize } from '@/core/domain/entities/Product';
import { productsApi, ProductsQuery } from '@/core/infrastructure/api/products.api';
import { ApiError } from '@/core/infrastructure/api/base-api.service';

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  selectedAttributes?: Record<string, string>;
}

interface ProductFilters {
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  rating: number;
  searchQuery: string;
  colors: string[];
  sizes: OrchidSize[];
  bloomSeason: string[];
  careLevel: string[];
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popularity';
  tags: string[];
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductComparison {
  id: string;
  products: Product[];
  createdAt: Date;
}

interface RecentlyViewedItem {
  productId: string;
  viewedAt: Date;
}

interface ProductState {
  // Products
  products: Product[];
  featuredProducts: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  
  // Filters
  filters: ProductFilters;
  searchQuery: string;
  selectedCategory: string | null;
  priceRange: [number, number];
  selectedRating: number | null;
  sortBy: 'name' | 'price' | 'rating' | 'newest';
  sortOrder: 'asc' | 'desc';
  inStockOnly: boolean;
  
  // Enhanced properties
  reviews: Review[];
  comparisons: ProductComparison[];
  recentlyViewed: RecentlyViewedItem[];
  searchSuggestions: string[];
  searchHistory: string[];
  
  // Product actions
  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<ProductState['pagination']>) => void;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number, variant?: string, attributes?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Filter actions
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  resetFilters: () => void;
  updateFilters: (filters: Partial<ProductFilters>) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setPriceRange: (range: [number, number]) => void;
  setSelectedPriceRange: (range: [number, number]) => void;
  setSelectedRating: (rating: number | null) => void;
  setSortBy: (sortBy: 'name' | 'price' | 'rating' | 'newest') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setInStockOnly: (inStock: boolean) => void;

  // API actions
  fetchProducts: (query?: ProductsQuery) => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  getProduct: (id: string) => Promise<Product | null>;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => Promise<void>;

  // Computed
  getFilteredProducts: () => Product[];

  // Search methods
  performAdvancedSearch: (query: string, filters?: Partial<ProductFilters>) => Product[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  getSearchSuggestions: (query: string) => string[];

  // Comparison methods
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  getComparisonProducts: () => Product[];
  isInComparison: (productId: string) => boolean;

  // Recently viewed methods
  addToRecentlyViewed: (productId: string) => void;
  getRecentlyViewed: () => Product[];
  clearRecentlyViewed: () => void;

  // Review methods
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getProductReviews: (productId: string) => Review[];
  updateReviewHelpful: (reviewId: string) => void;
  getAverageRating: (productId: string) => number;

  // Recommendation methods
  getRecommendedProducts: (productId: string, limit?: number) => Product[];
  fetchRecommendedProducts: (productId: string) => Promise<Product[]>;
  getPersonalizedRecommendations: (limit?: number) => Product[];
}

const initialFilters: ProductFilters = {
  category: '',
  priceRange: [0, 1000],
  inStock: false,
  rating: 0,
  searchQuery: '',
  colors: [],
  sizes: [],
  bloomSeason: [],
  careLevel: [],
  sortBy: 'name',
  tags: []
};

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      featuredProducts: [],
      categories: [],
      loading: false,
      error: null,
      
      // Pagination
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
      },
      
      // Cart
      cart: [],
      cartTotal: 0,
      cartCount: 0,
      
      // Filters
      filters: initialFilters,
      searchQuery: '',
      selectedCategory: null,
      priceRange: [0, 1000],
      selectedRating: null,
      sortBy: 'name',
      sortOrder: 'asc',
      inStockOnly: false,
      
      // Enhanced properties
      reviews: [],
      comparisons: [],
      recentlyViewed: [],
      searchSuggestions: [],
      searchHistory: [],

      // Actions
      setProducts: (products) => set({ products }),
      setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => 
        set((state) => ({ pagination: { ...state.pagination, ...pagination } })),

      // API actions
      fetchProducts: async (query = {}) => {
        set({ loading: true, error: null });
        try {
          const response = await productsApi.getProducts(query);
          
          if (response.success) {
            set((state) => ({
              products: response.data.items,
              pagination: {
                ...state.pagination,
                currentPage: response.data.page,
                totalPages: response.data.totalPages,
                totalProducts: response.data.total,
              },
              loading: false
            }));
          } else {
            set({ error: 'Failed to fetch products', loading: false });
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchFeaturedProducts: async () => {
        set({ loading: true, error: null });
        try {
          const response = await productsApi.getFeaturedProducts();
          
          if (response.success) {
            set({ featuredProducts: response.data, loading: false });
          } else {
            set({ error: 'Failed to fetch featured products', loading: false });
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
        }
      },

      searchProducts: async (query: string) => {
        set({ loading: true, error: null });
        try {
          const response = await productsApi.searchProducts(query);
          
          if (response.success) {
            set({ products: response.data, loading: false });
            get().addToSearchHistory(query);
          } else {
            set({ error: 'Failed to search products', loading: false });
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'An unexpected error occurred';
          set({ error: errorMessage, loading: false });
        }
      },

      getProduct: async (id: string) => {
        try {
          const response = await productsApi.getProduct(id);
          
          if (response.success) {
            get().addToRecentlyViewed(id);
            return response.data;
          }
          return null;
        } catch (error) {
          console.error('Failed to fetch product:', error);
          return null;
        }
      },

      // Cart actions
      addToCart: (product, quantity = 1, variant, attributes) => {
        const { cart } = get();
        const existingItemIndex = cart.findIndex(item => 
          item.product.id === product.id && 
          item.selectedVariant === variant
        );

        if (existingItemIndex > -1) {
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += quantity;
          set({ cart: updatedCart });
        } else {
          const newItem: CartItem = {
            product,
            quantity,
            selectedVariant: variant,
            selectedAttributes: attributes
          };
          set({ cart: [...cart, newItem] });
        }

        // Update totals
        const newCart = get().cart;
        const cartTotal = newCart.reduce((total, item) => {
          const price = item.product.salePrice || item.product.basePrice;
          return total + (price * item.quantity);
        }, 0);
        const cartCount = newCart.reduce((count, item) => count + item.quantity, 0);
        
        set({ cartTotal, cartCount });
      },

      removeFromCart: (productId) => {
        const { cart } = get();
        const updatedCart = cart.filter(item => item.product.id !== productId);
        set({ cart: updatedCart });

        // Update totals
        const cartTotal = updatedCart.reduce((total, item) => {
          const price = item.product.salePrice || item.product.basePrice;
          return total + (price * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);
        
        set({ cartTotal, cartCount });
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart } = get();
        const updatedCart = cart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        ).filter(item => item.quantity > 0);
        
        set({ cart: updatedCart });

        // Update totals
        const cartTotal = updatedCart.reduce((total, item) => {
          const price = item.product.salePrice || item.product.basePrice;
          return total + (price * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);
        
        set({ cartTotal, cartCount });
      },

      clearCart: () => set({ cart: [], cartTotal: 0, cartCount: 0 }),

      // Filter actions
      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      resetFilters: () => set({ filters: initialFilters }),
      updateFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setPriceRange: (priceRange) => set({ priceRange }),
      setSelectedPriceRange: (priceRange) => set({ priceRange }),
      setSelectedRating: (selectedRating) => set({ selectedRating }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setInStockOnly: (inStockOnly) => set({ inStockOnly }),

      // Computed
      getFilteredProducts: () => {
        const { products, filters, searchQuery, selectedCategory, priceRange, selectedRating, inStockOnly } = get();
        
        return products.filter(product => {
          // Search query filter
          if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
              !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
          }

          // Category filter
          if (selectedCategory && product.category.slug !== selectedCategory) {
            return false;
          }

          // Price range filter
          const price = product.salePrice || product.basePrice;
          if (price < priceRange[0] || price > priceRange[1]) {
            return false;
          }

          // Rating filter
          if (selectedRating && product.averageRating < selectedRating) {
            return false;
          }

          // Stock filter
          if (inStockOnly && product.stockQuantity <= 0) {
            return false;
          }

          return true;
        });
      },

      // Search methods
      performAdvancedSearch: (query, filters) => {
        // Implementation for advanced search
        return get().products;
      },

      addToSearchHistory: (query) => {
        const { searchHistory } = get();
        const updatedHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
        set({ searchHistory: updatedHistory });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      getSearchSuggestions: (query) => {
        const { products, searchHistory } = get();
        const suggestions = new Set<string>();
        
        // Add from search history
        searchHistory.forEach(term => {
          if (term.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(term);
          }
        });

        // Add from product names
        products.forEach(product => {
          if (product.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(product.name);
          }
        });

        return Array.from(suggestions).slice(0, 5);
      },

      // Comparison methods
      addToComparison: (product) => {
        const { comparisons } = get();
        const currentComparison = comparisons[0] || { id: '1', products: [], createdAt: new Date() };
        
        if (currentComparison.products.length < 4 && !currentComparison.products.find(p => p.id === product.id)) {
          const updatedComparison = {
            ...currentComparison,
            products: [...currentComparison.products, product]
          };
          
          set({ comparisons: [updatedComparison] });
        }
      },

      removeFromComparison: (productId) => {
        const { comparisons } = get();
        const updatedComparisons = comparisons.map(comparison => ({
          ...comparison,
          products: comparison.products.filter(p => p.id !== productId)
        }));
        
        set({ comparisons: updatedComparisons });
      },

      clearComparison: () => set({ comparisons: [] }),

      getComparisonProducts: () => {
        const { comparisons } = get();
        return comparisons[0]?.products || [];
      },

      isInComparison: (productId) => {
        const { comparisons } = get();
        return comparisons[0]?.products.some(p => p.id === productId) || false;
      },

      // Recently viewed methods
      addToRecentlyViewed: (productId) => {
        const { recentlyViewed } = get();
        const updatedViewed = [
          { productId, viewedAt: new Date() },
          ...recentlyViewed.filter(item => item.productId !== productId)
        ].slice(0, 10);
        
        set({ recentlyViewed: updatedViewed });
      },

      getRecentlyViewed: () => {
        const { recentlyViewed, products } = get();
        return recentlyViewed.map(item => 
          products.find(p => p.id === item.productId)
        ).filter(Boolean) as Product[];
      },

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      // Review methods
      addReview: (review) => {
        const { reviews } = get();
        const newReview: Review = {
          ...review,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set({ reviews: [...reviews, newReview] });
      },

      getProductReviews: (productId) => {
        const { reviews } = get();
        return reviews.filter(review => review.productId === productId);
      },

      updateReviewHelpful: (reviewId) => {
        const { reviews } = get();
        const updatedReviews = reviews.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 }
            : review
        );
        
        set({ reviews: updatedReviews });
      },

      getAverageRating: (productId) => {
        const productReviews = get().getProductReviews(productId);
        if (productReviews.length === 0) return 0;
        
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / productReviews.length;
      },

      // Recommendation methods
      getRecommendedProducts: (productId, limit = 4) => {
        const { products } = get();
        const currentProduct = products.find(p => p.id === productId);
        
        if (!currentProduct) return [];
        
        // Simple recommendation based on category and price range
        return products
          .filter(p => 
            p.id !== productId && 
            p.category?.id === currentProduct.category?.id
          )
          .slice(0, limit);
      },

      // Fetch recommendations from backend
      fetchRecommendedProducts: async (productId: string) => {
        try {
          const response = await productsApi.getProductRecommendations(productId);
          
          if (response.success) {
            return response.data;
          }
          return [];
        } catch (error) {
          console.error('Failed to fetch recommendations:', error);
          return [];
        }
      },

      getPersonalizedRecommendations: (limit = 8) => {
        const { products, recentlyViewed, cart } = get();
        
        // Simple personalization based on user activity
        const viewedProductIds = recentlyViewed.map(item => item.productId);
        const cartProductIds = cart.map(item => item.product.id);
        
        const allInteractedIds = [...viewedProductIds, ...cartProductIds];
        
        return products
          .filter(p => !allInteractedIds.includes(p.id))
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, limit);
      },

      // Legacy methods for compatibility
      addProduct: (product) => {
        const { products } = get();
        set({ products: [...products, product] });
      },

      updateProduct: (id, updatedProduct) => {
        const { products } = get();
        const updatedProducts = products.map(p => 
          p.id === id ? { ...p, ...updatedProduct } : p
        );
        set({ products: updatedProducts });
      },

      deleteProduct: async (id) => {
        try {
          const response = await productsApi.deleteProduct(id);
          
          if (response.success) {
            const { products } = get();
            set({ products: products.filter(p => p.id !== id) });
          } else {
            throw new Error('Failed to delete product');
          }
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Failed to delete product';
          throw new Error(errorMessage);
        }
      },
    }),
    {
      name: 'product-store',
      partialize: (state) => ({
        cart: state.cart,
        recentlyViewed: state.recentlyViewed,
        searchHistory: state.searchHistory,
        comparisons: state.comparisons,
        filters: state.filters
      })
    }
  )
); 