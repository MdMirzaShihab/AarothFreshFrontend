import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Users, ShoppingBag, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'Aaroth Fresh',
  subtitle = 'Fresh Produce B2B Marketplace',
  showBackButton = false,
  backPath = '/',
  className = '',
}) => {
  const features = [
    {
      icon: Leaf,
      title: 'Fresh & Organic',
      description: 'Direct from farm to your restaurant with guaranteed freshness',
    },
    {
      icon: Users,
      title: 'Trusted Network',
      description: 'Connect with verified vendors and restaurants in Bangladesh',
    },
    {
      icon: ShoppingBag,
      title: 'Easy Ordering',
      description: 'Simple ordering process with flexible payment options',
    },
    {
      icon: TrendingUp,
      title: 'Grow Together',
      description: 'Build lasting business relationships and grow your revenue',
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-bottle-green rounded-full mix-blend-multiply animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-earthy-yellow rounded-full mix-blend-multiply animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-mint-fresh rounded-full mix-blend-multiply animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-earthy-brown rounded-full mix-blend-multiply animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Side - Branding and Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            {/* Logo and Title */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text-dark">{title}</h1>
                  <p className="text-text-muted">{subtitle}</p>
                </div>
              </div>
              
              <div className="text-text-dark/80 text-lg leading-relaxed">
                <p className="mb-4">
                  Join Bangladesh's leading B2B marketplace connecting fresh produce vendors 
                  with restaurants and food businesses.
                </p>
                <p>
                  Streamline your supply chain, ensure quality ingredients, and grow your business 
                  with our trusted platform.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-dark mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-bottle-green">500+</div>
                <div className="text-sm text-text-muted">Verified Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-bottle-green">1000+</div>
                <div className="text-sm text-text-muted">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-bottle-green">50k+</div>
                <div className="text-sm text-text-muted">Orders Fulfilled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-16">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-dark">{title}</h1>
                </div>
              </div>
              <p className="text-text-muted text-sm">{subtitle}</p>
            </div>

            {/* Back Button */}
            {showBackButton && (
              <div className="mb-6">
                <Link
                  to={backPath}
                  className="inline-flex items-center gap-2 text-bottle-green hover:text-bottle-green/80 font-medium transition-colors duration-200 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back
                </Link>
              </div>
            )}

            {/* Form Content */}
            <div className="animate-fade-in">
              {children}
            </div>

            {/* Footer Links */}
            <div className="mt-12 text-center">
              <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
                <Link 
                  to="/help" 
                  className="hover:text-bottle-green transition-colors duration-200"
                >
                  Help Center
                </Link>
                <span>•</span>
                <Link 
                  to="/contact" 
                  className="hover:text-bottle-green transition-colors duration-200"
                >
                  Contact Support
                </Link>
                <span>•</span>
                <Link 
                  to="/privacy" 
                  className="hover:text-bottle-green transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </div>
              
              <div className="mt-6 text-xs text-text-muted">
                <p>© 2024 Aaroth Fresh. All rights reserved.</p>
                <p className="mt-1">
                  Connecting Bangladesh's fresh produce ecosystem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Features (Collapsed) */}
      <div className="lg:hidden bg-white/60 backdrop-blur-sm border-t border-white/30 px-6 py-8">
        <div className="max-w-md mx-auto">
          <h3 className="font-semibold text-text-dark mb-6 text-center">
            Why Choose Aaroth Fresh?
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {features.slice(0, 4).map((feature) => (
              <div
                key={feature.title}
                className="text-center p-3 rounded-xl bg-white/60 border border-white/40"
              >
                <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-medium text-text-dark">
                  {feature.title}
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-bottle-green">500+</div>
              <div className="text-xs text-text-muted">Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-bottle-green">1000+</div>
              <div className="text-xs text-text-muted">Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-bottle-green">50k+</div>
              <div className="text-xs text-text-muted">Orders</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;