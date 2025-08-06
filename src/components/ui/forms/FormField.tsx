import React from 'react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  layout?: 'vertical' | 'horizontal';
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  children,
  className,
  labelClassName,
  layout = 'vertical'
}) => {
  const hasError = !!error;

  return (
    <div className={cn(
      'space-y-3',
      layout === 'horizontal' && 'sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:space-y-0',
      className
    )}>
      {/* Label */}
      {label && (
        <label className={cn(
          'block text-sm font-medium text-text-dark/80 tracking-wide',
          layout === 'horizontal' && 'sm:pt-3',
          labelClassName
        )}>
          {label}
          {required && (
            <span className="text-tomato-red ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Field wrapper */}
      <div className={cn(
        layout === 'horizontal' && 'sm:col-span-2'
      )}>
        {children}

        {/* Error message */}
        {hasError && (
          <ErrorMessage error={error} />
        )}

        {/* Helper text */}
        {helperText && !hasError && (
          <p className="text-text-muted text-sm mt-2 leading-relaxed">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
};

// Error message component
export const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <p 
    className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in"
    role="alert"
  >
    <svg className="w-4 h-4 text-tomato-red/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    {error}
  </p>
);

// Form group for multiple related fields
export const FormGroup: React.FC<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className }) => (
  <div className={cn('space-y-6', className)}>
    {(title || description) && (
      <div className="space-y-1">
        {title && (
          <h3 className="text-lg font-semibold text-text-dark">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-text-muted text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
    )}
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

export default FormField;