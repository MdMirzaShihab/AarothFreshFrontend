import { api } from '@/services/api';
import {
  Product,
  Category,
  CreateProductData,
  UpdateProductData,
  CreateCategoryData,
  UpdateCategoryData,
  ProductFilters,
  CategoryFilters,
  ProductListResponse,
  CategoryListResponse,
  BulkProductOperation,
  BulkOperationResult,
  ProductAnalytics,
  CategoryAnalytics,
  CloudinaryUploadResponse
} from '@/types/product';

// Product API Functions
export const productApi = {
  // Get products with filtering and pagination
  getProducts: (filters?: ProductFilters): Promise<ProductListResponse> =>
    api.get('/admin/products', { params: filters }).then(res => res.data.data),

  // Get single product by ID
  getProduct: (id: string): Promise<Product> =>
    api.get(`/admin/products/${id}`).then(res => res.data.data),

  // Create new product
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const formData = new FormData();
    
    // Add product data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'images') {
        // Handle image files separately
        (value as File[]).forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      } else if (key === 'tags') {
        // Handle array fields
        (value as string[]).forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      } else if (key === 'nutritionInfo' && value) {
        // Handle nested objects
        Object.entries(value).forEach(([nutritionKey, nutritionValue]) => {
          formData.append(`nutritionInfo[${nutritionKey}]`, String(nutritionValue));
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Update existing product
  updateProduct: async (data: UpdateProductData): Promise<Product> => {
    const formData = new FormData();
    const { id, removeImages, ...updateData } = data;
    
    // Add update data
    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'images' && value) {
        // Handle new image files
        (value as File[]).forEach((file, index) => {
          formData.append(`images[${index}]`, file);
        });
      } else if (key === 'tags' && value) {
        // Handle array fields
        (value as string[]).forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      } else if (key === 'nutritionInfo' && value) {
        // Handle nested objects
        Object.entries(value).forEach(([nutritionKey, nutritionValue]) => {
          formData.append(`nutritionInfo[${nutritionKey}]`, String(nutritionValue));
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Add images to remove
    if (removeImages?.length) {
      removeImages.forEach((imageId, index) => {
        formData.append(`removeImages[${index}]`, imageId);
      });
    }

    const response = await api.put(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Delete product
  deleteProduct: (id: string): Promise<void> =>
    api.delete(`/admin/products/${id}`).then(res => res.data.data),

  // Update product status
  updateProductStatus: (id: string, status: string): Promise<Product> =>
    api.patch(`/admin/products/${id}/status`, { status }).then(res => res.data.data),

  // Toggle product featured status
  toggleProductFeatured: (id: string): Promise<Product> =>
    api.patch(`/admin/products/${id}/featured`).then(res => res.data.data),

  // Bulk operations on products
  bulkOperation: (operation: BulkProductOperation): Promise<BulkOperationResult> =>
    api.post('/admin/products/bulk', operation).then(res => res.data.data),

  // Get product analytics
  getProductAnalytics: (id: string, params?: { period?: string }): Promise<ProductAnalytics> =>
    api.get(`/admin/products/${id}/analytics`, { params }).then(res => res.data.data),

  // Approve/reject product (for vendor products)
  approveProduct: (id: string, notes?: string): Promise<Product> =>
    api.post(`/admin/products/${id}/approve`, { notes }).then(res => res.data.data),

  rejectProduct: (id: string, reason: string, notes?: string): Promise<Product> =>
    api.post(`/admin/products/${id}/reject`, { reason, notes }).then(res => res.data.data),
};

// Category API Functions
export const categoryApi = {
  // Get categories with filtering and pagination
  getCategories: (filters?: CategoryFilters): Promise<CategoryListResponse> =>
    api.get('/admin/categories', { params: filters }).then(res => res.data.data),

  // Get single category by ID
  getCategory: (id: string): Promise<Category> =>
    api.get(`/admin/categories/${id}`).then(res => res.data.data),

  // Get category tree (hierarchical structure)
  getCategoryTree: (): Promise<Category[]> =>
    api.get('/admin/categories/tree').then(res => res.data.data),

  // Create new category
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const formData = new FormData();
    
    // Add category data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image' && value) {
        // Handle image file
        formData.append('image', value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await api.post('/admin/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Update existing category
  updateCategory: async (data: UpdateCategoryData): Promise<Category> => {
    const formData = new FormData();
    const { id, removeImage, ...updateData } = data;
    
    // Add update data
    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        // Handle new image file
        formData.append('image', value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Add remove image flag
    if (removeImage) {
      formData.append('removeImage', 'true');
    }

    const response = await api.put(`/admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Delete category
  deleteCategory: (id: string): Promise<void> =>
    api.delete(`/admin/categories/${id}`).then(res => res.data.data),

  // Update category status
  updateCategoryStatus: (id: string, status: 'active' | 'inactive'): Promise<Category> =>
    api.patch(`/admin/categories/${id}/status`, { status }).then(res => res.data.data),

  // Reorder categories
  reorderCategories: (categoryOrders: Array<{ id: string; sortOrder: number }>): Promise<void> =>
    api.post('/admin/categories/reorder', { categoryOrders }).then(res => res.data.data),

  // Get category analytics
  getCategoryAnalytics: (id: string, params?: { period?: string }): Promise<CategoryAnalytics> =>
    api.get(`/admin/categories/${id}/analytics`, { params }).then(res => res.data.data),
};

// Image Upload API Functions
export const imageUploadApi = {
  // Upload images to Cloudinary
  uploadImages: async (files: File[]): Promise<CloudinaryUploadResponse[]> => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    const response = await api.post('/admin/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Delete image from Cloudinary
  deleteImage: (publicId: string): Promise<void> =>
    api.delete(`/admin/upload/images/${publicId}`).then(res => res.data.data),

  // Get image transformation URL
  getTransformedImageUrl: (
    publicId: string, 
    transformations: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    }
  ): string => {
    const baseUrl = 'https://res.cloudinary.com/aaroth-fresh/image/upload';
    const transformationString = Object.entries(transformations)
      .map(([key, value]) => {
        switch (key) {
          case 'width': return `w_${value}`;
          case 'height': return `h_${value}`;
          case 'crop': return `c_${value}`;
          case 'quality': return `q_${value}`;
          case 'format': return `f_${value}`;
          default: return `${key}_${value}`;
        }
      })
      .join(',');
    
    return `${baseUrl}/${transformationString}/${publicId}`;
  },

  // Generate image variants for different use cases
  generateImageVariants: (publicId: string) => ({
    thumbnail: imageUploadApi.getTransformedImageUrl(publicId, {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto'
    }),
    small: imageUploadApi.getTransformedImageUrl(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto'
    }),
    medium: imageUploadApi.getTransformedImageUrl(publicId, {
      width: 600,
      height: 600,
      crop: 'fill',
      quality: 'auto'
    }),
    large: imageUploadApi.getTransformedImageUrl(publicId, {
      width: 1200,
      height: 1200,
      crop: 'fill',
      quality: 'auto'
    }),
    webp: imageUploadApi.getTransformedImageUrl(publicId, {
      width: 600,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      format: 'webp'
    })
  })
};

// Analytics API Functions
export const productAnalyticsApi = {
  // Get overall product performance metrics
  getOverallMetrics: (params?: {
    period?: string;
    categoryId?: string;
    vendorId?: string;
  }): Promise<{
    totalProducts: number;
    activeProducts: number;
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    topPerformingProducts: Array<{
      id: string;
      name: string;
      views: number;
      orders: number;
      revenue: number;
    }>;
    categoryPerformance: Array<{
      categoryId: string;
      categoryName: string;
      productsCount: number;
      totalViews: number;
      totalOrders: number;
      totalRevenue: number;
    }>;
  }> =>
    api.get('/admin/analytics/products', { params }).then(res => res.data.data),

  // Get product performance trends
  getProductTrends: (params?: {
    period?: string;
    productIds?: string[];
  }): Promise<Array<{
    date: string;
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    newProducts: number;
    outOfStockProducts: number;
  }>> =>
    api.get('/admin/analytics/products/trends', { params }).then(res => res.data.data),

  // Get category performance comparison
  getCategoryComparison: (params?: {
    period?: string;
    limit?: number;
  }): Promise<Array<{
    categoryId: string;
    categoryName: string;
    productsCount: number;
    totalViews: number;
    totalOrders: number;
    totalRevenue: number;
    growthRate: number;
    conversionRate: number;
  }>> =>
    api.get('/admin/analytics/categories/comparison', { params }).then(res => res.data.data),

  // Export analytics data
  exportAnalytics: (params: {
    type: 'products' | 'categories' | 'vendors';
    format: 'csv' | 'xlsx' | 'pdf';
    period?: string;
    filters?: any;
  }): Promise<Blob> =>
    api.get('/admin/analytics/export', { 
      params,
      responseType: 'blob'
    }).then(res => res.data),
};