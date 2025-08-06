import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  ChevronDown,
  Leaf
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useThemeStore } from '@/stores/themeStore';
import { USER_ROLES } from '@/constants';
import { useTouchRipple, triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  isSidebarOpen,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, removeNotification } = useNotificationStore();
  const { theme, toggleTheme } = useThemeStore();
  
  // Touch interaction hooks
  const { addRipple, rippleElements } = useTouchRipple();
  
  // Calculate unread count (all visible notifications are considered unread)
  const unreadCount = notifications.filter(n => n.isVisible).length;
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    removeNotification(notificationId);
    setIsNotificationsOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getRoleDisplayName = (role: string) => {
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
        return 'User';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-tomato-red/10 text-tomato-red';
      case USER_ROLES.VENDOR:
        return 'bg-bottle-green/10 text-bottle-green';
      case USER_ROLES.RESTAURANT_OWNER:
        return 'bg-earthy-yellow/20 text-earthy-brown';
      case USER_ROLES.RESTAURANT_MANAGER:
        return 'bg-mint-fresh/20 text-bottle-green';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl 
      border-b border-gray-100 transition-all duration-300 h-16
      ${className}
    `}>
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Left section - Logo and Menu Toggle */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={(e) => {
              if (isTouchDevice()) {
                addRipple(e);
                triggerHapticFeedback(50);
              }
              onMenuToggle();
            }}
            className="lg:hidden touch-target touch-scale touch-feedback p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bottle-green/40 active:scale-95"
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {rippleElements}
            {isSidebarOpen ? (
              <X className="w-6 h-6 text-text-dark" />
            ) : (
              <Menu className="w-6 h-6 text-text-dark" />
            )}
          </button>

          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block text-xl font-bold text-text-dark">
              Aaroth Fresh
            </span>
          </Link>
        </div>

        {/* Center section - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, vendors..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 text-text-dark focus:outline-none touch-target"
                inputMode="search"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
          </form>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={(e) => {
              if (isTouchDevice()) {
                addRipple(e);
                triggerHapticFeedback(25);
              }
              toggleTheme();
            }}
            className="touch-target touch-scale touch-feedback p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bottle-green/40 active:scale-95"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {rippleElements}
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-earthy-yellow" />
            ) : (
              <Moon className="w-5 h-5 text-text-muted" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={(e) => {
                if (isTouchDevice()) {
                  addRipple(e);
                  triggerHapticFeedback(30);
                }
                setIsNotificationsOpen(!isNotificationsOpen);
              }}
              className="relative touch-target touch-scale touch-feedback p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bottle-green/40 active:scale-95"
              aria-label="Notifications"
            >
              {rippleElements}
              <Bell className="w-5 h-5 text-text-muted" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-tomato-red text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-text-dark">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-text-muted">{unreadCount} unread</p>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-50 last:border-b-0 bg-bottle-green/5 border-l-4 border-l-bottle-green"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                            ${notification.type === 'success' ? 'bg-mint-fresh/20 text-bottle-green' : ''}
                            ${notification.type === 'error' ? 'bg-tomato-red/10 text-tomato-red' : ''}
                            ${notification.type === 'warning' ? 'bg-earthy-yellow/20 text-earthy-brown' : ''}
                            ${notification.type === 'info' ? 'bg-blue-100 text-blue-600' : ''}
                          `}>
                            {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : '!'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-text-dark text-sm mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-text-muted text-xs leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-text-muted text-xs mt-1">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-text-muted">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>

                {notifications.length > 5 && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setIsNotificationsOpen(false);
                      }}
                      className="w-full text-center text-bottle-green hover:text-bottle-green/80 font-medium text-sm transition-colors duration-200"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={(e) => {
                if (isTouchDevice()) {
                  addRipple(e);
                  triggerHapticFeedback(25);
                }
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className="flex items-center gap-2 touch-target touch-scale touch-feedback p-1 pl-3 pr-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bottle-green/40 active:scale-95"
              aria-label="User menu"
            >
              {rippleElements}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-text-dark">{user?.name}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                      {getRoleDisplayName(user?.role || '')}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className={`
                  w-4 h-4 text-text-muted transition-transform duration-200
                  ${isUserMenuOpen ? 'rotate-180' : ''}
                `} />
              </div>
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                {/* User info header */}
                <div className="p-4 bg-gradient-to-br from-earthy-beige/20 to-mint-fresh/10 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark">{user?.name}</p>
                      <p className="text-sm text-text-muted">{user?.phone}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(user?.role || '')}`}>
                        {getRoleDisplayName(user?.role || '')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-text-dark"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-text-dark"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <div className="border-t border-gray-100 my-2"></div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-tomato-red/5 hover:text-tomato-red transition-colors duration-200 text-text-dark w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, vendors..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 text-text-dark focus:outline-none touch-target"
              inputMode="search"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;