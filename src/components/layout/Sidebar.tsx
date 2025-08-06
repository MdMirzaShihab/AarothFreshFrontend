import React, { useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  FileText,
  Truck,
  Store,
  ChefHat,
  ShoppingCart,
  TrendingUp,
  Bell,
  HelpCircle,
  Star,
  Calendar,
  CreditCard,
  Tag,
  Phone,
  Mail,
  ChevronRight,
  Leaf
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { USER_ROLES } from '@/constants';
import { useSwipeGesture, useTouchRipple, triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string | number;
  children?: NavigationItem[];
  roles?: string[];
  description?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  className = '',
}) => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Touch interaction hooks
  const { addRipple, rippleElements } = useTouchRipple();
  const sidebarRef = useRef<HTMLElement>(null);
  
  // Swipe to close/open sidebar on mobile
  const { bindSwipeEvents } = useSwipeGesture((gesture) => {
    if (window.innerWidth < 1024) {
      if (gesture.direction === 'left' && isOpen) {
        triggerHapticFeedback(30);
        onClose();
      } else if (gesture.direction === 'right' && !isOpen) {
        triggerHapticFeedback(30);
        // Would need to be handled by parent component to open
      }
    }
  });
  
  // Bind swipe events to sidebar
  useEffect(() => {
    bindSwipeEvents(sidebarRef.current);
  }, [bindSwipeEvents]);

  // Define navigation items with role-based filtering
  const allNavigationItems: NavigationItem[] = [
    // Common items for all users
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Overview and key metrics',
    },

    // Admin-specific items
    {
      id: 'admin-users',
      label: 'User Management',
      icon: Users,
      path: '/admin/users',
      roles: [USER_ROLES.ADMIN],
      description: 'Manage vendors and restaurants',
    },
    {
      id: 'admin-analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      roles: [USER_ROLES.ADMIN],
      description: 'Platform insights and reports',
    },
    {
      id: 'admin-categories',
      label: 'Categories',
      icon: Tag,
      path: '/admin/categories',
      roles: [USER_ROLES.ADMIN],
      description: 'Product category management',
    },

    // Vendor-specific items
    {
      id: 'vendor-products',
      label: 'My Products',
      icon: Package,
      path: '/vendor/products',
      roles: [USER_ROLES.VENDOR],
      description: 'Manage your product listings',
    },
    {
      id: 'vendor-orders',
      label: 'Orders',
      icon: ShoppingBag,
      path: '/vendor/orders',
      roles: [USER_ROLES.VENDOR],
      badge: '3',
      description: 'View and manage incoming orders',
    },
    {
      id: 'vendor-inventory',
      label: 'Inventory',
      icon: Store,
      path: '/vendor/inventory',
      roles: [USER_ROLES.VENDOR],
      description: 'Track stock levels and availability',
    },
    {
      id: 'vendor-analytics',
      label: 'Sales Analytics',
      icon: TrendingUp,
      path: '/vendor/analytics',
      roles: [USER_ROLES.VENDOR],
      description: 'Sales performance and trends',
    },

    // Restaurant-specific items
    {
      id: 'restaurant-marketplace',
      label: 'Marketplace',
      icon: ShoppingCart,
      path: '/restaurant/marketplace',
      roles: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
      description: 'Browse and order products',
    },
    {
      id: 'restaurant-orders',
      label: 'My Orders',
      icon: ChefHat,
      path: '/restaurant/orders',
      roles: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
      badge: '2',
      description: 'Track your order history',
    },
    {
      id: 'restaurant-suppliers',
      label: 'Suppliers',
      icon: Truck,
      path: '/restaurant/suppliers',
      roles: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
      description: 'Manage supplier relationships',
    },
    {
      id: 'restaurant-menu',
      label: 'Menu Planning',
      icon: FileText,
      path: '/restaurant/menu',
      roles: [USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
      description: 'Plan meals based on available ingredients',
    },

    // Common business items
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      path: '/payments',
      roles: [USER_ROLES.VENDOR, USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
      description: 'Payment history and methods',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar',
      roles: [USER_ROLES.VENDOR, USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER],
      description: 'Delivery schedules and events',
    },

    // Common items for all roles
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      description: 'View all notifications',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Star,
      path: '/profile',
      description: 'Manage your account',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      description: 'App preferences and configuration',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help',
      description: 'Get help and contact support',
    },
  ];

  // Filter navigation items based on user role
  const navigationItems = useMemo(() => {
    if (!user) return [];
    
    return allNavigationItems.filter(item => {
      // If no roles specified, show to all users
      if (!item.roles || item.roles.length === 0) return true;
      
      // Check if user's role is in the allowed roles
      return item.roles.includes(user.role);
    });
  }, [user]);

  const isActiveItem = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleItemClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Add touch feedback for navigation items
    if (isTouchDevice()) {
      addRipple(e);
      triggerHapticFeedback(25);
    }
    
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm touch-target"
          onClick={() => {
            if (isTouchDevice()) {
              triggerHapticFeedback(20);
            }
            onClose();
          }}
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed left-0 top-0 z-40 h-full bg-white/95 backdrop-blur-xl
          border-r border-gray-100 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          w-80 touch-manipulation
          ${className}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`
            flex items-center gap-3 p-6 border-b border-gray-100
            ${isCollapsed ? 'lg:justify-center lg:px-4' : ''}
          `}>
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="lg:block hidden">
                <h1 className="text-xl font-bold text-text-dark">Aaroth Fresh</h1>
                <p className="text-xs text-text-muted">B2B Marketplace</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = isActiveItem(item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={handleItemClick}
                    className={`
                      group flex items-center gap-3 px-3 py-3 rounded-2xl
                      transition-all duration-200 relative touch-target touch-scale 
                      touch-feedback overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-secondary text-white shadow-lg shadow-glow-green/20' 
                        : 'text-text-dark hover:bg-bottle-green/5 hover:text-bottle-green active:bg-bottle-green/10'
                      }
                      ${isCollapsed ? 'lg:justify-center lg:px-3' : ''}
                      focus:outline-none focus:ring-2 focus:ring-bottle-green/40 focus:ring-offset-2
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className={`
                        w-5 h-5 transition-all duration-200
                        ${isActive ? 'text-white' : 'text-current'}
                      `} />
                      {item.badge && (
                        <span className={`
                          absolute -top-1 -right-1 min-w-[16px] h-4 px-1 
                          bg-tomato-red text-white text-xs rounded-full 
                          flex items-center justify-center font-medium
                          ${isCollapsed ? 'lg:-right-2' : ''}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.label}</p>
                          {item.description && (
                            <p className={`
                              text-xs truncate transition-colors duration-200
                              ${isActive ? 'text-white/80' : 'text-text-muted'}
                            `}>
                              {item.description}
                            </p>
                          )}
                        </div>

                        {item.children && (
                          <ChevronRight className="w-4 h-4 text-current opacity-50" />
                        )}
                      </>
                    )}

                    {/* Touch ripple effect */}
                    {rippleElements}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className={`
            p-4 border-t border-gray-100 bg-gradient-to-r from-earthy-beige/30 to-mint-fresh/20
            ${isCollapsed ? 'lg:px-2' : ''}
          `}>
            {!isCollapsed ? (
              <div className="lg:block hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-text-dark">Need Help?</p>
                    <p className="text-text-muted">Contact Support</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>+880 1234-567890</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>support@aarothfresh.com</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:flex hidden justify-center">
                <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={(e) => {
                if (isTouchDevice()) {
                  addRipple(e);
                  triggerHapticFeedback(25);
                }
                onToggleCollapse();
              }}
              className={`
                hidden lg:flex items-center justify-center w-full mt-4 p-2 
                rounded-xl hover:bg-bottle-green/5 hover:text-bottle-green 
                transition-all duration-200 text-text-muted touch-target touch-scale
                touch-feedback relative overflow-hidden
                ${isCollapsed ? 'px-2' : ''}
                focus:outline-none focus:ring-2 focus:ring-bottle-green/40 focus:ring-offset-2
                active:bg-bottle-green/10
              `}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {rippleElements}
              <ChevronRight className={`
                w-4 h-4 transition-transform duration-200
                ${isCollapsed ? 'rotate-0' : 'rotate-180'}
              `} />
              {!isCollapsed && (
                <span className="ml-2 text-sm">Collapse</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;