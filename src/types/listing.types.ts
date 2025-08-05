import { User } from './user.types';

// Product category interface
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// Product interface
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  unit: string; // kg, piece, bunch, liter, etc.
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Listing interface
export interface Listing {
  id: string;
  vendor: User;
  product: Product;
  price: number;
  availableQuantity: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  isAvailable: boolean;
  description?: string;
  images: string[];
  tags?: string[];
  harvestDate?: string;
  expiryDate?: string;
  qualityGrade?: 'A' | 'B' | 'C';
  organicCertified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Listing filters for search and filtering
export interface ListingFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  vendor?: string;
  available?: boolean;
  organicCertified?: boolean;
  qualityGrade?: 'A' | 'B' | 'C';
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  sortBy?: 'price' | 'created' | 'rating' | 'distance';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Create listing request
export interface CreateListingRequest {
  product: string; // product ID
  price: number;
  availableQuantity: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  description?: string;
  images?: string[];
  tags?: string[];
  harvestDate?: string;
  expiryDate?: string;
  qualityGrade?: 'A' | 'B' | 'C';
  organicCertified?: boolean;
}

// Update listing request
export interface UpdateListingRequest extends Partial<CreateListingRequest> {
  isAvailable?: boolean;
}

// Listing analytics (for vendors)
export interface ListingAnalytics {
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  viewsThisWeek: number;
  ordersThisWeek: number;
  revenueThisWeek: number;
}