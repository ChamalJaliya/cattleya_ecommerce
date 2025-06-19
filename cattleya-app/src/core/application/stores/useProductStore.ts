import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/core/domain/entities/Product';

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
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cattleya Orchid - Purple Beauty',
    description: 'A stunning purple Cattleya orchid with large, fragrant blooms. Perfect for experienced orchid enthusiasts.',
    shortDescription: 'Stunning purple Cattleya with fragrant blooms',
    price: 89.99,
    compareAtPrice: 109.99,
    cost: 45.00,
    sku: 'CATT-001',
    barcode: '1234567890123',
    trackQuantity: true,
    quantity: 15,
    allowBackorder: false,
    weight: 2.5,
    dimensions: { length: 12, width: 8, height: 16 },
    category: 'Orchids',
    subcategory: 'Cattleya',
    tags: ['purple', 'fragrant', 'premium', 'flowering'],
    images: ['/images/cattleya-purple-1.jpg', '/images/cattleya-purple-2.jpg'],
    variants: [
      { id: 'small', name: 'Small (4" pot)', price: 89.99, sku: 'CATT-001-S', quantity: 8 },
      { id: 'medium', name: 'Medium (6" pot)', price: 129.99, sku: 'CATT-001-M', quantity: 5 },
      { id: 'large', name: 'Large (8" pot)', price: 189.99, sku: 'CATT-001-L', quantity: 2 },
    ],
    attributes: [
      { name: 'Bloom Season', value: 'Spring/Fall' },
      { name: 'Light Requirements', value: 'Bright, indirect light' },
      { name: 'Care Level', value: 'Intermediate' },
      { name: 'Fragrance', value: 'Strong' },
    ],
    status: 'active',
    featured: true,
    rating: 4.8,
    reviewCount: 24,
    seoTitle: 'Purple Cattleya Orchid - Premium Flowering Plant',
    seoDescription: 'Beautiful purple Cattleya orchid with fragrant blooms. Perfect for collectors.',
    seoKeywords: ['cattleya', 'orchid', 'purple', 'fragrant', 'flowering plant'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Orchid Care Kit - Premium',
    description: 'Complete care kit for orchids including specialized fertilizer, bark mix, and care guide.',
    shortDescription: 'Complete orchid care essentials kit',
    price: 34.99,
    compareAtPrice: 44.99,
    cost: 18.00,
    sku: 'CARE-001',
    barcode: '1234567890124',
    trackQuantity: true,
    quantity: 50,
    allowBackorder: true,
    weight: 1.2,
    dimensions: { length: 10, width: 8, height: 6 },
    category: 'Care Products',
    subcategory: 'Fertilizers',
    tags: ['care', 'fertilizer', 'essential', 'beginner'],
    images: ['/images/care-kit-1.jpg', '/images/care-kit-2.jpg'],
    variants: [],
    attributes: [
      { name: 'Kit Contents', value: 'Fertilizer, Bark Mix, Care Guide' },
      { name: 'Suitable For', value: 'All orchid types' },
      { name: 'Duration', value: '3-4 months supply' },
    ],
    status: 'active',
    featured: true,
    rating: 4.6,
    reviewCount: 18,
    seoTitle: 'Premium Orchid Care Kit - Complete Plant Care Solution',
    seoDescription: 'Everything you need to care for your orchids. Includes fertilizer, bark mix, and expert care guide.',
    seoKeywords: ['orchid care', 'fertilizer', 'plant care', 'orchid supplies'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Phalaenopsis White Elegance',
    description: 'Classic white Phalaenopsis orchid with pristine white blooms. Perfect for beginners and elegant decor.',
    shortDescription: 'Classic white Phalaenopsis orchid',
    price: 49.99,
    compareAtPrice: 59.99,
    cost: 25.00,
    sku: 'PHAL-001',
    barcode: '1234567890125',
    trackQuantity: true,
    quantity: 25,
    allowBackorder: false,
    weight: 1.8,
    dimensions: { length: 10, width: 6, height: 14 },
    category: 'Orchids',
    subcategory: 'Phalaenopsis',
    tags: ['white', 'beginner', 'elegant', 'long-lasting'],
    images: ['/images/phalaenopsis-white-1.jpg', '/images/phalaenopsis-white-2.jpg'],
    variants: [
      { id: 'single', name: 'Single Spike', price: 49.99, sku: 'PHAL-001-S', quantity: 15 },
      { id: 'double', name: 'Double Spike', price: 69.99, sku: 'PHAL-001-D', quantity: 10 },
    ],
    attributes: [
      { name: 'Bloom Season', value: 'Year-round' },
      { name: 'Light Requirements', value: 'Low to medium light' },
      { name: 'Care Level', value: 'Beginner' },
      { name: 'Bloom Duration', value: '2-3 months' },
    ],
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 42,
    seoTitle: 'White Phalaenopsis Orchid - Perfect for Beginners',
    seoDescription: 'Beautiful white Phalaenopsis orchid, ideal for beginners. Long-lasting blooms and easy care.',
    seoKeywords: ['phalaenopsis', 'white orchid', 'beginner orchid', 'moth orchid'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    name: 'Dendrobium Nobile - Spring Beauty',
    description: 'Beautiful Dendrobium Nobile with clusters of pink and white flowers. Blooms in spring with proper care.',
    shortDescription: 'Spring-blooming Dendrobium with pink flowers',
    price: 64.99,
    compareAtPrice: 79.99,
    cost: 32.00,
    sku: 'DEND-001',
    barcode: '1234567890126',
    trackQuantity: true,
    quantity: 12,
    allowBackorder: false,
    weight: 2.0,
    dimensions: { length: 8, width: 8, height: 18 },
    category: 'Orchids',
    subcategory: 'Dendrobium',
    tags: ['pink', 'spring', 'clusters', 'intermediate'],
    images: ['/images/dendrobium-pink-1.jpg', '/images/dendrobium-pink-2.jpg'],
    variants: [],
    attributes: [
      { name: 'Bloom Season', value: 'Spring' },
      { name: 'Light Requirements', value: 'Bright light' },
      { name: 'Care Level', value: 'Intermediate' },
      { name: 'Flower Color', value: 'Pink & White' },
    ],
    status: 'active',
    featured: false,
    rating: 4.5,
    reviewCount: 16,
    seoTitle: 'Dendrobium Nobile Orchid - Spring Flowering Beauty',
    seoDescription: 'Stunning Dendrobium Nobile with pink and white spring blooms. Perfect for intermediate growers.',
    seoKeywords: ['dendrobium', 'spring orchid', 'pink flowers', 'nobile'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '5',
    name: 'Orchid Fertilizer - Bloom Booster',
    description: 'Specialized fertilizer designed to promote healthy blooms and strong root development in orchids.',
    shortDescription: 'Premium bloom-boosting orchid fertilizer',
    price: 19.99,
    compareAtPrice: 24.99,
    cost: 8.00,
    sku: 'FERT-001',
    barcode: '1234567890127',
    trackQuantity: true,
    quantity: 75,
    allowBackorder: true,
    weight: 0.8,
    dimensions: { length: 6, width: 4, height: 8 },
    category: 'Care Products',
    subcategory: 'Fertilizers',
    tags: ['fertilizer', 'bloom', 'nutrition', 'liquid'],
    images: ['/images/fertilizer-1.jpg', '/images/fertilizer-2.jpg'],
    variants: [
      { id: '250ml', name: '250ml Bottle', price: 19.99, sku: 'FERT-001-S', quantity: 50 },
      { id: '500ml', name: '500ml Bottle', price: 34.99, sku: 'FERT-001-L', quantity: 25 },
    ],
    attributes: [
      { name: 'Type', value: 'Liquid Fertilizer' },
      { name: 'NPK Ratio', value: '20-20-20' },
      { name: 'Application', value: 'Weekly feeding' },
      { name: 'Coverage', value: '3-6 months' },
    ],
    status: 'active',
    featured: false,
    rating: 4.7,
    reviewCount: 28,
    seoTitle: 'Premium Orchid Bloom Booster Fertilizer',
    seoDescription: 'Specialized liquid fertilizer for orchids. Promotes healthy blooms and strong growth.',
    seoKeywords: ['orchid fertilizer', 'bloom booster', 'plant nutrition', 'liquid fertilizer'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: '6',
    name: 'Decorative Orchid Pot - Ceramic White',
    description: 'Beautiful white ceramic pot with drainage holes, perfect for displaying your orchids in style.',
    shortDescription: 'Elegant white ceramic orchid pot',
    price: 24.99,
    compareAtPrice: 32.99,
    cost: 12.00,
    sku: 'POT-001',
    barcode: '1234567890128',
    trackQuantity: true,
    quantity: 30,
    allowBackorder: false,
    weight: 1.5,
    dimensions: { length: 6, width: 6, height: 6 },
    category: 'Accessories',
    subcategory: 'Pots',
    tags: ['ceramic', 'white', 'decorative', 'drainage'],
    images: ['/images/pot-white-1.jpg', '/images/pot-white-2.jpg'],
    variants: [
      { id: '4inch', name: '4" Pot', price: 24.99, sku: 'POT-001-S', quantity: 20 },
      { id: '6inch', name: '6" Pot', price: 34.99, sku: 'POT-001-M', quantity: 8 },
      { id: '8inch', name: '8" Pot', price: 44.99, sku: 'POT-001-L', quantity: 2 },
    ],
    attributes: [
      { name: 'Material', value: 'Ceramic' },
      { name: 'Color', value: 'White' },
      { name: 'Drainage', value: 'Multiple holes' },
      { name: 'Style', value: 'Modern minimalist' },
    ],
    status: 'active',
    featured: false,
    rating: 4.4,
    reviewCount: 12,
    seoTitle: 'White Ceramic Orchid Pot - Decorative Plant Container',
    seoDescription: 'Stylish white ceramic pot with proper drainage for orchids. Modern design complements any decor.',
    seoKeywords: ['orchid pot', 'ceramic pot', 'plant container', 'white pot'],
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-14'),
  },
];

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
      products: [],
      featuredProducts: [],
      categories: ['Orchids', 'Care Products', 'Accessories', 'Fertilizers'],
      loading: false,
      error: null,
      cart: [],
      cartTotal: 0,
      cartCount: 0,
      wishlist: [],
      filters: defaultFilters,

      // Product actions
      setProducts: (products) => set({ products }),
      setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Cart actions
      addToCart: (product, quantity = 1, variant, attributes) => {
        const { cart } = get();
        const existingItemIndex = cart.findIndex(
          item => item.product.id === product.id && 
          item.selectedVariant === variant
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += quantity;
          const cartTotal = updatedCart.reduce((total, item) => {
            const price = item.selectedVariant 
              ? item.product.variants?.find(v => v.id === item.selectedVariant)?.price || item.product.price
              : item.product.price;
            return total + (price * item.quantity);
          }, 0);
          const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);
          
          set({ cart: updatedCart, cartTotal, cartCount });
        } else {
          // Add new item
          const newItem: CartItem = {
            product,
            quantity,
            selectedVariant: variant,
            selectedAttributes: attributes,
          };
          const updatedCart = [...cart, newItem];
          const cartTotal = updatedCart.reduce((total, item) => {
            const price = item.selectedVariant 
              ? item.product.variants?.find(v => v.id === item.selectedVariant)?.price || item.product.price
              : item.product.price;
            return total + (price * item.quantity);
          }, 0);
          const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);
          
          set({ cart: updatedCart, cartTotal, cartCount });
        }
      },

      removeFromCart: (productId) => {
        const { cart } = get();
        const updatedCart = cart.filter(item => item.product.id !== productId);
        const cartTotal = updatedCart.reduce((total, item) => {
          const price = item.selectedVariant 
            ? item.product.variants?.find(v => v.id === item.selectedVariant)?.price || item.product.price
            : item.product.price;
          return total + (price * item.quantity);
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
          const price = item.selectedVariant 
            ? item.product.variants?.find(v => v.id === item.selectedVariant)?.price || item.product.price
            : item.product.price;
          return total + (price * item.quantity);
        }, 0);
        const cartCount = updatedCart.reduce((count, item) => count + item.quantity, 0);
        
        set({ cart: updatedCart, cartTotal, cartCount });
      },

      clearCart: () => set({ cart: [], cartTotal: 0, cartCount: 0 }),

      // Wishlist actions
      addToWishlist: (product) => {
        const { wishlist } = get();
        if (!wishlist.find(item => item.id === product.id)) {
          set({ wishlist: [...wishlist, product] });
        }
      },

      removeFromWishlist: (productId) => {
        const { wishlist } = get();
        set({ wishlist: wishlist.filter(item => item.id !== productId) });
      },

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
          const featured = mockProducts.filter(product => product.featured);
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
    }),
    {
      name: 'cattleya-products',
      partialize: (state) => ({
        cart: state.cart,
        cartTotal: state.cartTotal,
        cartCount: state.cartCount,
        wishlist: state.wishlist,
        filters: state.filters,
      }),
    }
  )
); 