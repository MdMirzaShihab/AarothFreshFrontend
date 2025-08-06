import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  UserCheck,
  Tags,
  Bell,
  FileText
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/authStore';

interface AdminNavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  isActive?: boolean;
}

const AdminNavItem: React.FC<AdminNavItemProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  badge,
  isActive = false 
}) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group',
      'hover:bg-bottle-green/5 hover:text-bottle-green',
      'focus:outline-none focus:ring-2 focus:ring-bottle-green/40 focus:ring-offset-2',
      'touch-target touch-scale',
      isActive 
        ? 'bg-gradient-secondary text-white shadow-lg shadow-glow-green/20' 
        : 'text-text-dark/70'
    )}
  >
    <Icon className={cn(
      'w-5 h-5 transition-colors duration-200',
      isActive ? 'text-white' : 'text-current group-hover:text-bottle-green'
    )} />
    <span className="font-medium">{label}</span>
    {badge && badge > 0 && (
      <span className={cn(
        'ml-auto px-2 py-1 rounded-full text-xs font-medium',
        isActive 
          ? 'bg-white/20 text-white' 
          : 'bg-tomato-red text-white'
      )}>
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

export const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminNavItems = [
    {
      to: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      exact: true
    },
    {
      to: '/admin/users',
      icon: Users,
      label: 'User Management'
    },
    {
      to: '/admin/vendor-approvals',
      icon: UserCheck,
      label: 'Vendor Approvals',
      badge: 5 // This would come from API data
    },
    {
      to: '/admin/products',
      icon: Package,
      label: 'Products'
    },
    {
      to: '/admin/categories',
      icon: Tags,
      label: 'Categories'
    },
    {
      to: '/admin/orders',
      icon: ShoppingBag,
      label: 'Orders'
    },
    {
      to: '/admin/vendors',
      icon: Store,
      label: 'Vendors'
    },
    {
      to: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics'
    },
    {
      to: '/admin/reports',
      icon: FileText,
      label: 'Reports'
    },
    {
      to: '/admin/notifications',
      icon: Bell,
      label: 'Notifications'
    },
    {
      to: '/admin/settings',
      icon: Settings,
      label: 'Settings'
    }
  ];

  return (
    <nav className="space-y-2">
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Admin Panel
        </h3>
      </div>
      
      {adminNavItems.map((item) => (
        <AdminNavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          isActive={item.exact ? location.pathname === item.to : isActive(item.to)}
        />
      ))}
    </nav>
  );
};

export default AdminNavigation;