import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string | undefined;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Predefined route mapping for better UX
const routeLabels: Record<string, string> = {
  // Common routes
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/help': 'Help & Support',
  '/payments': 'Payments',
  '/calendar': 'Calendar',

  // Admin routes
  '/admin': 'Admin',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/analytics': 'Analytics',
  '/admin/categories': 'Categories',
  '/admin/settings': 'Admin Settings',

  // Vendor routes
  '/vendor': 'Vendor',
  '/vendor/dashboard': 'Vendor Dashboard',
  '/vendor/products': 'My Products',
  '/vendor/products/new': 'Add Product',
  '/vendor/products/edit': 'Edit Product',
  '/vendor/orders': 'Orders',
  '/vendor/orders/details': 'Order Details',
  '/vendor/inventory': 'Inventory',
  '/vendor/analytics': 'Sales Analytics',
  '/vendor/profile': 'Vendor Profile',

  // Restaurant routes
  '/restaurant': 'Restaurant',
  '/restaurant/dashboard': 'Restaurant Dashboard',
  '/restaurant/marketplace': 'Marketplace',
  '/restaurant/orders': 'My Orders',
  '/restaurant/orders/details': 'Order Details',
  '/restaurant/suppliers': 'Suppliers',
  '/restaurant/menu': 'Menu Planning',
  '/restaurant/profile': 'Restaurant Profile',

  // Authentication routes (shouldn't appear in breadcrumbs typically)
  '/auth': 'Authentication',
  '/auth/login': 'Sign In',
  '/auth/register': 'Sign Up',
  '/auth/forgot-password': 'Forgot Password',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  showHome = true,
}) => {
  const location = useLocation();

  // Generate breadcrumb items from current path if not provided
  const generatedItems = React.useMemo(() => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    // Add home if enabled
    if (showHome) {
      breadcrumbItems.push({
        label: 'Home',
        path: '/dashboard',
        isActive: location.pathname === '/dashboard',
      });
    }

    // Build breadcrumb from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Skip if it's the same as home path
      if (currentPath === '/dashboard' && showHome) return;

      // Get label from predefined mapping or format the segment
      let label = routeLabels[currentPath];
      if (!label) {
        // Format segment: remove hyphens/underscores, capitalize
        label = segment
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      breadcrumbItems.push({
        label,
        path: isLast ? undefined : currentPath, // Don't make last item clickable
        isActive: isLast,
      });
    });

    return breadcrumbItems;
  }, [items, location.pathname, showHome]);

  // Don't render if only one item and it's home
  if (generatedItems.length <= 1 && showHome) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {generatedItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {/* Separator */}
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-text-muted/60 mx-2 flex-shrink-0" />
            )}

            {/* Breadcrumb item */}
            <div className="flex items-center">
              {/* Home icon for first item if it's home */}
              {index === 0 && showHome && item.path === '/dashboard' && (
                <Home className="w-4 h-4 mr-1.5 text-current" />
              )}

              {/* Link or span based on whether item is clickable */}
              {item.path && !item.isActive ? (
                <Link
                  to={item.path}
                  className={`
                    text-text-muted hover:text-bottle-green transition-colors duration-200
                    font-medium truncate max-w-[150px] sm:max-w-[200px]
                  `}
                  title={item.label}
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={`
                    font-medium truncate max-w-[150px] sm:max-w-[200px]
                    ${item.isActive 
                      ? 'text-text-dark' 
                      : 'text-text-muted'
                    }
                  `}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Hook to build custom breadcrumb items programmatically
export const useBreadcrumb = () => {
  const setBreadcrumbItems = (items: BreadcrumbItem[]) => {
    // This could be extended to use context or store for more complex scenarios
    return items;
  };

  return { setBreadcrumbItems };
};

export default Breadcrumb;