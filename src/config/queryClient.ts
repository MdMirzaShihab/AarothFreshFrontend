import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/stores/notificationStore';

// Create a new QueryClient with optimized configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Background refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network configuration
      networkMode: 'online',
      
      // Error handling
      throwOnError: false,
      
      // Performance optimization
      structuralSharing: true,
    },
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount, error: any) => {
        // Don't retry client errors or network errors that are likely permanent
        if (
          error?.response?.status >= 400 && error?.response?.status < 500 ||
          error?.code === 'NETWORK_ERROR'
        ) {
          return false;
        }
        return failureCount < 2; // Retry mutations only once
      },
      retryDelay: 1000,
      
      // Network configuration
      networkMode: 'online',
      
      // Global error handling for mutations
      onError: (error: any) => {
        // Show error toast for failed mutations
        const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
        toast.error('Operation Failed', errorMessage);
      },
    },
  },
});

// Query key factories for consistent cache management
export const queryKeys = {
  // Authentication
  auth: {
    user: ['auth', 'user'] as const,
    profile: ['auth', 'profile'] as const,
  },
  
  // Listings
  listings: {
    all: ['listings'] as const,
    list: (filters?: any) => ['listings', 'list', filters] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
    featured: ['listings', 'featured'] as const,
    myListings: (filters?: any) => ['listings', 'my', filters] as const,
    byCategory: (categoryId: string, filters?: any) => ['listings', 'category', categoryId, filters] as const,
    byVendor: (vendorId: string, filters?: any) => ['listings', 'vendor', vendorId, filters] as const,
    search: (query: string, filters?: any) => ['listings', 'search', query, filters] as const,
    analytics: (id: string) => ['listings', 'analytics', id] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    list: (filters?: any) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    restaurant: (filters?: any) => ['orders', 'restaurant', filters] as const,
    vendor: (filters?: any) => ['orders', 'vendor', filters] as const,
    byStatus: (status: string, filters?: any) => ['orders', 'status', status, filters] as const,
    recent: (limit?: number) => ['orders', 'recent', limit] as const,
    analytics: (dateRange?: any) => ['orders', 'analytics', dateRange] as const,
    tracking: (id: string) => ['orders', 'tracking', id] as const,
    summary: ['orders', 'summary'] as const,
  },
  
  // Products
  products: {
    all: ['products'] as const,
    list: (filters?: any) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
  },
  
  // Admin
  admin: {
    users: (filters?: any) => ['admin', 'users', filters] as const,
    analytics: ['admin', 'analytics'] as const,
  },
} as const;

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all listings
  listings: () => queryClient.invalidateQueries({ queryKey: queryKeys.listings.all }),
  
  // Invalidate specific listing
  listing: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) }),
  
  // Invalidate all orders
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  
  // Invalidate specific order
  order: (id: string) => queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) }),
  
  // Invalidate user profile
  profile: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile }),
  
  // Invalidate all data (use sparingly)
  all: () => queryClient.invalidateQueries(),
};

// Cache prefetching helpers
export const prefetchQueries = {
  // Prefetch featured listings for homepage
  featuredListings: () => 
    queryClient.prefetchQuery({
      queryKey: queryKeys.listings.featured,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }),
    
  // Prefetch categories
  categories: () =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.all,
      staleTime: 30 * 60 * 1000, // 30 minutes (categories change rarely)
    }),
};

// Error boundary for React Query errors
export const handleQueryError = (error: any, errorInfo: any) => {
  console.error('React Query Error:', error, errorInfo);
  
  // Log to error reporting service in production
  if (import.meta.env.PROD) {
    // Add error reporting logic here (e.g., Sentry)
    console.error('Production Query Error:', { error, errorInfo });
  }
};

// Development tools configuration
export const queryClientConfig = {
  // Enable React Query DevTools in development
  devtools: import.meta.env.DEV,
  
  // Additional configuration for development
  ...(import.meta.env.DEV && {
    defaultOptions: {
      queries: {
        // More aggressive refetching in development
        staleTime: 1 * 60 * 1000, // 1 minute
      },
    },
  }),
};