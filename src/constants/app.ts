// Application constants and configuration

// App metadata
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Aaroth Fresh',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: 'B2B marketplace connecting local vegetable vendors with restaurants',
  author: 'Aaroth Fresh Team',
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // 30 seconds
  maxRetries: Number(import.meta.env.VITE_QUERY_RETRY_ATTEMPTS) || 3,
} as const;

// Authentication configuration
export const AUTH_CONFIG = {
  tokenStorageKey: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token',
  refreshTokenStorageKey: import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'refresh_token',
  userStorageKey: import.meta.env.VITE_USER_STORAGE_KEY || 'auth_user',
  tokenRefreshThreshold: Number(import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD) || 300000, // 5 minutes
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  staleTime: Number(import.meta.env.VITE_QUERY_STALE_TIME) || 300000, // 5 minutes
  gcTime: Number(import.meta.env.VITE_QUERY_GC_TIME) || 600000, // 10 minutes
  retryAttempts: Number(import.meta.env.VITE_QUERY_RETRY_ATTEMPTS) || 3,
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
} as const;

// UI configuration
export const UI_CONFIG = {
  defaultTheme: (import.meta.env.VITE_DEFAULT_THEME as 'light' | 'dark' | 'system') || 'system',
  itemsPerPage: Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,
  maxCartItems: Number(import.meta.env.VITE_MAX_CART_ITEMS) || 50,
  notificationDuration: Number(import.meta.env.VITE_NOTIFICATION_DURATION) || 4000,
} as const;

// Feature flags
export const FEATURES = {
  darkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  offlineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  queryDevtools: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true',
} as const;

// Development flags
export const DEV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  devMode: import.meta.env.VITE_DEV_MODE === 'true',
} as const;

// External service configuration
export const EXTERNAL_SERVICES = {
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    hotjarId: import.meta.env.VITE_HOTJAR_ID || '',
  },
  social: {
    facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
  },
  maps: {
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },
  monitoring: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  },
} as const;

// Validation constants
export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  phone: {
    minLength: 10,
    maxLength: 15,
  },
  businessName: {
    minLength: 2,
    maxLength: 100,
  },
  price: {
    min: 0.01,
    max: 100000,
    decimalPlaces: 2,
  },
  quantity: {
    min: 0.01,
    max: 10000,
  },
} as const;

// Pagination constants
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: UI_CONFIG.itemsPerPage,
  maxLimit: 100,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// Date/Time constants
export const DATE_TIME = {
  defaultDateFormat: 'yyyy-MM-dd',
  defaultTimeFormat: 'HH:mm',
  defaultDateTimeFormat: 'yyyy-MM-dd HH:mm:ss',
  timeZone: 'Asia/Dhaka',
} as const;

// Bangladesh-specific constants
export const BANGLADESH = {
  countryCode: '+88',
  currency: 'BDT',
  currencySymbol: '৳',
  divisions: [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
  ],
  mobileOperators: [
    'Grameenphone',
    'Robi',
    'Banglalink',
    'Teletalk',
  ],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your internet connection.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied. Insufficient permissions.',
  notFound: 'The requested resource was not found.',
  serverError: 'Internal server error. Please try again later.',
  validationError: 'Please check your input and try again.',
  phoneRequired: 'Phone number is required.',
  passwordRequired: 'Password is required.',
  invalidCredentials: 'Invalid phone number or password.',
  accountNotApproved: 'Your account is pending approval.',
  accountSuspended: 'Your account has been suspended.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  loginSuccess: 'Login successful!',
  registrationSuccess: 'Registration successful!',
  profileUpdated: 'Profile updated successfully!',
  passwordChanged: 'Password changed successfully!',
  listingCreated: 'Listing created successfully!',
  listingUpdated: 'Listing updated successfully!',
  orderPlaced: 'Order placed successfully!',
  orderUpdated: 'Order status updated successfully!',
} as const;