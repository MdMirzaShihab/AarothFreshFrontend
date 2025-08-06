import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
  onClose?: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showCloseButton?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const toastStyles = {
  success: 'bg-mint-fresh/10 backdrop-blur-sm border border-mint-fresh/20 text-bottle-green',
  error: 'bg-tomato-red/5 backdrop-blur-sm border border-tomato-red/20 text-tomato-red/90',
  warning: 'bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 text-amber-800',
  info: 'bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-800'
};

const iconStyles = {
  success: 'text-mint-fresh',
  error: 'text-tomato-red',
  warning: 'text-amber-600',
  info: 'text-blue-600'
};

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  persistent = false,
  onClose,
  showCloseButton = true,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const Icon = toastIcons[type];

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss timer
    let dismissTimer: NodeJS.Timeout;
    if (!persistent && duration > 0) {
      dismissTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration, persistent]);

  const handleClose = () => {
    setIsLeaving(true);
    if (isTouchDevice()) {
      triggerHapticFeedback(20);
    }
    
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl shadow-lg transition-all duration-300 max-w-sm',
        'transform-gpu', // Enable hardware acceleration
        toastStyles[type],
        // Entrance/exit animations
        isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95',
        'animate-slide-up'
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', iconStyles[type])}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-sm mb-1 leading-tight">
              {title}
            </h4>
          )}
          <p className="text-sm leading-relaxed">
            {message}
          </p>
          
          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-3 text-sm font-medium underline hover:no-underline',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2',
                'touch-target'
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-lg transition-colors duration-200',
              'hover:bg-black/10 focus:outline-none',
              'focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2',
              'touch-target'
            )}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar for auto-dismiss */}
      {!persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-current opacity-50"
            style={{
              animation: `toast-progress ${duration}ms linear`,
              animationFillMode: 'forwards'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastProps['position'];
  className?: string;
}

const containerPositions = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  className
}) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={cn(
        'fixed z-[9999] space-y-3 max-w-sm pointer-events-none',
        containerPositions[position],
        className
      )}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default Toast;