import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

// Store initialization
import { useAuthStore } from '@/stores/authStore';
import { initializeTheme } from '@/stores/themeStore';

// Layout components
import { AppLayout } from '@/components/layout/AppLayout';

// Route components
import { ProtectedRoute, PublicRoute, AdminRoute, VendorRoute, RestaurantRoute } from '@/components/common/ProtectedRoute';

// Authentication pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Placeholder dashboard components (to be implemented later)
const DashboardHome = () => (
  <div className="text-center">
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 border border-white/50">
      <h1 className="text-3xl font-bold text-bottle-green mb-4">Welcome to Aaroth Fresh</h1>
      <p className="text-text-muted text-lg mb-8">Your dashboard is being prepared...</p>
      <div className="bg-gradient-secondary text-white px-8 py-3 rounded-2xl inline-block">
        Dashboard Coming Soon
      </div>
    </div>
  </div>
);

const AdminDashboard = () => (
  <AdminRoute>
    <AppLayout>
      <div className="text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 border border-white/50">
          <h1 className="text-3xl font-bold text-bottle-green mb-4">Admin Dashboard</h1>
          <p className="text-text-muted text-lg">Manage users, products, and system settings</p>
        </div>
      </div>
    </AppLayout>
  </AdminRoute>
);

const VendorDashboard = () => (
  <VendorRoute>
    <AppLayout>
      <div className="text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 border border-white/50">
          <h1 className="text-3xl font-bold text-bottle-green mb-4">Vendor Dashboard</h1>
          <p className="text-text-muted text-lg">Manage your products and orders</p>
        </div>
      </div>
    </AppLayout>
  </VendorRoute>
);

const RestaurantDashboard = () => (
  <RestaurantRoute>
    <AppLayout>
      <div className="text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 border border-white/50">
          <h1 className="text-3xl font-bold text-bottle-green mb-4">Restaurant Dashboard</h1>
          <p className="text-text-muted text-lg">Browse products and manage orders</p>
        </div>
      </div>
    </AppLayout>
  </RestaurantRoute>
);

// Landing page for unauthenticated users
const LandingPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10">
    <div className="text-center max-w-4xl px-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-12 border border-white/50">
        <h1 className="text-4xl font-bold text-bottle-green mb-4">
          Aaroth Fresh
        </h1>
        <p className="text-text-muted text-lg mb-8">
          B2B Marketplace for Fresh Produce in Bangladesh
        </p>
        <div className="space-x-4">
          <a 
            href="/auth/login" 
            className="bg-gradient-secondary text-white px-8 py-3 rounded-2xl inline-block font-medium hover:shadow-lg transition-all duration-300"
          >
            Sign In
          </a>
          <a 
            href="/auth/register" 
            className="bg-white text-bottle-green border-2 border-bottle-green px-8 py-3 rounded-2xl inline-block font-medium hover:bg-bottle-green hover:text-white transition-all duration-300"
          >
            Join Now
          </a>
        </div>
      </div>
    </div>
  </div>
);

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App: React.FC = () => {
  const { initialize } = useAuthStore();

  // Initialize authentication and theme state on app start
  useEffect(() => {
    initialize();
    initializeTheme();
  }, [initialize]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } 
            />
            
            {/* Authentication Routes */}
            <Route 
              path="/auth/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/auth/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/auth/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardHome />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />

            {/* Role-based Protected Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />

            {/* Fallback Routes */}
            <Route path="/unauthorized" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-tomato-red mb-4">Unauthorized</h1>
                  <p className="text-text-muted">You don't have permission to access this resource.</p>
                </div>
              </div>
            } />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        {/* React Query Devtools (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;