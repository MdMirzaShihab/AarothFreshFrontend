import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { USER_ROLES } from '@/constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requireAuth?: boolean;
  fallbackPath?: string;
  className?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireAuth = true,
  fallbackPath = '/auth/login',
  className = '',
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-medium text-text-dark mb-2">
            Loading...
          </h2>
          <p className="text-text-muted">
            Verifying your access permissions
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && user) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!hasRequiredRole) {
      return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 px-6 ${className}`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-tomato-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-tomato-red" />
            </div>
            
            <h1 className="text-2xl font-medium text-text-dark mb-4">
              Access Restricted
            </h1>
            
            <div className="space-y-4 text-text-muted">
              <p>
                You don't have permission to access this area. This page is restricted to:
              </p>
              
              <div className="bg-earthy-beige/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-bottle-green font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Required Role{Array.isArray(requiredRole) && requiredRole.length > 1 ? 's' : ''}:
                </div>
                <div className="text-sm text-text-dark">
                  {Array.isArray(requiredRole) 
                    ? requiredRole.map(role => getRoleDisplayName(role)).join(', ')
                    : getRoleDisplayName(requiredRole)
                  }
                </div>
              </div>
              
              <p className="text-sm">
                Your current role: <span className="font-medium text-text-dark">{getRoleDisplayName(user.role)}</span>
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gradient-secondary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Go Back
              </button>
              
              <Navigate 
                to={getDefaultRouteForRole(user.role)} 
                replace 
              />
            </div>
          </div>
        </div>
      );
    }
  }

  // Render children if all checks pass
  return <div className={className}>{children}</div>;
};

// Helper function to get display names for roles
function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'Administrator';
    case USER_ROLES.VENDOR:
      return 'Vendor';
    case USER_ROLES.RESTAURANT_OWNER:
      return 'Restaurant Owner';
    case USER_ROLES.RESTAURANT_MANAGER:
      return 'Restaurant Manager';
    default:
      return 'Unknown Role';
  }
}

// Helper function to get default routes for different roles
function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return '/admin/dashboard';
    case USER_ROLES.VENDOR:
      return '/vendor/dashboard';
    case USER_ROLES.RESTAURANT_OWNER:
    case USER_ROLES.RESTAURANT_MANAGER:
      return '/restaurant/dashboard';
    default:
      return '/dashboard';
  }
}

// Specialized route guards for specific roles
export const AdminRoute: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ProtectedRoute 
    requiredRole={USER_ROLES.ADMIN} 
    className={className}
  >
    {children}
  </ProtectedRoute>
);

export const VendorRoute: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ProtectedRoute 
    requiredRole={USER_ROLES.VENDOR} 
    className={className}
  >
    {children}
  </ProtectedRoute>
);

export const RestaurantRoute: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <ProtectedRoute 
    requiredRole={[USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER]} 
    className={className}
  >
    {children}
  </ProtectedRoute>
);

// Public route that redirects authenticated users to their dashboard
export const PublicRoute: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-bottle-green" />
      </div>
    );
  }

  // Redirect authenticated users to their appropriate dashboard
  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <div className={className}>{children}</div>;
};

export default ProtectedRoute;