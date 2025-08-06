import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  User, 
  AuthState, 
  RegistrationData,
  AuthError,
  AuthErrorType
} from '@/types';
import { TokenManager } from '@/utils';
import { AuthService } from '@/services/auth.service';
import { api } from '@/services/api';

interface AuthActions {
  // Authentication actions
  login: (user: User, token: string) => void;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Profile actions
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // State management
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Initialization
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const createAuthError = (type: AuthErrorType, message: string): AuthError => ({
  type,
  message,
});

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,

        // Authentication actions - simplified to just store the auth data
        login: (user: User, token: string) => {
          // Store token and user data
          TokenManager.setToken(token);
          TokenManager.setUser(user);

          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            error: null,
          });
        },

        register: async (data: RegistrationData) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await api.post<{
              success: boolean;
              token: string;
              user: User;
            }>('/auth/register', {
              phone: data.phone,
              password: data.password,
              name: data.name,
              role: data.role,
              businessName: data.businessName,
              businessType: data.businessType,
              restaurantName: data.restaurantName,
              restaurantType: data.restaurantType,
            });

            if (response.success) {
              // Store token and user data
              TokenManager.setToken(response.token);
              TokenManager.setUser(response.user);
              api.setToken(response.token);

              set({
                isAuthenticated: true,
                user: response.user,
                token: response.token,
                isLoading: false,
                error: null,
              });
            } else {
              throw new Error('Registration failed');
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            const authError = createAuthError('VALIDATION_ERROR', errorMessage);
            
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
              error: authError.message,
            });
            
            throw authError;
          }
        },

        logout: async () => {
          try {
            // Call backend logout endpoint
            await AuthService.logout();
          } catch (error) {
            // Even if backend call fails, continue with local logout
            console.warn('Backend logout failed:', error);
          }

          // Clear all stored data
          TokenManager.clearAll();

          // Reset store state
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });

          // Emit logout event for other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
        },

        refreshToken: async (): Promise<boolean> => {
          const refreshToken = TokenManager.getRefreshToken();
          
          if (!refreshToken) {
            await get().logout();
            return false;
          }

          try {
            const response = await AuthService.refreshToken({ refreshToken });

            if (response.success && response.token) {
              TokenManager.setToken(response.token);
              if (response.refreshToken) {
                TokenManager.setRefreshToken(response.refreshToken);
              }

              set({
                token: response.token,
                error: null,
              });
              
              return true;
            } else {
              await get().logout();
              return false;
            }
          } catch (error) {
            await get().logout();
            return false;
          }
        },

        // Profile actions
        updateProfile: async (updates: Partial<User>) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await api.put<{
              success: boolean;
              user: User;
            }>('/auth/profile', updates);

            if (response.success) {
              TokenManager.setUser(response.user);
              
              set({
                user: response.user,
                isLoading: false,
                error: null,
              });
            }
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Profile update failed';
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            
            throw new Error(errorMessage);
          }
        },

        changePassword: async (oldPassword: string, newPassword: string) => {
          set({ isLoading: true, error: null });
          
          try {
            await api.post('/auth/change-password', {
              currentPassword: oldPassword,
              newPassword,
              confirmPassword: newPassword,
            });
            
            set({
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Password change failed';
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            
            throw new Error(errorMessage);
          }
        },

        // State management
        setUser: (user: User | null) => {
          if (user) {
            TokenManager.setUser(user);
          } else {
            TokenManager.removeUser();
          }
          set({ user });
        },

        setToken: (token: string | null) => {
          if (token) {
            TokenManager.setToken(token);
            api.setToken(token);
          } else {
            TokenManager.removeToken();
            api.removeToken();
          }
          set({ token });
        },

        setLoading: (isLoading: boolean) => set({ isLoading }),
        
        setError: (error: string | null) => set({ error }),
        
        clearError: () => set({ error: null }),

        // Initialization
        initialize: async () => {
          set({ isLoading: true });
          
          const token = TokenManager.getToken();
          const user = TokenManager.getUser();
          
          if (token && user && TokenManager.hasValidToken()) {
            try {
              // Verify token is still valid by fetching current user profile
              const currentUser = await AuthService.getProfile();
              
              set({
                isAuthenticated: true,
                user: currentUser,
                token,
                isLoading: false,
                error: null,
              });
            } catch (error) {
              // Token invalid, try to refresh
              const refreshSuccess = await get().refreshToken();
              
              if (!refreshSuccess) {
                // Refresh failed, clear everything
                TokenManager.clearAll();
                set({
                  isAuthenticated: false,
                  user: null,
                  token: null,
                  isLoading: false,
                  error: null,
                });
              } else {
                set({ isLoading: false });
              }
            }
          } else {
            // No valid session
            TokenManager.clearAll();
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
              error: null,
            });
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          // Only persist essential data, not loading states
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Helper hooks for specific auth data
export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  } = useAuthStore();

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};

export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};