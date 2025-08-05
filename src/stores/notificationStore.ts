import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 means persistent
  isVisible: boolean;
  createdAt: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
}

interface NotificationActions {
  // Add notifications
  addNotification: (notification: Omit<Notification, 'id' | 'isVisible' | 'createdAt'>) => string;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  
  // Remove notifications
  removeNotification: (id: string) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
  clearByType: (type: NotificationType) => void;
  
  // Update notifications
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  
  // Settings
  setMaxNotifications: (max: number) => void;
}

type NotificationStore = NotificationState & NotificationActions;

const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      maxNotifications: 5,

      // Add notifications
      addNotification: (notificationData) => {
        const id = generateNotificationId();
        const notification: Notification = {
          ...notificationData,
          id,
          isVisible: true,
          createdAt: new Date().toISOString(),
          duration: notificationData.duration ?? DEFAULT_DURATIONS[notificationData.type],
        };

        set((state) => {
          let newNotifications = [...state.notifications, notification];
          
          // Limit the number of notifications
          if (newNotifications.length > state.maxNotifications) {
            newNotifications = newNotifications.slice(-state.maxNotifications);
          }
          
          return { notifications: newNotifications };
        });

        // Auto-remove notification if it has a duration
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }

        return id;
      },

      success: (title, message, duration) => {
        return get().addNotification({
          type: 'success',
          title,
          ...(message && { message }),
          ...(duration && { duration }),
        });
      },

      error: (title, message, duration) => {
        return get().addNotification({
          type: 'error',
          title,
          ...(message && { message }),
          ...(duration && { duration }),
        });
      },

      warning: (title, message, duration) => {
        return get().addNotification({
          type: 'warning',
          title,
          ...(message && { message }),
          ...(duration && { duration }),
        });
      },

      info: (title, message, duration) => {
        return get().addNotification({
          type: 'info',
          title,
          ...(message && { message }),
          ...(duration && { duration }),
        });
      },

      // Remove notifications
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      hideNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, isVisible: false } : n
          ),
        }));

        // Remove from array after animation completes
        setTimeout(() => {
          get().removeNotification(id);
        }, 300);
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      clearByType: (type) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.type !== type),
        }));
      },

      // Update notifications
      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, ...updates } : n
          ),
        }));
      },

      // Settings
      setMaxNotifications: (maxNotifications) => {
        set({ maxNotifications });
      },
    }),
    {
      name: 'notification-store',
    }
  )
);

// Helper hooks
export const useNotifications = () => {
  const {
    notifications,
    addNotification,
    removeNotification,
    hideNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  } = useNotificationStore();

  return {
    notifications: notifications.filter(n => n.isVisible),
    addNotification,
    removeNotification,
    hideNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };
};

export const useToast = () => {
  const { success, error, warning, info } = useNotificationStore();

  return {
    toast: {
      success,
      error,
      warning,
      info,
    },
  };
};

// Quick toast functions for global use
export const toast = {
  success: (title: string, message?: string) => 
    useNotificationStore.getState().success(title, message),
  
  error: (title: string, message?: string) => 
    useNotificationStore.getState().error(title, message),
  
  warning: (title: string, message?: string) => 
    useNotificationStore.getState().warning(title, message),
  
  info: (title: string, message?: string) => 
    useNotificationStore.getState().info(title, message),
};

// Utility functions for common use cases
export const showApiError = (error: any) => {
  const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
  toast.error('Error', message);
};

export const showApiSuccess = (message: string) => {
  toast.success('Success', message);
};

export const showValidationErrors = (errors: Record<string, string[]>) => {
  Object.entries(errors).forEach(([field, fieldErrors]) => {
    fieldErrors.forEach(error => {
      toast.error(`${field}: ${error}`);
    });
  });
};

export const showNetworkError = () => {
  toast.error(
    'Network Error',
    'Please check your internet connection and try again.'
  );
};

export const showMaintenanceNotice = () => {
  toast.warning(
    'Maintenance Notice',
    'The system is currently under maintenance. Some features may be unavailable.'
  );
};