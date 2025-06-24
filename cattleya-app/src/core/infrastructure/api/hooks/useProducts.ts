import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../apiClient';

// Define the filters interface
interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

// Query keys for better cache management
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Get all products with caching
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`/products/public?${params.toString()}`);
      return response.data?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single product with caching
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/products/public/${id}`);
      return response.data?.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes for product details
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Get categories with caching
export const useCategories = (includeTree = false) => {
  return useQuery({
    queryKey: ['categories', includeTree],
    queryFn: async () => {
      const response = await apiClient.get(`/categories/public?includeTree=${includeTree}`);
      return response.data?.data?.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes for categories
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

// Optimistic updates for cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await apiClient.post('/cart/items', { productId, quantity });
      return response.data;
    },
    onMutate: async ({ productId, quantity }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['cart'], (old: unknown) => {
        if (!old) return old;
        // Add optimistic cart update logic here
        return old;
      });
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}; 