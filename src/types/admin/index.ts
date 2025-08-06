// Admin Dashboard Types
export interface AdminDashboardMetrics {
  totalUsers: number;
  totalVendors: number;
  totalRestaurants: number;
  totalOrders: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  activeUsers: number;
  recentSignups: number;
}

// User Management Types
export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'admin' | 'vendor' | 'restaurantOwner' | 'restaurantManager';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  profilePicture?: string;
  // Vendor-specific fields
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  // Restaurant-specific fields
  restaurantName?: string;
  cuisineType?: string;
  address?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Vendor Approval Types
export interface VendorApprovalRequest {
  id: string;
  userId: string;
  user: AdminUser;
  businessName: string;
  businessType: string;
  businessAddress: string;
  documents: VendorDocument[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface VendorDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'identity_proof' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

// Product Management Types
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    businessName: string;
  };
  price: number;
  unit: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  status: 'active' | 'inactive';
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface AnalyticsData {
  userGrowth: {
    period: string;
    users: number;
    vendors: number;
    restaurants: number;
  }[];
  orderAnalytics: {
    period: string;
    orders: number;
    revenue: number;
  }[];
  topCategories: {
    categoryId: string;
    categoryName: string;
    orderCount: number;
    revenue: number;
  }[];
  topVendors: {
    vendorId: string;
    vendorName: string;
    businessName: string;
    orderCount: number;
    revenue: number;
  }[];
}

// Bulk Operations Types
export interface BulkOperation {
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'approve' | 'reject';
  userIds: string[];
  reason?: string;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: {
    userId: string;
    error: string;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}