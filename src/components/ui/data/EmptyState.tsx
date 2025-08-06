import React from 'react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const emptySizes = {
  sm: {
    container: 'py-8',
    icon: 'w-8 h-8',
    title: 'text-lg',
    description: 'text-sm'
  },
  md: {
    container: 'py-12',
    icon: 'w-12 h-12',
    title: 'text-xl',
    description: 'text-base'
  },
  lg: {
    container: 'py-16',
    icon: 'w-16 h-16',
    title: 'text-2xl',
    description: 'text-lg'
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  size = 'md'
}) => {
  const sizeConfig = emptySizes[size];

  const defaultIcon = (
    <svg className={cn('text-gray-400', sizeConfig.icon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center px-6',
      sizeConfig.container,
      className
    )}>
      <div className={cn('mb-4 text-gray-400', sizeConfig.icon)}>
        {icon || defaultIcon}
      </div>
      
      <h3 className={cn(
        'font-semibold text-text-dark/80 mb-2',
        sizeConfig.title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'text-text-muted mb-6 max-w-md leading-relaxed',
          sizeConfig.description
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="flex gap-3">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;