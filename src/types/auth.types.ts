import { User, UserRole } from './user.types';

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Login credentials
export interface LoginCredentials {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

// Registration data
export interface RegistrationData {
  phone: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
  termsAccepted: boolean;
  
  // Conditional fields based on role
  businessName?: string;
  businessType?: string;
  restaurantName?: string;
  restaurantType?: string;
}

// Password reset interfaces
export interface ForgotPasswordRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  phone: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// Phone verification interfaces
export interface SendOtpRequest {
  phone: string;
  purpose: 'registration' | 'password_reset' | 'phone_verification';
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  purpose: 'registration' | 'password_reset' | 'phone_verification';
}

// Token refresh interface
export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  success: true;
  token: string;
  refreshToken: string;
}

// Profile update interface
export interface UpdateProfileRequest {
  name?: string;
  businessName?: string;
  businessType?: string;
  restaurantName?: string;
  restaurantType?: string;
  // Address updates would be separate endpoints
}

// Change password interface
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Auth error types
export type AuthErrorType = 
  | 'INVALID_CREDENTIALS'
  | 'PHONE_NOT_VERIFIED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_NOT_APPROVED'
  | 'TOKEN_EXPIRED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: Record<string, string[]>;
}