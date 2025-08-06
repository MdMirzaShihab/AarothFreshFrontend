import { api } from '../api';
import {
  AdminDashboardMetrics,
  UserListParams,
  UserListResponse,
  AdminUser,
  VendorApprovalRequest,
  AdminProduct,
  ProductCategory,
  AnalyticsData,
  BulkOperation,
  BulkOperationResult,
  ApiResponse,
  PaginatedResponse
} from '@/types/admin';

// Admin Dashboard API
export const adminDashboardApi = {
  // Get dashboard metrics
  getMetrics: (): Promise<AdminDashboardMetrics> =>
    api.get('/admin/dashboard/metrics').then(res => res.data.data),

  // Get recent activities
  getRecentActivities: (limit: number = 10) =>
    api.get(`/admin/dashboard/activities?limit=${limit}`).then(res => res.data.data),
};

// User Management API
export const userManagementApi = {
  // Get users list with filtering and pagination
  getUsers: (params: UserListParams): Promise<UserListResponse> =>
    api.get('/admin/users', { params }).then(res => res.data.data),

  // Get single user details
  getUser: (userId: string): Promise<AdminUser> =>
    api.get(`/admin/users/${userId}`).then(res => res.data.data),

  // Update user status
  updateUserStatus: (userId: string, status: string): Promise<ApiResponse<AdminUser>> =>
    api.put(`/admin/users/${userId}/status`, { status }).then(res => res.data),

  // Update user role
  updateUserRole: (userId: string, role: string): Promise<ApiResponse<AdminUser>> =>
    api.put(`/admin/users/${userId}/role`, { role }).then(res => res.data),

  // Delete user
  deleteUser: (userId: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/users/${userId}`).then(res => res.data),

  // Bulk operations
  bulkOperation: (operation: BulkOperation): Promise<BulkOperationResult> =>
    api.post('/admin/users/bulk', operation).then(res => res.data.data),
};

// Vendor Approval API
export const vendorApprovalApi = {
  // Get pending vendor approvals
  getPendingApprovals: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<VendorApprovalRequest>> =>
    api.get('/admin/vendor-approvals', { params }).then(res => res.data.data),

  // Get vendor approval details
  getApprovalDetails: (approvalId: string): Promise<VendorApprovalRequest> =>
    api.get(`/admin/vendor-approvals/${approvalId}`).then(res => res.data.data),

  // Approve vendor
  approveVendor: (approvalId: string, data?: { notes?: string }): Promise<ApiResponse<VendorApprovalRequest>> =>
    api.post(`/admin/vendor-approvals/${approvalId}/approve`, data).then(res => res.data),

  // Reject vendor
  rejectVendor: (approvalId: string, data: { reason: string; notes?: string }): Promise<ApiResponse<VendorApprovalRequest>> =>
    api.post(`/admin/vendor-approvals/${approvalId}/reject`, data).then(res => res.data),

  // Get vendor documents
  getVendorDocuments: (approvalId: string) =>
    api.get(`/admin/vendor-approvals/${approvalId}/documents`).then(res => res.data.data),
};

// Product Management API
export const productManagementApi = {
  // Get products list
  getProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    vendor?: string;
    status?: string;
  }): Promise<PaginatedResponse<AdminProduct>> =>
    api.get('/admin/products', { params }).then(res => res.data.data),

  // Get single product
  getProduct: (productId: string): Promise<AdminProduct> =>
    api.get(`/admin/products/${productId}`).then(res => res.data.data),

  // Create product
  createProduct: (data: Partial<AdminProduct>): Promise<ApiResponse<AdminProduct>> =>
    api.post('/admin/products', data).then(res => res.data),

  // Update product
  updateProduct: (productId: string, data: Partial<AdminProduct>): Promise<ApiResponse<AdminProduct>> =>
    api.put(`/admin/products/${productId}`, data).then(res => res.data),

  // Delete product
  deleteProduct: (productId: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/products/${productId}`).then(res => res.data),

  // Update product status
  updateProductStatus: (productId: string, status: string): Promise<ApiResponse<AdminProduct>> =>
    api.put(`/admin/products/${productId}/status`, { status }).then(res => res.data),

  // Feature/unfeature product
  toggleProductFeature: (productId: string, featured: boolean): Promise<ApiResponse<AdminProduct>> =>
    api.put(`/admin/products/${productId}/feature`, { featured }).then(res => res.data),
};

// Category Management API
export const categoryManagementApi = {
  // Get categories list
  getCategories: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    parent?: string;
  }): Promise<PaginatedResponse<ProductCategory>> =>
    api.get('/admin/categories', { params }).then(res => res.data.data),

  // Get single category
  getCategory: (categoryId: string): Promise<ProductCategory> =>
    api.get(`/admin/categories/${categoryId}`).then(res => res.data.data),

  // Create category
  createCategory: (data: Partial<ProductCategory>): Promise<ApiResponse<ProductCategory>> =>
    api.post('/admin/categories', data).then(res => res.data),

  // Update category
  updateCategory: (categoryId: string, data: Partial<ProductCategory>): Promise<ApiResponse<ProductCategory>> =>
    api.put(`/admin/categories/${categoryId}`, data).then(res => res.data),

  // Delete category
  deleteCategory: (categoryId: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/categories/${categoryId}`).then(res => res.data),

  // Update category status
  updateCategoryStatus: (categoryId: string, status: string): Promise<ApiResponse<ProductCategory>> =>
    api.put(`/admin/categories/${categoryId}/status`, { status }).then(res => res.data),
};

// Analytics API
export const analyticsApi = {
  // Get analytics data
  getAnalytics: (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsData> =>
    api.get('/admin/analytics', { params }).then(res => res.data.data),

  // Export analytics data
  exportAnalytics: (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    format?: 'csv' | 'xlsx';
  }) =>
    api.get('/admin/analytics/export', { params, responseType: 'blob' }),
};

export default {
  dashboard: adminDashboardApi,
  users: userManagementApi,
  vendors: vendorApprovalApi,
  products: productManagementApi,
  categories: categoryManagementApi,
  analytics: analyticsApi,
};