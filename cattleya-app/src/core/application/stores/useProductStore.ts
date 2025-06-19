import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, OrchidSize } from '@/core/domain/entities/Product';

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  selectedAttributes?: Record<string, string>;
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
  filters: {
    category: string;
    priceRange: [number, number];
    inStock: boolean;
    rating: number;
    searchQuery: string;
  };
  
  // Additional filter states
  searchQuery: string;
  selectedCategory: string | null;
  priceRange: [number, number];
  selectedRating: number | null;
  sortBy: 'name' | 'price' | 'rating' | 'newest';
  sortOrder: 'asc' | 'desc';
  
  // Actions
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
  
  // API actions (mock for now)
  fetchProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;

  // New actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // New filters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setPriceRange: (range: [number, number]) => void;
  setSelectedRating: (rating: number | null) => void;
  setSortBy: (sortBy: 'name' | 'price' | 'rating' | 'newest') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;

  // Computed
  getFilteredProducts: () => Product[];
}

// Enhanced mock data with orchid-specific properties
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
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
        altText: 'Cattleya Purple Majesty - Main View',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#8B5CF6',
        size: OrchidSize.YOUNG_PLANT
      },
      {
        id: '2',
        productId: '1',
        url: 'https://images.unsplash.com/photo-1583214659441-2b8b40b0d55d?w=800&h=800&fit=crop',
        altText: 'Cattleya Purple Majesty - Close-up',
        isMain: false,
        sortOrder: 2,
        createdAt: new Date(),
        color: '#8B5CF6',
        size: OrchidSize.BLOOMING_SIZE
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
    name: 'Phalaenopsis Bicolor Sunset',
    slug: 'phalaenopsis-bicolor-sunset',
    sku: 'PHAL-002',
    shortDescription: 'Beautiful bicolor orchid with orange and pink gradient petals',
    description: 'This stunning Phalaenopsis features a unique bicolor pattern with warm orange centers that gradually fade to soft pink edges. Each flower displays this beautiful gradient, creating a sunset-like effect. Known for its long-lasting blooms and easy care requirements, this orchid is perfect for beginners. The flowers can last 2-3 months and the plant may rebloom multiple times per year.',
    basePrice: 89.99,
    salePrice: 74.99,
    isOnSale: true,
    stockQuantity: 8,
    lowStockThreshold: 3,
    weight: 0.8,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.MATURE,
    availableSizes: [OrchidSize.YOUNG_PLANT, OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE],
    primaryColors: ['#F97316', '#EC4899'], // Orange to Pink
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
        id: '3',
        productId: '2',
        url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800&h=800&fit=crop',
        altText: 'Phalaenopsis Bicolor Sunset - Main View',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#F97316',
        size: OrchidSize.MATURE
      }
    ],
    attributes: [
      { id: '6', name: 'Bloom Season', value: 'Year-round', type: 'TEXT' },
      { id: '7', name: 'Light Requirements', value: 'Medium light', type: 'TEXT' },
      { id: '8', name: 'Care Level', value: 'Beginner', type: 'TEXT' },
      { id: '9', name: 'Flower Pattern', value: 'Bicolor gradient', type: 'TEXT' },
      { id: '10', name: 'Bloom Duration', value: '2-3 months', type: 'TEXT' }
    ],
    tags: ['bicolor', 'orange', 'pink', 'phalaenopsis', 'beginner', 'long-blooming'],
    
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
    name: 'Dendrobium Multicolor Rainbow',
    slug: 'dendrobium-multicolor-rainbow',
    sku: 'DEND-003',
    shortDescription: 'Spectacular multicolor orchid with purple, pink, and white petals',
    description: 'An extraordinary Dendrobium that showcases nature\'s artistry with its multicolor blooms. Each flower displays a stunning combination of deep purple, bright pink, and pure white, often with intricate patterns and color bleeding. This variety is known for producing clusters of colorful flowers along tall canes. The plant is deciduous and requires a winter rest period to bloom properly.',
    basePrice: 199.99,
    salePrice: undefined,
    isOnSale: false,
    stockQuantity: 5,
    lowStockThreshold: 2,
    weight: 1.5,
    
    // Orchid-specific properties
    defaultSize: OrchidSize.BLOOMING_SIZE,
    availableSizes: [OrchidSize.MATURE, OrchidSize.BLOOMING_SIZE, OrchidSize.SPECIMEN],
    primaryColors: ['#8B5CF6', '#EC4899', '#FFFFFF'], // Purple, Pink, White
    colorPattern: 'multicolor',
    
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
        productId: '3',
        url: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?w=800&h=800&fit=crop',
        altText: 'Dendrobium Multicolor Rainbow - Main View',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#8B5CF6',
        size: OrchidSize.BLOOMING_SIZE
      }
    ],
    attributes: [
      { id: '11', name: 'Bloom Season', value: 'Spring', type: 'TEXT' },
      { id: '12', name: 'Light Requirements', value: 'Bright light', type: 'TEXT' },
      { id: '13', name: 'Care Level', value: 'Advanced', type: 'TEXT' },
      { id: '14', name: 'Color Pattern', value: 'Multicolor variegated', type: 'TEXT' },
      { id: '15', name: 'Winter Rest', value: 'Required', type: 'TEXT' }
    ],
    tags: ['multicolor', 'purple', 'pink', 'white', 'dendrobium', 'advanced', 'spring-blooming'],
    
    isActive: true,
    isFeatured: true,
    isDigital: false,
    
    averageRating: 4.9,
    totalReviews: 12,
    totalSales: 34,
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
    stockQuantity: 12,
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
        id: '5',
        productId: '4',
        url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=800&fit=crop',
        altText: 'Oncidium Dancing Lady - Main View',
        isMain: true,
        sortOrder: 1,
        createdAt: new Date(),
        color: '#F59E0B',
        size: OrchidSize.YOUNG_PLANT
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
  }
];

const mockCategories = ['Orchids', 'Care Products', 'Accessories', 'Fertilizers'];

const defaultFilters = {
  category: '',
  priceRange: [0, 500] as [number, number],
  inStock: false,
  rating: 0,
  searchQuery: '',
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

      // Product actions
      setProducts: (products) => set({ products }),
      setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Cart actions
      addToCart: (product, quantity = 1, variant, attributes) => {
        const { cart } = get();
        const existingItem = cart.find(item => 
          item.product.id === product.id && 
          item.selectedVariant === variant &&
          JSON.stringify(item.selectedAttributes) === JSON.stringify(attributes)
        );

        const price = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice;

        if (existingItem) {
          set({
            cart: cart.map(item =>
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
        const cartTotal = updatedCart.reduce((total, item) => {
          const itemPrice = item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.basePrice;
          return total + (itemPrice * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);

        set({ cartTotal, cartCount });
      },

      removeFromCart: (productId) => {
        const { cart } = get();
        const updatedCart = cart.filter(item => item.product.id !== productId);
        
        const cartTotal = updatedCart.reduce((total, item) => {
          const itemPrice = item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.basePrice;
          return total + (itemPrice * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);

        set({ cart: updatedCart, cartTotal, cartCount });
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart } = get();
        const updatedCart = cart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        );

        const cartTotal = updatedCart.reduce((total, item) => {
          const itemPrice = item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.basePrice;
          return total + (itemPrice * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);

        set({ cart: updatedCart, cartTotal, cartCount });
      },

      clearCart: () => set({ cart: [], cartTotal: 0, cartCount: 0 }),

      // Wishlist actions
      addToWishlist: (product) => set((state) => ({
        wishlist: state.wishlist.find(item => item.id === product.id) 
          ? state.wishlist 
          : [...state.wishlist, product]
      })),

      removeFromWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.filter(item => item.id !== productId)
      })),

      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.some(item => item.id === productId);
      },

      // Filter actions
      setFilters: (newFilters) => {
        const { filters } = get();
        set({ filters: { ...filters, ...newFilters } });
      },

      resetFilters: () => set({ filters: defaultFilters }),

      // API actions (mock)
      fetchProducts: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API delay
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

      searchProducts: async (query) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          const filtered = mockProducts.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          );
          set({ products: filtered, loading: false });
        } catch (error) {
          set({ error: 'Failed to search products', loading: false });
        }
      },

      // New actions
      addProduct: (product) => set((state) => ({
        products: [...state.products, product]
      })),
      
      updateProduct: (id, productUpdate) => set((state) => ({
        products: state.products.map(product => 
          product.id === id ? { ...product, ...productUpdate } : product
        )
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(product => product.id !== id)
      })),

      // New filters
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setPriceRange: (range) => set({ priceRange: range }),
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),

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
            product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
          
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
        sortOrder: state.sortOrder
      }),
    }
  )
); 