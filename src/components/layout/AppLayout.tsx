import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import Breadcrumb from './Breadcrumb';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

interface AppLayoutProps {
  children?: React.ReactNode;
  className?: string;
  showBreadcrumb?: boolean;
  fullWidth?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  className = '',
  showBreadcrumb = true,
  fullWidth = false,
}) => {
  const location = useLocation();
  const { theme } = useThemeStore();
  const { isAuthenticated, isLoading } = useAuthStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Get initial collapsed state from localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save sidebar collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on window resize if it becomes desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Don't render layout if not authenticated or still loading
  if (!isAuthenticated || isLoading) {
    return null;
  }

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleSidebarCollapseToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Calculate main content padding based on sidebar state
  const getMainContentClasses = () => {
    const baseClasses = 'min-h-screen transition-all duration-300 pt-16';
    
    if (fullWidth) {
      return `${baseClasses} px-4 sm:px-6 lg:px-8`;
    }

    // Responsive left padding based on sidebar
    const desktopPadding = isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72';
    return `${baseClasses} pl-0 ${desktopPadding}`;
  };

  // Determine if we should show breadcrumbs
  const shouldShowBreadcrumb = showBreadcrumb && !fullWidth;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-earthy-beige/20 via-white to-mint-fresh/10 ${theme} ${className}`}>
      {/* Header */}
      <Header
        onMenuToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleSidebarCollapseToggle}
      />

      {/* Main Content Area */}
      <main className={getMainContentClasses()}>
        {/* Breadcrumb */}
        {shouldShowBreadcrumb && (
          <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-white/50 bg-white/30 backdrop-blur-sm">
            <Breadcrumb />
          </div>
        )}

        {/* Page Content */}
        <div className={`
          ${shouldShowBreadcrumb ? 'py-6' : 'py-8'} 
          ${fullWidth ? '' : 'px-4 sm:px-6 lg:px-8'}
          pb-20 lg:pb-8
        `}>
          {/* Content Container */}
          <div className={`
            ${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}
            animate-fade-in
          `}>
            {children || <Outlet />}
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Theme-based background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-bottle-green/5 rounded-full mix-blend-multiply animate-float"></div>
        <div 
          className="absolute top-40 right-32 w-24 h-24 bg-earthy-yellow/5 rounded-full mix-blend-multiply animate-float" 
          style={{ animationDelay: '1s' }}
        ></div>
        <div 
          className="absolute bottom-32 left-32 w-28 h-28 bg-mint-fresh/5 rounded-full mix-blend-multiply animate-float" 
          style={{ animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute bottom-20 right-20 w-20 h-20 bg-earthy-brown/5 rounded-full mix-blend-multiply animate-float" 
          style={{ animationDelay: '0.5s' }}
        ></div>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-earthy-beige/10 to-transparent"></div>
      </div>
    </div>
  );
};

// Specialized layout variants
export const DashboardLayout: React.FC<AppLayoutProps> = (props) => (
  <AppLayout {...props} showBreadcrumb={true} />
);

export const FullWidthLayout: React.FC<AppLayoutProps> = (props) => (
  <AppLayout {...props} fullWidth={true} showBreadcrumb={false} />
);

export const SimpleLayout: React.FC<AppLayoutProps> = (props) => (
  <AppLayout {...props} showBreadcrumb={false} />
);

export default AppLayout;