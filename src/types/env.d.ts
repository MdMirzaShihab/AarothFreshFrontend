/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEV_MODE: string;
  readonly VITE_ENABLE_LOGGING: string;
  readonly VITE_ENABLE_QUERY_DEVTOOLS: string;
  readonly VITE_TOKEN_STORAGE_KEY: string;
  readonly VITE_REFRESH_TOKEN_STORAGE_KEY: string;
  readonly VITE_USER_STORAGE_KEY: string;
  readonly VITE_TOKEN_REFRESH_THRESHOLD: string;
  readonly VITE_QUERY_STALE_TIME: string;
  readonly VITE_QUERY_GC_TIME: string;
  readonly VITE_QUERY_RETRY_ATTEMPTS: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_FILE_TYPES: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_DEFAULT_THEME: string;
  readonly VITE_ITEMS_PER_PAGE: string;
  readonly VITE_MAX_CART_ITEMS: string;
  readonly VITE_NOTIFICATION_DURATION: string;
  readonly VITE_ENABLE_DARK_MODE: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_HOTJAR_ID?: string;
  readonly VITE_FACEBOOK_APP_ID?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}