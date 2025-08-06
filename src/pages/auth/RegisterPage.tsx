import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { useAuthStore } from '@/stores/authStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuthStore();

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
    
    return <Navigate to={defaultRoute} replace />;
  }

  const handleRegistrationSuccess = () => {
    // Navigation will be handled by the redirect logic above
    // This is just a fallback in case the redirect doesn't work
    navigate('/dashboard', { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Create Account | Aaroth Fresh - Join Bangladesh's B2B Fresh Produce Marketplace</title>
        <meta 
          name="description" 
          content="Join Aaroth Fresh, Bangladesh's leading B2B marketplace for fresh produce. Register as a vendor to sell or as a restaurant to buy fresh ingredients directly from suppliers." 
        />
        <meta name="keywords" content="register, sign up, join, Aaroth Fresh, B2B marketplace, fresh produce, vendor, restaurant, Bangladesh" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Join Aaroth Fresh | B2B Fresh Produce Marketplace" />
        <meta property="og:description" content="Join Bangladesh's leading B2B marketplace for fresh produce. Connect with vendors and restaurants for quality ingredients." />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Join Aaroth Fresh | B2B Fresh Produce Marketplace" />
        <meta name="twitter:description" content="Join Bangladesh's leading B2B marketplace for fresh produce. Connect with vendors and restaurants for quality ingredients." />
        
        {/* Structured data for registration page */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Aaroth Fresh",
            "description": "B2B marketplace for fresh produce in Bangladesh",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "BDT",
              "description": "Free registration for vendors and restaurants"
            }
          })}
        </script>
        
        {/* Prevent indexing of auth pages */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AuthLayout
        title="Join Aaroth Fresh"
        subtitle="Start your fresh produce journey"
        showBackButton={true}
        backPath="/auth/login"
      >
        <RegisterForm 
          onSuccess={handleRegistrationSuccess}
          redirectPath="/dashboard"
        />
      </AuthLayout>
    </>
  );
};

export default RegisterPage;