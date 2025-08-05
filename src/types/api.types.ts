// Common API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Pagination structure
export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Common address structure
export interface Address {
  street: string;
  city: string;
  area: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Error response structure
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  details?: Record<string, string[]>; // Validation errors
}