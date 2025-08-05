import { api } from './api';
import {
  Listing,
  Product,
  ProductCategory,
  ListingFilters,
  CreateListingRequest,
  UpdateListingRequest,
  ListingAnalytics,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export class ListingsService {
  /**
   * Get all listings with optional filters
   */
  static async getAll(filters: ListingFilters = {}): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Listing> }>(
      '/listings',
      filters
    );
    return response.data;
  }

  /**
   * Get single listing by ID
   */
  static async getById(id: string): Promise<Listing> {
    const response = await api.get<{ success: boolean; data: Listing }>(`/listings/${id}`);
    return response.data;
  }

  /**
   * Create new listing (vendor only)
   */
  static async create(data: CreateListingRequest): Promise<Listing> {
    const response = await api.post<{ success: boolean; data: Listing }>('/listings', data);
    return response.data;
  }

  /**
   * Update existing listing
   */
  static async update(id: string, data: UpdateListingRequest): Promise<Listing> {
    const response = await api.put<{ success: boolean; data: Listing }>(`/listings/${id}`, data);
    return response.data;
  }

  /**
   * Delete listing
   */
  static async delete(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/listings/${id}`);
    return response;
  }

  /**
   * Get vendor's own listings
   */
  static async getMyListings(filters: Omit<ListingFilters, 'vendor'> = {}): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Listing> }>(
      '/listings/my-listings',
      filters
    );
    return response.data;
  }

  /**
   * Toggle listing availability
   */
  static async toggleAvailability(id: string, isAvailable: boolean): Promise<Listing> {
    const response = await api.patch<{ success: boolean; data: Listing }>(
      `/listings/${id}/availability`,
      { isAvailable }
    );
    return response.data;
  }

  /**
   * Update listing quantity
   */
  static async updateQuantity(id: string, quantity: number): Promise<Listing> {
    const response = await api.patch<{ success: boolean; data: Listing }>(
      `/listings/${id}/quantity`,
      { availableQuantity: quantity }
    );
    return response.data;
  }

  /**
   * Get listing analytics (vendor only)
   */
  static async getAnalytics(id: string): Promise<ListingAnalytics> {
    const response = await api.get<{ success: boolean; data: ListingAnalytics }>(
      `/listings/${id}/analytics`
    );
    return response.data;
  }

  /**
   * Get featured listings
   */
  static async getFeatured(limit: number = 10): Promise<Listing[]> {
    const response = await api.get<{ success: boolean; data: Listing[] }>(
      '/listings/featured',
      { limit }
    );
    return response.data;
  }

  /**
   * Get listings by category
   */
  static async getByCategory(categoryId: string, filters: ListingFilters = {}): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Listing> }>(
      `/listings/category/${categoryId}`,
      filters
    );
    return response.data;
  }

  /**
   * Get listings by vendor
   */
  static async getByVendor(vendorId: string, filters: ListingFilters = {}): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Listing> }>(
      `/listings/vendor/${vendorId}`,
      filters
    );
    return response.data;
  }

  /**
   * Search listings
   */
  static async search(query: string, filters: ListingFilters = {}): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<Listing> }>(
      '/listings/search',
      { q: query, ...filters }
    );
    return response.data;
  }

  /**
   * Upload listing images
   */
  static async uploadImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file =>
      api.uploadFile<{ success: boolean; url: string }>('/upload/listing-image', file)
    );

    const responses = await Promise.all(uploadPromises);
    return responses.map(response => response.url);
  }
}

export class ProductsService {
  /**
   * Get all products
   */
  static async getAll(filters: { category?: string; search?: string } = {}): Promise<Product[]> {
    const response = await api.get<{ success: boolean; data: Product[] }>('/products', filters);
    return response.data;
  }

  /**
   * Get product by ID
   */
  static async getById(id: string): Promise<Product> {
    const response = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data;
  }

  /**
   * Create new product (admin only)
   */
  static async create(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const response = await api.post<{ success: boolean; data: Product }>('/products', data);
    return response.data;
  }

  /**
   * Update product (admin only)
   */
  static async update(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, data);
    return response.data;
  }

  /**
   * Delete product (admin only)
   */
  static async delete(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/products/${id}`);
    return response;
  }
}

export class CategoriesService {
  /**
   * Get all categories
   */
  static async getAll(): Promise<ProductCategory[]> {
    const response = await api.get<{ success: boolean; data: ProductCategory[] }>('/categories');
    return response.data;
  }

  /**
   * Get category by ID
   */
  static async getById(id: string): Promise<ProductCategory> {
    const response = await api.get<{ success: boolean; data: ProductCategory }>(`/categories/${id}`);
    return response.data;
  }

  /**
   * Create new category (admin only)
   */
  static async create(data: Omit<ProductCategory, 'id' | 'createdAt'>): Promise<ProductCategory> {
    const response = await api.post<{ success: boolean; data: ProductCategory }>('/categories', data);
    return response.data;
  }

  /**
   * Update category (admin only)
   */
  static async update(id: string, data: Partial<ProductCategory>): Promise<ProductCategory> {
    const response = await api.put<{ success: boolean; data: ProductCategory }>(`/categories/${id}`, data);
    return response.data;
  }

  /**
   * Delete category (admin only)
   */
  static async delete(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/categories/${id}`);
    return response;
  }
}

// Export services
export default ListingsService;