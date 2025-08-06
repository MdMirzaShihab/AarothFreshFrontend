import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  showPageInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

const paginationSizes = {
  sm: {
    button: 'px-2 py-1 text-sm min-h-[32px] min-w-[32px]',
    gap: 'gap-1'
  },
  md: {
    button: 'px-3 py-2 text-base min-h-[40px] min-w-[40px]',
    gap: 'gap-2'
  },
  lg: {
    button: 'px-4 py-3 text-lg min-h-[48px] min-w-[48px]',
    gap: 'gap-3'
  }
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  className,
  disabled = false,
  showPageInfo = true,
  totalItems,
  itemsPerPage
}) => {
  const sizeConfig = paginationSizes[size];

  const handlePageClick = (page: number) => {
    if (disabled || page === currentPage || page < 1 || page > totalPages) return;
    
    if (isTouchDevice()) {
      triggerHapticFeedback(25);
    }
    
    onPageChange(page);
  };

  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the start or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const renderPageInfo = () => {
    if (!showPageInfo || !totalItems || !itemsPerPage) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="text-sm text-text-muted">
        Showing <span className="font-medium text-text-dark">{startItem}</span> to{' '}
        <span className="font-medium text-text-dark">{endItem}</span> of{' '}
        <span className="font-medium text-text-dark">{totalItems}</span> results
      </div>
    );
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* Page info */}
      {renderPageInfo()}

      {/* Pagination controls */}
      <div className={cn('flex items-center', sizeConfig.gap)}>
        {/* First page button */}
        {showFirstLast && (
          <button
            onClick={() => handlePageClick(1)}
            disabled={disabled || currentPage === 1}
            className={cn(
              'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
              'border border-gray-200 bg-white text-text-dark',
              'hover:bg-earthy-beige/20 hover:border-earthy-beige/50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200',
              'touch-target touch-scale',
              sizeConfig.button
            )}
            aria-label="Go to first page"
          >
            First
          </button>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={cn(
              'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
              'border border-gray-200 bg-white text-text-dark',
              'hover:bg-earthy-beige/20 hover:border-earthy-beige/50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200',
              'touch-target touch-scale',
              sizeConfig.button
            )}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div
                key={`ellipsis-${index}`}
                className={cn(
                  'inline-flex items-center justify-center text-text-muted',
                  sizeConfig.button
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </div>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              disabled={disabled}
              className={cn(
                'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'touch-target touch-scale',
                sizeConfig.button,
                isActive
                  ? 'bg-gradient-secondary text-white shadow-lg shadow-glow-green/20'
                  : 'border border-gray-200 bg-white text-text-dark hover:bg-earthy-beige/20 hover:border-earthy-beige/50 disabled:hover:bg-white disabled:hover:border-gray-200'
              )}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next page button */}
        {showPrevNext && (
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className={cn(
              'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
              'border border-gray-200 bg-white text-text-dark',
              'hover:bg-earthy-beige/20 hover:border-earthy-beige/50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200',
              'touch-target touch-scale',
              sizeConfig.button
            )}
            aria-label="Go to next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Last page button */}
        {showFirstLast && (
          <button
            onClick={() => handlePageClick(totalPages)}
            disabled={disabled || currentPage === totalPages}
            className={cn(
              'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
              'border border-gray-200 bg-white text-text-dark',
              'hover:bg-earthy-beige/20 hover:border-earthy-beige/50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200',
              'touch-target touch-scale',
              sizeConfig.button
            )}
            aria-label="Go to last page"
          >
            Last
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;