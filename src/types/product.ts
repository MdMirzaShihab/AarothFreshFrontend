// Extended Product Management Types
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  category: Category;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    businessName: string;
    rating?: number;
  };
  price: number;
  comparePrice?: number;
  unit: string;
  stock: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  images: ProductImage[];
  tags: string[];
  status: 'active' | 'inactive' | 'pending' | 'rejected' | 'out_of_stock';
  featured: boolean;
  isOrganic: boolean;
  nutritionInfo?: NutritionInfo;
  shelfLife?: number; // in days
  storageInstructions?: string;
  origin?: string;
  harvestDate?: string;
  createdAt: string;
  updatedAt: string;
  // Analytics
  views: number;
  orders: number;
  rating: number;
  reviewCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  cloudinaryId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children: Category[];
  image?: ProductImage;
  icon?: string;
  status: 'active' | 'inactive';
  isPopular: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
}

// Form Types
export interface CreateProductData {
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  price: number;
  comparePrice?: number;
  unit: string;
  stock: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  tags: string[];
  isOrganic: boolean;
  nutritionInfo?: NutritionInfo;
  shelfLife?: number;
  storageInstructions?: string;
  origin?: string;
  harvestDate?: string;
  images: File[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
  removeImages?: string[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  icon?: string;
  isPopular: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  image?: File;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
  removeImage?: boolean;
}

// Filter and Search Types
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  status?: string;
  featured?: boolean;
  isOrganic?: boolean;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  sortBy?: 'name' | 'price' | 'stock' | 'created' | 'views' | 'orders' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  status?: string;
  isPopular?: boolean;
  sortBy?: 'name' | 'sortOrder' | 'productsCount' | 'created';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Bulk Operations
export interface BulkProductOperation {
  action: 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete' | 'updateCategory' | 'updateStatus';
  productIds: string[];
  data?: {
    categoryId?: string;
    status?: string;
    featured?: boolean;
  };
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// Analytics Types
export interface ProductAnalytics {
  productId: string;
  views: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  viewTrend: Array<{
    date: string;
    views: number;
  }>;
  orderTrend: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export interface CategoryAnalytics {
  categoryId: string;
  productsCount: number;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
    orders: number;
    revenue: number;
  }>;
}

// Cloudinary Integration
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
  eager?: Array<{
    transformation: string;
    width: number;
    height: number;
    url: string;
    secure_url: string;
  }>;
}

// API Response Types
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}