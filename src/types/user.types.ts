import { Address } from './api.types';

// User roles as defined in backend
export type UserRole = 'admin' | 'vendor' | 'restaurantOwner' | 'restaurantManager';

// Base user interface
export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isApproved?: boolean; // for vendors
  createdAt: string;
  updatedAt: string;
  
  // Role-specific data
  vendor?: VendorProfile;
  restaurant?: RestaurantProfile;
}

// Vendor-specific profile
export interface VendorProfile {
  businessName: string;
  businessAddress: Address;
  businessLicense?: string;
  businessType: string;
  description?: string;
  rating?: number;
  totalSales?: number;
}

// Restaurant-specific profile
export interface RestaurantProfile {
  restaurantName: string;
  restaurantAddress: Address;
  restaurantType: string;
  cuisineType?: string[];
  establishedYear?: number;
  description?: string;
}

// Authentication interfaces
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  token: string;
  user: User;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  role: UserRole;
  
  // Vendor-specific fields
  businessName?: string;
  businessAddress?: Address;
  businessLicense?: string;
  businessType?: string;
  
  // Restaurant-specific fields
  restaurantName?: string;
  restaurantAddress?: Address;
  restaurantType?: string;
  cuisineType?: string[];
}

export interface RegisterResponse {
  success: true;
  token: string;
  user: User;
}

// User management interfaces (for admin)
export interface UserListFilters {
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  isApproved?: boolean;
  search?: string;
}

export interface ApproveUserRequest {
  isApproved: boolean;
  notes?: string;
}