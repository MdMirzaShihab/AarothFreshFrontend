// Application route constants

// Public routes (no authentication required)
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_PHONE: '/verify-phone',
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  VENDORS: '/admin/vendors',
  RESTAURANTS: '/admin/restaurants',
  PRODUCTS: '/admin/products',
  CATEGORIES: '/admin/categories',
  ORDERS: '/admin/orders',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings',
} as const;

// Vendor routes
export const VENDOR_ROUTES = {
  DASHBOARD: '/vendor',
  LISTINGS: '/vendor/listings',
  LISTINGS_CREATE: '/vendor/listings/create',
  LISTINGS_EDIT: (id: string) => `/vendor/listings/${id}/edit`,
  ORDERS: '/vendor/orders',
  ORDER_DETAIL: (id: string) => `/vendor/orders/${id}`,
  ANALYTICS: '/vendor/analytics',
  PROFILE: '/vendor/profile',
  SETTINGS: '/vendor/settings',
} as const;

// Restaurant routes
export const RESTAURANT_ROUTES = {
  DASHBOARD: '/restaurant',
  BROWSE: '/restaurant/browse',
  BROWSE_CATEGORY: (categoryId: string) => `/restaurant/browse/category/${categoryId}`,
  VENDOR_PROFILE: (vendorId: string) => `/restaurant/vendor/${vendorId}`,
  PRODUCT_DETAIL: (productId: string) => `/restaurant/product/${productId}`,
  CART: '/restaurant/cart',
  CHECKOUT: '/restaurant/checkout',
  ORDERS: '/restaurant/orders',
  ORDER_DETAIL: (id: string) => `/restaurant/orders/${id}`,
  ORDER_TRACKING: (id: string) => `/restaurant/orders/${id}/tracking`,
  PROFILE: '/restaurant/profile',
  SETTINGS: '/restaurant/settings',
} as const;

// Common routes (accessible by multiple roles)
export const COMMON_ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  HELP: '/help',
  SUPPORT: '/support',
} as const;

// Error routes
export const ERROR_ROUTES = {
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
} as const;

// Route groups for easier management
export const ROUTE_GROUPS = {
  PUBLIC: Object.values(PUBLIC_ROUTES),
  AUTH: Object.values(AUTH_ROUTES),
  ADMIN: Object.values(ADMIN_ROUTES),
  VENDOR: Object.values(VENDOR_ROUTES).filter(route => typeof route === 'string'),
  RESTAURANT: Object.values(RESTAURANT_ROUTES).filter(route => typeof route === 'string'),
  ERROR: Object.values(ERROR_ROUTES),
} as const;

// Route permissions mapping
export const ROUTE_PERMISSIONS = {
  // Admin only routes
  [ADMIN_ROUTES.DASHBOARD]: ['admin'],
  [ADMIN_ROUTES.USERS]: ['admin'],
  [ADMIN_ROUTES.VENDORS]: ['admin'],
  [ADMIN_ROUTES.RESTAURANTS]: ['admin'],
  [ADMIN_ROUTES.PRODUCTS]: ['admin'],
  [ADMIN_ROUTES.CATEGORIES]: ['admin'],
  [ADMIN_ROUTES.ORDERS]: ['admin'],
  [ADMIN_ROUTES.ANALYTICS]: ['admin'],
  [ADMIN_ROUTES.SETTINGS]: ['admin'],

  // Vendor only routes
  [VENDOR_ROUTES.DASHBOARD]: ['vendor'],
  [VENDOR_ROUTES.LISTINGS]: ['vendor'],
  [VENDOR_ROUTES.LISTINGS_CREATE]: ['vendor'],
  [VENDOR_ROUTES.ORDERS]: ['vendor'],
  [VENDOR_ROUTES.ANALYTICS]: ['vendor'],

  // Restaurant only routes
  [RESTAURANT_ROUTES.DASHBOARD]: ['restaurantOwner', 'restaurantManager'],
  [RESTAURANT_ROUTES.BROWSE]: ['restaurantOwner', 'restaurantManager'],
  [RESTAURANT_ROUTES.CART]: ['restaurantOwner', 'restaurantManager'],
  [RESTAURANT_ROUTES.CHECKOUT]: ['restaurantOwner', 'restaurantManager'],
  [RESTAURANT_ROUTES.ORDERS]: ['restaurantOwner', 'restaurantManager'],

  // Common authenticated routes
  [COMMON_ROUTES.PROFILE]: ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
  [COMMON_ROUTES.SETTINGS]: ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
  [COMMON_ROUTES.NOTIFICATIONS]: ['admin', 'vendor', 'restaurantOwner', 'restaurantManager'],
} as const;

// Navigation items for different roles
export const NAVIGATION_ITEMS = {
  admin: [
    { label: 'Dashboard', path: ADMIN_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'Users', path: ADMIN_ROUTES.USERS, icon: 'Users' },
    { label: 'Products', path: ADMIN_ROUTES.PRODUCTS, icon: 'Package' },
    { label: 'Orders', path: ADMIN_ROUTES.ORDERS, icon: 'ShoppingCart' },
    { label: 'Analytics', path: ADMIN_ROUTES.ANALYTICS, icon: 'BarChart3' },
    { label: 'Settings', path: ADMIN_ROUTES.SETTINGS, icon: 'Settings' },
  ],
  vendor: [
    { label: 'Dashboard', path: VENDOR_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'My Listings', path: VENDOR_ROUTES.LISTINGS, icon: 'Package' },
    { label: 'Orders', path: VENDOR_ROUTES.ORDERS, icon: 'ShoppingCart' },
    { label: 'Analytics', path: VENDOR_ROUTES.ANALYTICS, icon: 'BarChart3' },
    { label: 'Profile', path: VENDOR_ROUTES.PROFILE, icon: 'User' },
  ],
  restaurant: [
    { label: 'Dashboard', path: RESTAURANT_ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
    { label: 'Browse Products', path: RESTAURANT_ROUTES.BROWSE, icon: 'Search' },
    { label: 'Cart', path: RESTAURANT_ROUTES.CART, icon: 'ShoppingCart' },
    { label: 'My Orders', path: RESTAURANT_ROUTES.ORDERS, icon: 'Package' },
    { label: 'Profile', path: RESTAURANT_ROUTES.PROFILE, icon: 'User' },
  ],
} as const;

// Breadcrumb configurations
export const BREADCRUMB_CONFIG = {
  [ADMIN_ROUTES.DASHBOARD]: [{ label: 'Admin', path: ADMIN_ROUTES.DASHBOARD }],
  [ADMIN_ROUTES.USERS]: [
    { label: 'Admin', path: ADMIN_ROUTES.DASHBOARD },
    { label: 'Users', path: ADMIN_ROUTES.USERS },
  ],
  [VENDOR_ROUTES.DASHBOARD]: [{ label: 'Vendor', path: VENDOR_ROUTES.DASHBOARD }],
  [VENDOR_ROUTES.LISTINGS]: [
    { label: 'Vendor', path: VENDOR_ROUTES.DASHBOARD },
    { label: 'Listings', path: VENDOR_ROUTES.LISTINGS },
  ],
  [RESTAURANT_ROUTES.DASHBOARD]: [{ label: 'Restaurant', path: RESTAURANT_ROUTES.DASHBOARD }],
  [RESTAURANT_ROUTES.BROWSE]: [
    { label: 'Restaurant', path: RESTAURANT_ROUTES.DASHBOARD },
    { label: 'Browse', path: RESTAURANT_ROUTES.BROWSE },
  ],
} as const;

// Default redirects after login based on role
export const DEFAULT_REDIRECTS = {
  admin: ADMIN_ROUTES.DASHBOARD,
  vendor: VENDOR_ROUTES.DASHBOARD,
  restaurantOwner: RESTAURANT_ROUTES.DASHBOARD,
  restaurantManager: RESTAURANT_ROUTES.DASHBOARD,
} as const;