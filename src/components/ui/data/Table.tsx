import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { LoadingSkeleton } from '../loading/LoadingSpinner';

export interface Column<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: string | ((record: T) => string);
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

const tableSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const cellPadding = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4'
};

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  sortBy,
  sortDirection,
  onSort,
  onRowClick,
  rowKey = 'id',
  className,
  size = 'md',
  striped = false,
  bordered = false,
  hoverable = true,
  emptyMessage = 'No data available',
  stickyHeader = false
}: TableProps<T>) => {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  const handleSort = (columnKey: string) => {
    if (!onSort) return;

    const newDirection = 
      sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    
    onSort(columnKey, newDirection);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-bottle-green" /> :
      <ChevronDown className="w-4 h-4 text-bottle-green" />;
  };

  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = record[column.key];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value?.toString() || '';
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-2xl border border-gray-100 overflow-hidden', className)}>
        <div className="p-6">
          <LoadingSkeleton lines={5} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl border border-gray-100 overflow-hidden',
      className
    )}>
      <div className="overflow-x-auto">
        <table className={cn('w-full', tableSizes[size])}>
          {/* Header */}
          <thead className={cn(
            'bg-earthy-beige/20 border-b border-gray-100',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left font-semibold text-text-dark/80 tracking-wide',
                    cellPadding[size],
                    column.sortable && 'cursor-pointer select-none hover:bg-earthy-beige/30 transition-colors duration-200',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  role={column.sortable ? 'button' : undefined}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  aria-sort={
                    column.sortable && sortBy === column.key
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : column.sortable ? 'none' : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length}
                  className={cn('text-center text-text-muted py-12', cellPadding[size])}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={cn(
                    'border-b border-gray-50 transition-colors duration-200',
                    striped && index % 2 === 1 && 'bg-gray-50/50',
                    hoverable && 'hover:bg-earthy-beige/10',
                    onRowClick && 'cursor-pointer',
                    bordered && 'border-b border-gray-200'
                  )}
                  onClick={() => onRowClick?.(record, index)}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(record, index);
                    }
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'text-text-dark',
                        cellPadding[size],
                        column.className
                      )}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;