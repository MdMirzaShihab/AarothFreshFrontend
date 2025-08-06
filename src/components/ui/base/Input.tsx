import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const inputVariants = {
  default: 'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green',
  filled: 'bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-bottle-green/20',
  outline: 'bg-transparent border-2 border-gray-200 focus:border-bottle-green focus:bg-white'
};

const inputSizes = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-6 py-4 text-base min-h-[44px]',
  lg: 'px-8 py-5 text-lg min-h-[52px]'
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  fullWidth = true,
  loading = false,
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled || loading}
          className={cn(
            // Base styles
            'w-full rounded-2xl transition-all duration-300 placeholder:text-text-muted/60',
            'focus:outline-none focus:ring-0 touch-target',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            
            // Variant styles
            inputVariants[variant],
            
            // Size styles
            inputSizes[inputSize],
            
            // Icon padding adjustments
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            
            // Error state
            hasError && 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10',
            hasError && variant === 'default' && 'focus:shadow-tomato-red/20',
            
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {/* Right icon or loading spinner */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-bottle-green/30 border-t-bottle-green rounded-full animate-spin" />
          ) : rightIcon ? (
            rightIcon
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in"
          role="alert"
        >
          <svg className="w-4 h-4 text-tomato-red/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="text-text-muted text-sm mt-2"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;