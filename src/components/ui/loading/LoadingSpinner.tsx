import React from 'react';
import { cn } from '@/utils/cn';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'muted' | 'white';
  className?: string;
  label?: string;
}

const spinnerSizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-4'
};

const spinnerColors = {
  primary: 'border-bottle-green/20 border-t-bottle-green',
  secondary: 'border-earthy-beige border-t-earthy-brown',
  muted: 'border-gray-200 border-t-gray-600',
  white: 'border-white/20 border-t-white'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  label = 'Loading...'
}) => {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label={label}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-solid',
          spinnerSizes[size],
          spinnerColors[color]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Overlay spinner for full-page loading
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerProps?: LoadingSpinnerProps;
}> = ({ isLoading, children, className, spinnerProps }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
        <LoadingSpinner size="lg" {...spinnerProps} />
      </div>
    </div>
  );
};

// Inline loading state
export const LoadingInline: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  spinnerProps?: LoadingSpinnerProps;
}> = ({ isLoading, children, fallback, spinnerProps }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="flex items-center justify-center p-8">
      {fallback || <LoadingSpinner {...spinnerProps} />}
    </div>
  );
};

// Loading dots animation
export const LoadingDots: React.FC<{
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
}> = ({ className, color = 'primary' }) => {
  const dotColors = {
    primary: 'bg-bottle-green',
    secondary: 'bg-earthy-brown',
    muted: 'bg-gray-400'
  };

  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full animate-pulse',
            dotColors[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Loading skeleton for text
export const LoadingSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('animate-pulse space-y-4', className)} role="status" aria-label="Loading content">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gradient-to-r from-earthy-beige/50 via-white to-earthy-beige/50 rounded-full',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

export default LoadingSpinner;