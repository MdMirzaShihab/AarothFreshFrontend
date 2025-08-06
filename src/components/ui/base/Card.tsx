import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
  loading?: boolean;
}

const cardVariants = {
  default: 'bg-white shadow-sm border border-gray-100',
  elevated: 'bg-white shadow-lg hover:shadow-xl',
  glass: 'bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm',
  bordered: 'bg-white border-2 border-gray-200'
};

const cardPadding = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false,
  loading = false,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Base styles
        'rounded-3xl transition-all duration-300',
        
        // Variant styles
        cardVariants[variant],
        
        // Padding
        cardPadding[padding],
        
        // Hover effects
        hover && 'hover:shadow-2xl hover:shadow-shadow-soft hover:-translate-y-1',
        
        // Interactive styles
        interactive && [
          'cursor-pointer touch-target touch-scale',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40 focus-visible:ring-offset-2',
          'active:scale-[0.98]'
        ],
        
        // Loading state
        loading && 'animate-pulse pointer-events-none',
        
        className
      )}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {loading ? (
        // Loading skeleton
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-earthy-beige rounded-full w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-earthy-beige rounded-full"></div>
            <div className="h-4 bg-earthy-beige rounded-full w-5/6"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
});

Card.displayName = 'Card';

// Card sub-components
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight text-text-dark', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-muted leading-relaxed', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('pt-0', className)}
    {...props}
  />
));

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export default Card;