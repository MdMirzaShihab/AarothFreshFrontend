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

// API Error class for consistent error handling
export class ApiError extends Error {
  public status: number;
  public statusCode: number;
  public details?: Record<string, string[]> | undefined;

  constructor(
    message: string, 
    status: number = 500, 
    details?: Record<string, string[]> | undefined
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}