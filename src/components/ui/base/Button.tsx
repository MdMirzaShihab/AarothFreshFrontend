import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { useTouchRipple, triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const buttonVariants = {
  primary: 'bg-gradient-secondary text-white hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none',
  secondary: 'bg-earthy-beige/30 text-text-dark hover:bg-earthy-beige/50 hover:text-earthy-brown border border-earthy-beige/50',
  outline: 'border-2 border-bottle-green text-bottle-green hover:bg-bottle-green hover:text-white disabled:hover:bg-transparent disabled:hover:text-bottle-green',
  ghost: 'text-bottle-green hover:bg-bottle-green/5 hover:text-bottle-green/80',
  danger: 'bg-tomato-red text-white hover:bg-tomato-red/90 hover:shadow-lg hover:shadow-tomato-red/20'
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm font-medium min-h-[36px]',
  md: 'px-6 py-3 text-base font-medium min-h-[44px]',
  lg: 'px-8 py-4 text-lg font-medium min-h-[52px]',
  xl: 'px-10 py-5 text-xl font-semibold min-h-[60px]'
};

const buttonRounds = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'lg',
  children,
  onClick,
  ...props
}, ref) => {
  const { addRipple, rippleElements } = useTouchRipple();
  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    if (isTouchDevice()) {
      addRipple(e);
      triggerHapticFeedback(25);
    }
    
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center font-medium transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'touch-target touch-scale touch-feedback overflow-hidden',
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles
        buttonSizes[size],
        
        // Rounded styles
        buttonRounds[rounded],
        
        // Full width
        fullWidth && 'w-full',
        
        // Loading state
        loading && 'cursor-not-allowed',
        
        className
      )}
      disabled={isDisabled}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      {/* Touch ripple effect */}
      {rippleElements}
      
      {/* Left icon or loading spinner */}
      {loading ? (
        <div className="mr-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leftIcon && (
        <span className="mr-2 flex-shrink-0">{leftIcon}</span>
      )}
      
      {/* Button content */}
      <span className={cn(
        'truncate',
        loading && 'opacity-70'
      )}>
        {children}
      </span>
      
      {/* Right icon */}
      {rightIcon && !loading && (
        <span className="ml-2 flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;