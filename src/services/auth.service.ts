import { api } from './api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ChangePasswordRequest,
  UpdateProfileRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ApiResponse,
} from '@/types';

export class AuthService {
  /**
   * Login with phone and password
   * POST /api/v1/auth/login
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<{
      success: boolean;
      token: string;
      user: User;
    }>('/auth/login', {
      phone: credentials.phone,
      password: credentials.password,
    });
    
    return {
      success: true,
      token: response.token,
      user: response.user,
    };
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<{
      success: boolean;
      token: string;
      user: User;
    }>('/auth/register', {
      phone: data.phone,
      password: data.password,
      name: data.name,
      role: data.role,
      // Vendor-specific fields
      ...(data.businessName && { businessName: data.businessName }),
      ...(data.businessAddress && { businessAddress: data.businessAddress }),
      ...(data.businessLicense && { businessLicense: data.businessLicense }),
      ...(data.businessType && { businessType: data.businessType }),
      // Restaurant-specific fields
      ...(data.restaurantName && { restaurantName: data.restaurantName }),
      ...(data.restaurantAddress && { restaurantAddress: data.restaurantAddress }),
      ...(data.restaurantType && { restaurantType: data.restaurantType }),
      ...(data.cuisineType && { cuisineType: data.cuisineType }),
    });
    
    return {
      success: true,
      token: response.token,
      user: response.user,
    };
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    const response = await api.get<{ success: boolean; user: User }>('/auth/me');
    return response.user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: UpdateProfileRequest): Promise<User> {
    const response = await api.put<{ success: boolean; user: User }>('/auth/profile', updates);
    return response.user;
  }

  /**
   * Change password
   */
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/change-password', data);
    return response;
  }

  /**
   * Send OTP for various purposes
   */
  static async sendOtp(data: SendOtpRequest): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/send-otp', data);
    return response;
  }

  /**
   * Verify OTP
   */
  static async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/verify-otp', data);
    return response;
  }

  /**
   * Request password reset
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/forgot-password', data);
    return response;
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/reset-password', data);
    return response;
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(data: TokenRefreshRequest): Promise<TokenRefreshResponse> {
    const response = await api.post<TokenRefreshResponse>('/auth/refresh', data);
    return response;
  }

  /**
   * Verify phone number
   */
  static async verifyPhone(phone: string, otp: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/verify-phone', {
      phone,
      otp,
    });
    return response;
  }

  /**
   * Resend verification OTP
   */
  static async resendVerificationOtp(phone: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/resend-verification', {
      phone,
    });
    return response;
  }
}

// Export as default and named export
export default AuthService;