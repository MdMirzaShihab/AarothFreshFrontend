// User roles and permissions constants

import { UserRole } from '@/types';

// User roles enum
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  RESTAURANT_OWNER: 'restaurantOwner',
  RESTAURANT_MANAGER: 'restaurantManager',
} as const;

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Administrator',
  vendor: 'Vendor',
  restaurantOwner: 'Restaurant Owner',
  restaurantManager: 'Restaurant Manager',
} as const;

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access, manage users, products, and system settings',
  vendor: 'Create and manage product listings, process orders, view analytics',
  restaurantOwner: 'Browse products, place orders, manage restaurant profile',
  restaurantManager: 'Same as restaurant owner with limited administrative rights',
} as const;

// Permission constants
export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  APPROVE_VENDORS: 'approve_vendors',
  
  // Product management
  MANAGE_PRODUCTS: 'manage_products',
  CREATE_PRODUCTS: 'create_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Category management
  MANAGE_CATEGORIES: 'manage_categories',
  CREATE_CATEGORIES: 'create_categories',
  EDIT_CATEGORIES: 'edit_categories',
  DELETE_CATEGORIES: 'delete_categories',
  
  // Listing management
  MANAGE_LISTINGS: 'manage_listings',
  CREATE_LISTINGS: 'create_listings',
  EDIT_LISTINGS: 'edit_listings',
  DELETE_LISTINGS: 'delete_listings',
  VIEW_ALL_LISTINGS: 'view_all_listings',
  
  // Order management
  MANAGE_ORDERS: 'manage_orders',
  CREATE_ORDERS: 'create_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
  CANCEL_ORDERS: 'cancel_orders',
  VIEW_ALL_ORDERS: 'view_all_orders',
  
  // Analytics and reporting
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_SYSTEM_ANALYTICS: 'view_system_analytics',
  EXPORT_DATA: 'export_data',
  
  // Profile management
  MANAGE_PROFILE: 'manage_profile',
  CHANGE_PASSWORD: 'change_password',
  
  // System settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_SYSTEM_CONFIG: 'manage_system_config',
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    // User management
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.APPROVE_VENDORS,
    
    // Product and category management
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.CREATE_CATEGORIES,
    PERMISSIONS.EDIT_CATEGORIES,
    PERMISSIONS.DELETE_CATEGORIES,
    
    // Listing management
    PERMISSIONS.VIEW_ALL_LISTINGS,
    PERMISSIONS.MANAGE_LISTINGS,
    
    // Order management
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    
    // Analytics and system
    PERMISSIONS.VIEW_SYSTEM_ANALYTICS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_SYSTEM_CONFIG,
    
    // Profile
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
  ],
  
  vendor: [
    // Listing management
    PERMISSIONS.CREATE_LISTINGS,
    PERMISSIONS.EDIT_LISTINGS,
    PERMISSIONS.DELETE_LISTINGS,
    PERMISSIONS.MANAGE_LISTINGS,
    
    // Order management (vendor's orders only)
    PERMISSIONS.UPDATE_ORDER_STATUS,
    
    // Analytics (vendor's data only)
    PERMISSIONS.VIEW_ANALYTICS,
    
    // Profile
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
  ],
  
  restaurantOwner: [
    // Order management
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.CANCEL_ORDERS,
    
    // Profile
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
  ],
  
  restaurantManager: [
    // Order management (same as owner)
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.CANCEL_ORDERS,
    
    // Profile (limited)
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
  ],
} as const;

// Route access permissions
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  // Admin routes
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/vendors': ['admin'],
  '/admin/restaurants': ['admin'],
  '/admin/products': ['admin'],
  '/admin/categories': ['admin'],
  '/admin/orders': ['admin'],
  '/admin/analytics': ['admin'],
  '/admin/settings': ['admin'],
  
  // Vendor routes
  '/vendor': ['vendor'],
  '/vendor/listings': ['vendor'],
  '/vendor/orders': ['vendor'],
  '/vendor/analytics': ['vendor'],
  '/vendor/profile': ['vendor'],
  '/vendor/settings': ['vendor'],
  
  // Restaurant routes
  '/restaurant': ['restaurantOwner', 'restaurantManager'],
  '/restaurant/browse': ['restaurantOwner', 'restaurantManager'],
  '/restaurant/cart': ['restaurantOwner', 'restaurantManager'],
  '/restaurant/checkout': ['restaurantOwner', 'restaurantManager'],
  '/restaurant/orders': ['restaurantOwner', 'restaurantManager'],
  '/restaurant/profile': ['restaurantOwner', 'restaurantManager'],
  '/restaurant/settings': ['restaurantOwner', 'restaurantManager'],
  
  // Common authenticated routes
  '/profile': ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
  '/settings': ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
  '/notifications': ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
  '/help': ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
  '/support': ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
} as const;

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  vendor: 3,
  restaurantOwner: 2,
  restaurantManager: 1,
} as const;

// Role groups for easier management
export const ROLE_GROUPS = {
  ADMIN: ['admin'],
  VENDORS: ['vendor'],
  RESTAURANTS: ['restaurantOwner', 'restaurantManager'],
  ALL_AUTHENTICATED: ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
} as const;

// Registration allowed roles (which roles can register themselves)
export const REGISTRATION_ALLOWED_ROLES: UserRole[] = [
  'vendor',
  'restaurantOwner',
  'restaurantManager',
] as const;

// Default role for new registrations
export const DEFAULT_REGISTRATION_ROLE: UserRole = 'restaurantOwner';

// Role-specific features
export const ROLE_FEATURES = {
  admin: {
    dashboard: 'System Overview Dashboard',
    userManagement: 'Manage all users and vendors',
    systemSettings: 'Configure system settings',
    analytics: 'System-wide analytics and reports',
  },
  vendor: {
    dashboard: 'Vendor Performance Dashboard',
    listingManagement: 'Create and manage product listings',
    orderManagement: 'Process and fulfill orders',
    analytics: 'Sales and performance analytics',
  },
  restaurantOwner: {
    dashboard: 'Restaurant Dashboard',
    productBrowsing: 'Browse and search products',
    orderPlacement: 'Place and track orders',
    restaurantProfile: 'Manage restaurant information',
  },
  restaurantManager: {
    dashboard: 'Restaurant Manager Dashboard',
    productBrowsing: 'Browse and search products',
    orderPlacement: 'Place and track orders',
    limitedProfile: 'Limited profile management',
  },
} as const;

// Approval requirements for roles
export const ROLE_APPROVAL_REQUIRED: Partial<Record<UserRole, boolean>> = {
  vendor: true, // Vendors need admin approval
  admin: true, // Admins need super admin approval (not implemented in this system)
} as const;

// Role-specific onboarding steps
export const ROLE_ONBOARDING_STEPS = {
  vendor: [
    'Complete business profile',
    'Upload business license',
    'Add product categories',
    'Create first listing',
    'Wait for admin approval',
  ],
  restaurantOwner: [
    'Complete restaurant profile',
    'Add restaurant details',
    'Browse available products',
    'Place first order',
  ],
  restaurantManager: [
    'Complete profile setup',
    'Review restaurant information',
    'Browse available products',
    'Learn order placement process',
  ],
} as const;