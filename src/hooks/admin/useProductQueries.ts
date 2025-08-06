import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  productApi,
  categoryApi,
  imageUploadApi,
  productAnalyticsApi
} from '@/services/admin/productApi';
import {
  Product,
  Category,
  CreateProductData,
  UpdateProductData,
  CreateCategoryData,
  UpdateCategoryData,
  ProductFilters,
  CategoryFilters,
  BulkProductOperation
} from '@/types/product';

// Query Keys
export const productQueryKeys = {
  products: {
    all: ['admin', 'products'] as const,
    lists: () => ['admin', 'products', 'list'] as const,
    list: (filters: ProductFilters) => ['admin', 'products', 'list', filters] as const,
    details: () => ['admin', 'products', 'detail'] as const,
    detail: (id: string) => ['admin', 'products', 'detail', id] as const,
    analytics: (id: string, params?: any) => ['admin', 'products', 'analytics', id, params] as const,
  },
  categories: {
    all: ['admin', 'categories'] as const,
    lists: () => ['admin', 'categories', 'list'] as const,
    list: (filters: CategoryFilters) => ['admin', 'categories', 'list', filters] as const,
    tree: ['admin', 'categories', 'tree'] as const,
    details: () => ['admin', 'categories', 'detail'] as const,
    detail: (id: string) => ['admin', 'categories', 'detail', id] as const,
    analytics: (id: string, params?: any) => ['admin', 'categories', 'analytics', id, params] as const,
  },
  analytics: {
    overall: (params?: any) => ['admin', 'analytics', 'overall', params] as const,
    trends: (params?: any) => ['admin', 'analytics', 'trends', params] as const,
    comparison: (params?: any) => ['admin', 'analytics', 'comparison', params] as const,
  },
};

// Product Hooks
export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: productQueryKeys.products.list(filters),
    queryFn: () => productApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productQueryKeys.products.detail(id),
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productApi.createProduct(data),
    onSuccess: (newProduct) => {
      // Invalidate product lists
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      
      // Add to cache
      queryClient.setQueryData(
        productQueryKeys.products.detail(newProduct.id),
        newProduct
      );
      
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductData) => productApi.updateProduct(data),
    onSuccess: (updatedProduct) => {
      // Invalidate and update cache
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      queryClient.setQueryData(
        productQueryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
      
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productQueryKeys.products.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete product');
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      productApi.updateProductStatus(id, status),
    onSuccess: (updatedProduct) => {
      // Update cache
      queryClient.setQueryData(
        productQueryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      
      toast.success('Product status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update product status');
    },
  });
};

export const useToggleProductFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.toggleProductFeatured(id),
    onSuccess: (updatedProduct) => {
      // Update cache
      queryClient.setQueryData(
        productQueryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      
      toast.success(
        updatedProduct.featured 
          ? 'Product featured successfully' 
          : 'Product removed from featured'
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle featured status');
    },
  });
};

export const useBulkProductOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (operation: BulkProductOperation) => productApi.bulkOperation(operation),
    onSuccess: (result) => {
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      
      if (result.failedCount > 0) {
        toast.warning(
          `Bulk operation completed: ${result.processedCount} succeeded, ${result.failedCount} failed`
        );
      } else {
        toast.success(
          `Bulk operation completed successfully: ${result.processedCount} products processed`
        );
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Bulk operation failed');
    },
  });
};

export const useApproveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      productApi.approveProduct(id, notes),
    onSuccess: (updatedProduct) => {
      // Update cache
      queryClient.setQueryData(
        productQueryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      
      toast.success('Product approved successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to approve product');
    },
  });
};

export const useRejectProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes?: string }) =>
      productApi.rejectProduct(id, reason, notes),
    onSuccess: (updatedProduct) => {
      // Update cache
      queryClient.setQueryData(
        productQueryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
      queryClient.invalidateQueries({ queryKey: productQueryKeys.products.lists() });
      
      toast.success('Product rejected');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reject product');
    },
  });
};

export const useProductAnalytics = (id: string, params?: { period?: string }) => {
  return useQuery({
    queryKey: productQueryKeys.products.analytics(id, params),
    queryFn: () => productApi.getProductAnalytics(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Category Hooks
export const useCategories = (filters: CategoryFilters) => {
  return useQuery({
    queryKey: productQueryKeys.categories.list(filters),
    queryFn: () => categoryApi.getCategories(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCategoryTree = () => {
  return useQuery({
    queryKey: productQueryKeys.categories.tree,
    queryFn: () => categoryApi.getCategoryTree(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: productQueryKeys.categories.detail(id),
    queryFn: () => categoryApi.getCategory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryApi.createCategory(data),
    onSuccess: (newCategory) => {
      // Invalidate category lists and tree
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.tree });
      
      // Add to cache
      queryClient.setQueryData(
        productQueryKeys.categories.detail(newCategory.id),
        newCategory
      );
      
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryData) => categoryApi.updateCategory(data),
    onSuccess: (updatedCategory) => {
      // Invalidate and update cache
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.tree });
      queryClient.setQueryData(
        productQueryKeys.categories.detail(updatedCategory.id),
        updatedCategory
      );
      
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache and invalidate
      queryClient.removeQueries({ queryKey: productQueryKeys.categories.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.tree });
      
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    },
  });
};

export const useUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      categoryApi.updateCategoryStatus(id, status),
    onSuccess: (updatedCategory) => {
      // Update cache
      queryClient.setQueryData(
        productQueryKeys.categories.detail(updatedCategory.id),
        updatedCategory
      );
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.tree });
      
      toast.success('Category status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update category status');
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryOrders: Array<{ id: string; sortOrder: number }>) =>
      categoryApi.reorderCategories(categoryOrders),
    onSuccess: () => {
      // Invalidate category lists and tree
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories.tree });
      
      toast.success('Categories reordered successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reorder categories');
    },
  });
};

export const useCategoryAnalytics = (id: string, params?: { period?: string }) => {
  return useQuery({
    queryKey: productQueryKeys.categories.analytics(id, params),
    queryFn: () => categoryApi.getCategoryAnalytics(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Image Upload Hooks
export const useUploadImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => imageUploadApi.uploadImages(files),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload images');
    },
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: (publicId: string) => imageUploadApi.deleteImage(publicId),
    onSuccess: () => {
      toast.success('Image deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete image');
    },
  });
};

// Analytics Hooks
export const useOverallProductMetrics = (params?: {
  period?: string;
  categoryId?: string;
  vendorId?: string;
}) => {
  return useQuery({
    queryKey: productQueryKeys.analytics.overall(params),
    queryFn: () => productAnalyticsApi.getOverallMetrics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductTrends = (params?: {
  period?: string;
  productIds?: string[];
}) => {
  return useQuery({
    queryKey: productQueryKeys.analytics.trends(params),
    queryFn: () => productAnalyticsApi.getProductTrends(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategoryComparison = (params?: {
  period?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: productQueryKeys.analytics.comparison(params),
    queryFn: () => productAnalyticsApi.getCategoryComparison(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExportAnalytics = () => {
  return useMutation({
    mutationFn: (params: {
      type: 'products' | 'categories' | 'vendors';
      format: 'csv' | 'xlsx' | 'pdf';
      period?: string;
      filters?: any;
    }) => productAnalyticsApi.exportAnalytics(params),
    onSuccess: (blob, { type, format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_analytics.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export analytics');
    },
  });
};