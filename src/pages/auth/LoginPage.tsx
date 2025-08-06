import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/forms/LoginForm';
import { useAuthStore } from '@/stores/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Get the intended destination from location state
  const from = location.state?.from || '/dashboard';

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white/30 rounded-full animate-spin"></div>
          </div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to their appropriate dashboard
  if (isAuthenticated && user) {
    const defaultRoute = user.role === 'admin' ? '/admin/dashboard' : 
                         user.role === 'vendor' ? '/vendor/dashboard' : 
                         '/restaurant/dashboard';
    
    return <Navigate to={from !== '/login' ? from : defaultRoute} replace />;
  }

  const handleLoginSuccess = () => {
    // Navigation will be handled by the redirect logic above
    // This is just a fallback in case the redirect doesn't work
    const defaultRoute = '/dashboard';
    navigate(from !== '/login' ? from : defaultRoute, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Sign In | Aaroth Fresh - B2B Fresh Produce Marketplace</title>
        <meta 
          name="description" 
          content="Sign in to your Aaroth Fresh account. Access your dashboard, manage orders, and connect with fresh produce vendors or restaurants in Bangladesh." 
        />
        <meta name="keywords" content="login, sign in, Aaroth Fresh, B2B marketplace, fresh produce, Bangladesh" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Sign In | Aaroth Fresh" />
        <meta property="og:description" content="Sign in to your Aaroth Fresh account to access Bangladesh's leading B2B fresh produce marketplace." />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign In | Aaroth Fresh" />
        <meta name="twitter:description" content="Sign in to your Aaroth Fresh account to access Bangladesh's leading B2B fresh produce marketplace." />
        
        {/* Prevent indexing of auth pages */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AuthLayout
        title="Sign In"
        subtitle="Welcome back to Aaroth Fresh"
        showBackButton={from !== '/dashboard' && from !== '/'}
        backPath={from !== '/login' ? from : '/'}
      >
        <LoginForm 
          onSuccess={handleLoginSuccess}
          redirectPath={from !== '/login' ? from : '/dashboard'}
        />
      </AuthLayout>
    </>
  );
};

export default LoginPage;