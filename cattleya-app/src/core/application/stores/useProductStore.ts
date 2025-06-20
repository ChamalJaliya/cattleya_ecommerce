import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, OrchidSize } from '@/core/domain/entities/Product';

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
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  
  // Wishlist
  wishlist: Product[];
  
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
  
  // Cart actions
  addToCart: (product: Product, quantity?: number, variant?: string, attributes?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist actions
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
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
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

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
  getPersonalizedRecommendations: (limit?: number) => Product[];
}

// Enhanced mock data with orchid-specific properties and real Unsplash orchid images
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cattleya Purple Majesty',
    slug: 'cattleya-purple-majesty',
    sku: 'CATT-001',
    shortDescription: 'Stunning purple Cattleya with fragrant ruffled blooms',
    description: 'The Cattleya Purple Majesty is a magnificent orchid that produces large, fragrant flowers with deep purple petals and a darker purple lip. This hybrid is known for its robust growth and reliable blooming. The flowers can reach up to 6 inches across and have a delightful fragrance that is most pronounced in the morning. This orchid prefers bright, indirect light and intermediate temperatures.',
    basePrice: 149.99,
    salePrice: 129.99,
    isOnSale: true,
    stockQuantity: 15,
    lowStockThreshold: 5,
    weight: 1.2,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.YOUNG_PLANT,
    availableSizes: [OrchidSize.SAPLING, OrchidSize.YOUNG_PLANT, OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE],
    primaryColors: ['#8B5CF6', '#6B46C1'], // Purple shades
    colorPattern: 'solid',
    
    category: {
      id: 'orchids',
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: [
      {
        id: '1',
        productId: '1',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&crop=center',
        altText: 'Purple Moth Orchid - Main View',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#8B5CF6',
        size: OrchidSize.YOUNG_PLANT
      },
      {
        id: '2',
        productId: '1',
        url: 'https://images.unsplash.com/photo-1583214659441-2b8b40b0d55d?w=800&h=800&fit=crop&crop=center',
        altText: 'Purple Orchid Close-up Photography',
        isMain: false,
        sortOrder: 2,
        createdAt: new Date(),
        color: '#8B5CF6',
        size: OrchidSize.BLOOMING_SIZE
      },
      {
        id: '3',
        productId: '1',
        url: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=800&h=800&fit=crop&crop=center',
        altText: 'Purple Orchid Full Plant',
        isMain: false,
        sortOrder: 3,
        createdAt: new Date(),
        color: '#8B5CF6',
        size: OrchidSize.MATURE
      }
    ],
    attributes: [
      { id: '1', name: 'Bloom Season', value: 'Spring/Fall', type: 'TEXT' },
      { id: '2', name: 'Light Requirements', value: 'Bright, indirect light', type: 'TEXT' },
      { id: '3', name: 'Care Level', value: 'Intermediate', type: 'TEXT' },
      { id: '4', name: 'Fragrance', value: 'Strong', type: 'TEXT' },
      { id: '5', name: 'Flower Size', value: '6 inches', type: 'TEXT' }
    ],
    tags: ['purple', 'fragrant', 'cattleya', 'intermediate', 'spring-blooming'],
    
    isActive: true,
    isFeatured: true,
    isDigital: false,
    
    averageRating: 4.8,
    totalReviews: 24,
    totalSales: 156,
    viewCount: 1250,
    
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    publishedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Phalaenopsis White Elegance',
    slug: 'phalaenopsis-white-elegance',
    sku: 'PHAL-002',
    shortDescription: 'Pure white Phalaenopsis with elegant arching stems',
    description: 'This stunning Phalaenopsis features pristine white flowers with subtle pink centers. Each bloom displays perfect symmetry and can last for months. Known for its graceful arching flower spikes and easy care requirements, this orchid is perfect for beginners. The flowers have a waxy texture and can rebloom multiple times per year with proper care.',
    basePrice: 59.99,
    salePrice: 49.99,
    isOnSale: true,
    stockQuantity: 20,
    lowStockThreshold: 5,
    weight: 0.8,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.MATURE,
    availableSizes: [OrchidSize.YOUNG_PLANT, OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE],
    primaryColors: ['#FFFFFF', '#FDF2F8'], // White with pink hint
    colorPattern: 'solid',
    
    category: {
      id: 'orchids',
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: [
      {
        id: '4',
        productId: '2',
        url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800&h=800&fit=crop&crop=center',
        altText: 'White and Purple Orchid Flowers',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#FFFFFF',
        size: OrchidSize.MATURE
      },
      {
        id: '5',
        productId: '2',
        url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop&crop=center',
        altText: 'White Moth Orchids in Bloom',
        isMain: false,
        sortOrder: 2,
        createdAt: new Date(),
        color: '#FFFFFF',
        size: OrchidSize.BLOOMING_SIZE
      }
    ],
    attributes: [
      { id: '6', name: 'Bloom Season', value: 'Year-round', type: 'TEXT' },
      { id: '7', name: 'Light Requirements', value: 'Medium light', type: 'TEXT' },
      { id: '8', name: 'Care Level', value: 'Beginner', type: 'TEXT' },
      { id: '9', name: 'Flower Pattern', value: 'Pure white', type: 'TEXT' },
      { id: '10', name: 'Bloom Duration', value: '2-3 months', type: 'TEXT' }
    ],
    tags: ['white', 'elegant', 'phalaenopsis', 'beginner', 'long-blooming'],
    
    isActive: true,
    isFeatured: false,
    isDigital: false,
    
    averageRating: 4.6,
    totalReviews: 18,
    totalSales: 89,
    viewCount: 890,
    
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    publishedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Dendrobium Sunset Glow',
    slug: 'dendrobium-sunset-glow',
    sku: 'DEND-003',
    shortDescription: 'Vibrant pink and white orchid with sunset colors',
    description: 'An extraordinary orchid that captures the beauty of a sunset with its warm pink and white blooms. Each flower displays a stunning gradient from deep pink centers to soft white edges. This variety produces clusters of colorful flowers along tall, graceful canes. Known for its spectacular display and relatively easy care.',
    basePrice: 89.99,
    salePrice: undefined,
    isOnSale: false,
    stockQuantity: 12,
    lowStockThreshold: 3,
    weight: 1.0,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.MATURE,
    availableSizes: [OrchidSize.YOUNG_PLANT, OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE],
    primaryColors: ['#EC4899', '#FFFFFF'], // Pink to White
    colorPattern: 'bicolor',
    
    category: {
      id: 'orchids',
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: [
      {
        id: '6',
        productId: '3',
        url: 'https://images.unsplash.com/photo-1617859047452-8510bcf207fd?w=800&h=800&fit=crop&crop=center',
        altText: 'Pink and White Flowers in Black Background',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#EC4899',
        size: OrchidSize.MATURE
      },
      {
        id: '7',
        productId: '3',
        url: 'https://images.unsplash.com/photo-1605110719535-d8b3b8be8d43?w=800&h=800&fit=crop&crop=center',
        altText: 'Pink and White Moth Orchid Close-up',
        isMain: false,
        sortOrder: 2,
        createdAt: new Date(),
        color: '#EC4899',
        size: OrchidSize.BLOOMING_SIZE
      }
    ],
    attributes: [
      { id: '11', name: 'Bloom Season', value: 'Spring/Summer', type: 'TEXT' },
      { id: '12', name: 'Light Requirements', value: 'Bright light', type: 'TEXT' },
      { id: '13', name: 'Care Level', value: 'Intermediate', type: 'TEXT' },
      { id: '14', name: 'Color Pattern', value: 'Pink to white gradient', type: 'TEXT' },
      { id: '15', name: 'Growth Habit', value: 'Tall canes', type: 'TEXT' }
    ],
    tags: ['pink', 'white', 'sunset', 'dendrobium', 'intermediate', 'spring-blooming'],
    
    isActive: true,
    isFeatured: true,
    isDigital: false,
    
    averageRating: 4.7,
    totalReviews: 15,
    totalSales: 67,
    viewCount: 567,
    
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    publishedAt: new Date('2024-02-01')
  },
  {
    id: '4',
    name: 'Oncidium Dancing Lady',
    slug: 'oncidium-dancing-lady',
    sku: 'ONCI-004',
    shortDescription: 'Cheerful yellow oncidium with dancing lady-like flowers',
    description: 'The Oncidium Dancing Lady is beloved for its cheerful yellow flowers that resemble tiny dancing ladies in flowing skirts. This orchid produces long, arching sprays with dozens of small, bright yellow flowers marked with brown spots. It\'s a reliable bloomer that can flower multiple times per year with proper care. The compact size makes it perfect for windowsill growing.',
    basePrice: 74.99,
    salePrice: undefined,
    isOnSale: false,
    stockQuantity: 18,
    lowStockThreshold: 4,
    weight: 0.6,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.YOUNG_PLANT,
    availableSizes: [OrchidSize.SAPLING, OrchidSize.YOUNG_PLANT, OrchidSize.MATURE],
    primaryColors: ['#F59E0B'], // Golden yellow
    colorPattern: 'solid',
    
    category: {
      id: 'orchids',
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: [
      {
        id: '8',
        productId: '4',
        url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&h=800&fit=crop&crop=center',
        altText: 'Single Yellow Flower on Brown Background',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#F59E0B',
        size: OrchidSize.YOUNG_PLANT
      },
      {
        id: '9',
        productId: '4',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&crop=center',
        altText: 'Yellow Orchid Flower Spray',
        isMain: false,
        sortOrder: 2,
        createdAt: new Date(),
        color: '#F59E0B',
        size: OrchidSize.MATURE
      }
    ],
    attributes: [
      { id: '16', name: 'Bloom Season', value: 'Fall/Winter', type: 'TEXT' },
      { id: '17', name: 'Light Requirements', value: 'Bright light', type: 'TEXT' },
      { id: '18', name: 'Care Level', value: 'Intermediate', type: 'TEXT' },
      { id: '19', name: 'Flower Count', value: '50+ per spike', type: 'TEXT' },
      { id: '20', name: 'Growth Habit', value: 'Compact', type: 'TEXT' }
    ],
    tags: ['yellow', 'oncidium', 'dancing-lady', 'compact', 'fall-blooming', 'multiple-flowers'],
    
    isActive: true,
    isFeatured: false,
    isDigital: false,
    
    averageRating: 4.7,
    totalReviews: 31,
    totalSales: 78,
    viewCount: 456,
    
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-30'),
    publishedAt: new Date('2024-01-25')
  },
  {
    id: '5',
    name: 'Premium Orchid Care Kit',
    slug: 'premium-orchid-care-kit',
    sku: 'CARE-005',
    shortDescription: 'Complete care kit with premium orchid bark, fertilizer, and tools',
    description: 'Everything you need to keep your orchids healthy and blooming! This premium care kit includes high-quality orchid bark mix, specialized orchid fertilizer, humidity tray, pruning shears, and a comprehensive care guide. Perfect for beginners or as a gift for orchid enthusiasts.',
    basePrice: 44.99,
    salePrice: 34.99,
    isOnSale: true,
    stockQuantity: 25,
    lowStockThreshold: 8,
    weight: 2.5,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.YOUNG_PLANT, // Not applicable but required
    availableSizes: [OrchidSize.YOUNG_PLANT], // Not applicable but required
    primaryColors: ['#10B981'], // Green for care products
    colorPattern: 'solid',
    
    category: {
      id: 'care-products',
      name: 'Care Products',
      slug: 'care-products',
      description: 'Orchid care essentials',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: [
      {
        id: '10',
        productId: '5',
        url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop&crop=center',
        altText: 'Purple and White Orchids in White Ceramic Vase',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#10B981',
        size: OrchidSize.YOUNG_PLANT
      },
      {
        id: '11',
        productId: '5',
        url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=800&fit=crop&crop=center',
        altText: 'Three White Flowers in Vase on Table',
        isMain: false,
        sortOrder: 2,
        createdAt: new Date(),
        color: '#10B981',
        size: OrchidSize.YOUNG_PLANT
      }
    ],
    attributes: [
      { id: '21', name: 'Bark Mix', value: '2 lbs premium grade', type: 'TEXT' },
      { id: '22', name: 'Fertilizer', value: 'Orchid-specific 20-20-20', type: 'TEXT' },
      { id: '23', name: 'Tools Included', value: 'Pruning shears, humidity tray', type: 'TEXT' },
      { id: '24', name: 'Care Guide', value: 'Comprehensive 20-page guide', type: 'TEXT' },
      { id: '25', name: 'Suitable For', value: 'All orchid types', type: 'TEXT' }
    ],
    tags: ['care-kit', 'fertilizer', 'bark', 'tools', 'beginner-friendly', 'complete-set'],
    
    isActive: true,
    isFeatured: true,
    isDigital: false,
    
    averageRating: 4.9,
    totalReviews: 87,
    totalSales: 234,
    viewCount: 1890,
    
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-10')
  },
  {
    id: '6',
    name: 'Vanda Blue Sapphire',
    slug: 'vanda-blue-sapphire',
    sku: 'VAND-006',
    shortDescription: 'Rare blue Vanda orchid with stunning sapphire-colored blooms',
    description: 'The Vanda Blue Sapphire is one of the most sought-after orchids in the world. This rare beauty produces stunning blue flowers with darker blue veining that resembles precious sapphires. Vandas are epiphytic orchids that prefer bright light and high humidity. This specimen-size plant is perfect for experienced orchid growers looking for something truly special.',
    basePrice: 299.99,
    salePrice: undefined,
    isOnSale: false,
    stockQuantity: 3,
    lowStockThreshold: 1,
    weight: 2.0,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.SPECIMEN,
    availableSizes: [OrchidSize.BLOOMING_SIZE, OrchidSize.SPECIMEN],
    primaryColors: ['#3B82F6', '#1E40AF'], // Blue shades
    colorPattern: 'solid',
    
    category: {
      id: 'orchids',
      name: 'Orchids',
      slug: 'orchids',
      description: 'Beautiful flowering orchids',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    images: [
      {
        id: '12',
        productId: '6',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&crop=center',
        altText: 'Blue and White Flowers in Tilt Shift Lens',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#3B82F6',
        size: OrchidSize.SPECIMEN
      },
      {
        id: '13',
        productId: '6',
        url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800&h=800&fit=crop&crop=center',
        altText: 'Close-up of Purple and White Flower',
        isMain: false,
        sortOrder: 2,
        createdAt: new Date(),
        color: '#3B82F6',
        size: OrchidSize.SPECIMEN
      }
    ],
    attributes: [
      { id: '26', name: 'Bloom Season', value: 'Spring/Summer', type: 'TEXT' },
      { id: '27', name: 'Light Requirements', value: 'Very bright light', type: 'TEXT' },
      { id: '28', name: 'Care Level', value: 'Advanced', type: 'TEXT' },
      { id: '29', name: 'Rarity', value: 'Very rare', type: 'TEXT' },
      { id: '30', name: 'Growth Type', value: 'Epiphytic', type: 'TEXT' }
    ],
    tags: ['blue', 'rare', 'vanda', 'advanced', 'specimen', 'epiphytic'],
    
    isActive: true,
    isFeatured: true,
    isDigital: false,
    
    averageRating: 5.0,
    totalReviews: 8,
    totalSales: 12,
    viewCount: 2340,
    
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
    publishedAt: new Date('2024-02-10')
  }
];

const mockReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'SJ',
    rating: 5,
    title: 'Absolutely stunning orchid!',
    comment: 'This Cattleya Purple Majesty exceeded my expectations. The blooms are gorgeous and the fragrance is incredible. Arrived in perfect condition and has been thriving in my collection.',
    images: [],
    verified: true,
    helpful: 12,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    productId: '1',
    userId: '2',
    userName: 'Mike Chen',
    userAvatar: 'MC',
    rating: 4,
    title: 'Beautiful but needs patience',
    comment: 'Gorgeous orchid with amazing colors. Took a few weeks to settle in after shipping, but now it\'s doing great. Worth the wait!',
    images: [],
    verified: true,
    helpful: 8,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    productId: '2',
    userId: '3',
    userName: 'Emma Davis',
    userAvatar: 'ED',
    rating: 5,
    title: 'Perfect for beginners',
    comment: 'As a beginner, this Phalaenopsis was perfect. Easy to care for and has been blooming for months. The bicolor pattern is stunning!',
    images: [],
    verified: true,
    helpful: 15,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

const defaultFilters: ProductFilters = {
  category: '',
  priceRange: [0, 500] as [number, number],
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
      products: mockProducts,
      featuredProducts: [],
      categories: ['Orchids', 'Care Products', 'Accessories', 'Fertilizers'],
      loading: false,
      error: null,
      cart: [],
      cartTotal: 0,
      cartCount: 0,
      wishlist: [],
      filters: defaultFilters,
      searchQuery: '',
      selectedCategory: null,
      priceRange: [0, 500],
      selectedRating: null,
      sortBy: 'name',
      sortOrder: 'asc',
      inStockOnly: false,
      reviews: mockReviews,
      comparisons: [],
      recentlyViewed: [],
      searchSuggestions: [],
      searchHistory: [],

      // Product actions
      setProducts: (products: Product[]) => set({ products }),
      setFeaturedProducts: (featuredProducts: Product[]) => set({ featuredProducts }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      // Cart actions
      addToCart: (product: Product, quantity = 1, variant?: string, attributes?: Record<string, string>) => {
        const { cart } = get();
        const existingItem = cart.find((item: CartItem) => 
          item.product.id === product.id && 
          item.selectedVariant === variant &&
          JSON.stringify(item.selectedAttributes) === JSON.stringify(attributes)
        );

        if (existingItem) {
          set({
            cart: cart.map((item: CartItem) =>
              item === existingItem
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({
            cart: [...cart, { product, quantity, selectedVariant: variant, selectedAttributes: attributes }]
          });
        }

        // Update cart totals
        const updatedCart = get().cart;
        const cartTotal = updatedCart.reduce((total: number, item: CartItem) => {
          const itemPrice = item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.basePrice;
          return total + (itemPrice * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count: number, item: CartItem) => count + item.quantity, 0);

        set({ cartTotal, cartCount });
      },

      removeFromCart: (productId: string) => {
        const { cart } = get();
        const updatedCart = cart.filter((item: CartItem) => item.product.id !== productId);
        
        const cartTotal = updatedCart.reduce((total: number, item: CartItem) => {
          const itemPrice = item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.basePrice;
          return total + (itemPrice * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count: number, item: CartItem) => count + item.quantity, 0);

        set({ cart: updatedCart, cartTotal, cartCount });
      },

      updateCartQuantity: (productId: string, quantity: number) => {
        const { cart } = get();
        const updatedCart = cart.map((item: CartItem) =>
          item.product.id === productId ? { ...item, quantity } : item
        );

        const cartTotal = updatedCart.reduce((total: number, item: CartItem) => {
          const itemPrice = item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.basePrice;
          return total + (itemPrice * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count: number, item: CartItem) => count + item.quantity, 0);

        set({ cart: updatedCart, cartTotal, cartCount });
      },

      clearCart: () => set({ cart: [], cartTotal: 0, cartCount: 0 }),

      // Wishlist actions
      addToWishlist: (product: Product) => set((state) => ({
        wishlist: state.wishlist.find(item => item.id === product.id) 
          ? state.wishlist 
          : [...state.wishlist, product]
      })),

      removeFromWishlist: (productId: string) => set((state) => ({
        wishlist: state.wishlist.filter(item => item.id !== productId)
      })),

      isInWishlist: (productId: string) => {
        const { wishlist } = get();
        return wishlist.some(item => item.id === productId);
      },

      // Filter actions
      setFilters: (newFilters: Partial<ProductState['filters']>) => {
        const { filters } = get();
        set({ filters: { ...filters, ...newFilters } });
      },

      resetFilters: () => set({ filters: defaultFilters }),

      updateFilters: (newFilters: Partial<ProductFilters>) => {
        const { filters } = get();
        set({ filters: { ...filters, ...newFilters } });
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSelectedCategory: (category: string | null) => set({ selectedCategory: category }),
      setPriceRange: (range: [number, number]) => set({ priceRange: range }),
      setSelectedPriceRange: (range: [number, number]) => set({ priceRange: range }),
      setSelectedRating: (rating: number | null) => set({ selectedRating: rating }),
      setSortBy: (sortBy: 'name' | 'price' | 'rating' | 'newest') => set({ sortBy }),
      setSortOrder: (order: 'asc' | 'desc') => set({ sortOrder: order }),
      setInStockOnly: (inStock: boolean) => set({ inStockOnly: inStock }),

      // API actions (mock)
      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ products: mockProducts, loading: false });
        } catch (error) {
          set({ error: 'Failed to fetch products', loading: false });
        }
      },

      fetchFeaturedProducts: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const featured = mockProducts.filter(product => product.isFeatured);
          set({ featuredProducts: featured, loading: false });
        } catch (error) {
          set({ error: 'Failed to fetch featured products', loading: false });
        }
      },

      searchProducts: async (query: string) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const filtered = mockProducts.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
          );
          set({ products: filtered, loading: false });
        } catch (error) {
          set({ error: 'Failed to search products', loading: false });
        }
      },

      addProduct: (product: Product) => set((state) => ({
        products: [...state.products, product]
      })),
      
      updateProduct: (id: string, productUpdate: Partial<Product>) => set((state) => ({
        products: state.products.map(product => 
          product.id === id ? { ...product, ...productUpdate } : product
        )
      })),
      
      deleteProduct: (id: string) => set((state) => ({
        products: state.products.filter(product => product.id !== id)
      })),

      // Computed
      getFilteredProducts: () => {
        const { 
          products, 
          searchQuery, 
          selectedCategory, 
          priceRange, 
          selectedRating,
          sortBy,
          sortOrder 
        } = get();

        let filtered = products.filter(product => {
          const matchesSearch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
          
          const matchesCategory = !selectedCategory || product.category.name === selectedCategory;
          
          const currentPrice = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;
          const matchesPrice = currentPrice >= priceRange[0] && currentPrice <= priceRange[1];
          
          const matchesRating = !selectedRating || product.averageRating >= selectedRating;
          
          return matchesSearch && matchesCategory && matchesPrice && matchesRating && product.isActive;
        });

        // Sort products
        filtered.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'price':
              const priceA = a.isOnSale && a.salePrice ? a.salePrice : a.basePrice;
              const priceB = b.isOnSale && b.salePrice ? b.salePrice : b.basePrice;
              comparison = priceA - priceB;
              break;
            case 'rating':
              comparison = a.averageRating - b.averageRating;
              break;
            case 'newest':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
          }
          
          return sortOrder === 'desc' ? -comparison : comparison;
        });

        return filtered;
      },

      // Advanced Search Methods
      performAdvancedSearch: (query: string, searchFilters = {}) => {
        const { filters } = get();
        const combinedFilters = { ...filters, searchQuery: query, ...searchFilters };
        
        get().addToSearchHistory(query);
        set({ filters: combinedFilters });
        
        return get().getFilteredProducts();
      },

      addToSearchHistory: (query: string) => {
        if (!query.trim()) return;
        const { searchHistory } = get();
        const newHistory = [query, ...searchHistory.filter((q: string) => q !== query)].slice(0, 10);
        set({ searchHistory: newHistory });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      getSearchSuggestions: (query: string) => {
        if (!query.trim()) return [];
        const { products, searchHistory } = get();
        
        const suggestions = new Set<string>();
        
        searchHistory.forEach((term: string) => {
          if (term.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(term);
          }
        });
        
        products.forEach(product => {
          if (product.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(product.name);
          }
        });
        
        products.forEach(product => {
          product.tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              suggestions.add(tag);
            }
          });
        });
        
        return Array.from(suggestions).slice(0, 8);
      },

      // Comparison Methods
      addToComparison: (product: Product) => {
        const { comparisons } = get();
        const currentComparison = comparisons[0];
        
        if (!currentComparison) {
          set({
            comparisons: [{
              id: Date.now().toString(),
              products: [product],
              createdAt: new Date()
            }]
          });
        } else if (currentComparison.products.length < 4 && !currentComparison.products.find(p => p.id === product.id)) {
          const updatedComparison = {
            ...currentComparison,
            products: [...currentComparison.products, product]
          };
          set({ comparisons: [updatedComparison] });
        }
      },

      removeFromComparison: (productId: string) => {
        const { comparisons } = get();
        if (comparisons[0]) {
          const updatedComparison = {
            ...comparisons[0],
            products: comparisons[0].products.filter(p => p.id !== productId)
          };
          set({ comparisons: updatedComparison.products.length > 0 ? [updatedComparison] : [] });
        }
      },

      clearComparison: () => set({ comparisons: [] }),

      getComparisonProducts: () => {
        const { comparisons } = get();
        return comparisons[0]?.products || [];
      },

      isInComparison: (productId: string) => {
        const { comparisons } = get();
        return comparisons[0]?.products.some(p => p.id === productId) || false;
      },

      // Recently Viewed Methods
      addToRecentlyViewed: (productId: string) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter(item => item.productId !== productId);
        const updated = [{ productId, viewedAt: new Date() }, ...filtered].slice(0, 20);
        set({ recentlyViewed: updated });
      },

      getRecentlyViewed: () => {
        const { recentlyViewed, products } = get();
        return recentlyViewed
          .map(item => products.find(p => p.id === item.productId))
          .filter(Boolean) as Product[];
      },

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      // Review Methods
      addReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
        const { reviews, products } = get();
        const newReview: Review = {
          ...reviewData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          helpful: 0
        };
        
        const updatedReviews = [...reviews, newReview];
        
        const productReviews = updatedReviews.filter(r => r.productId === reviewData.productId);
        const averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        
        const updatedProducts = products.map(product => 
          product.id === reviewData.productId 
            ? { ...product, averageRating, totalReviews: productReviews.length }
            : product
        );
        
        set({ reviews: updatedReviews, products: updatedProducts });
      },

      getProductReviews: (productId: string) => {
        const { reviews } = get();
        return reviews.filter(review => review.productId === productId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      updateReviewHelpful: (reviewId: string) => {
        const { reviews } = get();
        const updatedReviews = reviews.map(review =>
          review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review
        );
        set({ reviews: updatedReviews });
      },

      getAverageRating: (productId: string) => {
        const reviews = get().getProductReviews(productId);
        if (reviews.length === 0) return 0;
        return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      },

      // Recommendation Methods
      getRecommendedProducts: (productId: string, limit = 4) => {
        const { products } = get();
        const currentProduct = products.find(p => p.id === productId);
        if (!currentProduct) return [];

        const recommended = products
          .filter(p => p.id !== productId && p.isActive)
          .map(product => {
            let score = 0;
            
            if (product.category.id === currentProduct.category.id) score += 3;
            
            const commonTags = product.tags.filter((tag: string) => currentProduct.tags.includes(tag));
            score += commonTags.length;
            
            const currentPrice = currentProduct.isOnSale && currentProduct.salePrice ? currentProduct.salePrice : currentProduct.basePrice;
            const productPrice = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;
            const priceDiff = Math.abs(currentPrice - productPrice) / currentPrice;
            if (priceDiff <= 0.3) score += 2;
            
            if (product.averageRating >= 4.5) score += 1;
            if (product.isFeatured) score += 1;
            
            return { product, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.product);

        return recommended;
      },

      getPersonalizedRecommendations: (limit = 6) => {
        const { products, recentlyViewed, wishlist } = get();
        
        const viewedProducts = recentlyViewed
          .map(item => products.find(p => p.id === item.productId))
          .filter(Boolean) as Product[];
        
        const allInterestProducts = [...viewedProducts, ...wishlist];
        const interestCategories = [...new Set(allInterestProducts.map(p => p.category.id))];
        const interestTags = [...new Set(allInterestProducts.flatMap(p => p.tags))];
        
        const recommendations = products
          .filter(p => p.isActive && !wishlist.some(w => w.id === p.id))
          .map(product => {
            let score = 0;
            
            if (interestCategories.includes(product.category.id)) score += 3;
            
            const matchingTags = product.tags.filter((tag: string) => interestTags.includes(tag));
            score += matchingTags.length;
            
            if (product.averageRating >= 4.5) score += 2;
            if (product.totalSales > 50) score += 1;
            if (product.isFeatured) score += 1;
            if (product.isOnSale) score += 1;
            
            return { product, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.product);

        return recommendations;
      }
    }),
    {
      name: 'cattleya-products',
      partialize: (state) => ({
        cart: state.cart,
        cartTotal: state.cartTotal,
        cartCount: state.cartCount,
        wishlist: state.wishlist,
        filters: state.filters,
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        priceRange: state.priceRange,
        selectedRating: state.selectedRating,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        reviews: state.reviews,
        comparisons: state.comparisons,
        recentlyViewed: state.recentlyViewed,
        searchHistory: state.searchHistory,
        searchSuggestions: state.searchSuggestions
      }),
    }
  )
); 