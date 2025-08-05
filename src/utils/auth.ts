import { User, UserRole } from '@/types';

// Token management utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'auth_user';

  // Token storage
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Refresh token storage
  static setRefreshToken(refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static removeRefreshToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // User data storage
  static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.USER_KEY);
  }

  // Clear all auth data
  static clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  }

  // Check if token exists and is potentially valid
  static hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT structure check (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]!));
      const now = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 5 minute buffer)
      return payload.exp && payload.exp > (now + 300);
    } catch {
      return false;
    }
  }

  // Extract user role from token
  static getUserRoleFromToken(): UserRole | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]!));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  // Check if token will expire soon (within 5 minutes)
  static willTokenExpireSoon(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]!));
      const now = Math.floor(Date.now() / 1000);
      
      // Check if token expires within 5 minutes
      return payload.exp && payload.exp <= (now + 300);
    } catch {
      return true;
    }
  }
}

// Permission checking utilities
export class PermissionManager {
  private static readonly ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: ['admin', 'listings', 'orders', 'public', 'users', 'analytics'],
    vendor: ['listings', 'orders', 'public', 'vendor-dashboard'],
    restaurantOwner: ['orders', 'public', 'restaurant-dashboard'],
    restaurantManager: ['orders', 'public', 'restaurant-dashboard'],
  };

  static hasPermission(userRole: UserRole, permission: string): boolean {
    const rolePermissions = this.ROLE_PERMISSIONS[userRole];
    return rolePermissions?.includes(permission) || false;
  }

  static canAccessRoute(userRole: UserRole, routePermission: string): boolean {
    return this.hasPermission(userRole, routePermission);
  }

  static getAvailablePermissions(userRole: UserRole): string[] {
    return this.ROLE_PERMISSIONS[userRole] || [];
  }

  static isAdmin(userRole: UserRole): boolean {
    return userRole === 'admin';
  }

  static isVendor(userRole: UserRole): boolean {
    return userRole === 'vendor';
  }

  static isRestaurant(userRole: UserRole): boolean {
    return userRole === 'restaurantOwner' || userRole === 'restaurantManager';
  }
}

// Authentication state helpers
export const isAuthenticated = (): boolean => {
  return TokenManager.hasValidToken() && TokenManager.getUser() !== null;
};

export const getCurrentUser = (): User | null => {
  return TokenManager.getUser();
};

export const getCurrentUserRole = (): UserRole | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

export const logout = (): void => {
  TokenManager.clearAll();
  
  // Clear any API authorization headers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
};