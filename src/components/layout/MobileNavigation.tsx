import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  ShoppingCart,
  ChefHat,
  Store,
  TrendingUp,
  Truck,
  Settings
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { USER_ROLES } from '@/constants';
import { useTouchRipple, triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string | number;
  roles?: string[];
}

export const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Touch interaction hooks
  const { addRipple, rippleElements } = useTouchRipple();

  // Define mobile navigation items with role-based filtering
  const allMobileNavItems: MobileNavItem[] = [
    // Common dashboard item
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      path: '/dashboard',
    },

    // Admin-specific items
    {
      id: 'admin-users',
      label: 'Users',
      icon: Users,
      path: '/admin/users',
      roles: [USER_ROLES.ADMIN],
    },
    {
      id: 'admin-analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      roles: [USER_ROLES.ADMIN],
    },

    // Vendor-specific items
    {
      id: 'vendor-products',
      label: 'Products',
      icon: Package,
      path: '/vendor/products',
      roles: [USER_ROLES.VENDOR],
    },
    {
      id: 'vendor-orders',
      label: 'Orders',
      icon: ShoppingBag,
      path: '/vendor/orders',
      roles: [USER_ROLES.VENDOR],
      badge: '3',
    },
    {
      id: 'vendor-inventory',
      label: 'Inventory',
      icon: Store,
      path: '/vendor/inventory',
      roles: [USER_ROLES.VENDOR],
    },
    {
      id: 'vendor-analytics',
      label: 'Sales',
      icon: TrendingUp,
      path: '/vendor/analytics',
      roles: [USER_ROLES.VENDOR],
    },

    // Restaurant-specific items
    {
      id: 'restaurant-marketplace',
      label: 'Shop',
      icon: ShoppingCart,
      path: '/restaurant/marketplace',
      roles: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
    },
    {
      id: 'restaurant-orders',
      label: 'Orders',
      icon: ChefHat,
      path: '/restaurant/orders',
      roles: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
      badge: '2',
    },
    {
      id: 'restaurant-suppliers',
      label: 'Suppliers',
      icon: Truck,
      path: '/restaurant/suppliers',
      roles: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
    },

    // Common settings item (always last)
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  // Filter and limit navigation items based on user role (max 5 items for mobile)
  const mobileNavItems = useMemo(() => {
    if (!user) return [];
    
    const filteredItems = allMobileNavItems.filter(item => {
      // If no roles specified, show to all users
      if (!item.roles || item.roles.length === 0) return true;
      
      // Check if user's role is in the allowed roles
      return item.roles.includes(user.role);
    });

    // Limit to 5 items for optimal mobile experience
    // Always include dashboard (first) and settings (last)
    const dashboard = filteredItems.find(item => item.id === 'dashboard');
    const settings = filteredItems.find(item => item.id === 'settings');
    const otherItems = filteredItems.filter(item => 
      item.id !== 'dashboard' && item.id !== 'settings'
    );

    const result = [];
    if (dashboard) result.push(dashboard);
    
    // Add up to 3 role-specific items
    result.push(...otherItems.slice(0, 3));
    
    if (settings) result.push(settings);

    return result.slice(0, 5); // Ensure max 5 items
  }, [user]);

  const isActiveItem = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavItemClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Add touch feedback for mobile navigation
    if (isTouchDevice()) {
      addRipple(e);
      triggerHapticFeedback(35); // Slightly stronger feedback for important navigation
    }
  };

  // Don't render on desktop
  if (window.innerWidth >= 1024) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-100 safe-area-pb touch-manipulation">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive = isActiveItem(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={handleNavItemClick}
              className={`
                relative flex flex-col items-center justify-center p-3 min-w-[64px] 
                rounded-2xl transition-all duration-200 group touch-target touch-scale
                touch-feedback overflow-hidden
                ${isActive 
                  ? 'bg-gradient-secondary text-white shadow-lg shadow-glow-green/20' 
                  : 'text-text-muted hover:text-bottle-green hover:bg-bottle-green/5 active:bg-bottle-green/10'
                }
                focus:outline-none focus:ring-2 focus:ring-bottle-green/40 focus:ring-offset-2
              `}
            >
              {/* Icon with badge */}
              <div className="relative mb-1">
                <Icon className={`
                  w-5 h-5 transition-all duration-200
                  ${isActive ? 'text-white scale-110' : 'text-current group-hover:scale-105'}
                `} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-tomato-red text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`
                text-xs font-medium transition-all duration-200 leading-tight text-center
                ${isActive ? 'text-white' : 'text-current'}
              `}>
                {item.label}
              </span>

              {/* Touch ripple effect */}
              {rippleElements}

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-scale-in" />
              )}

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl bg-bottle-green/5 scale-0 group-hover:scale-100 transition-transform duration-200" />
              )}
            </Link>
          );
        })}
      </div>

      {/* iOS safe area bottom padding */}
      <div className="h-safe-bottom bg-white/95" />
    </nav>
  );
};

export default MobileNavigation;