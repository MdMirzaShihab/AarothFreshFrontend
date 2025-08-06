import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  fullWidth?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
  className?: string;
}

const searchSizes = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-6 py-4 text-base min-h-[44px]',
  lg: 'px-8 py-5 text-lg min-h-[52px]'
};

const searchVariants = {
  default: 'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green',
  filled: 'bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-bottle-green/20',
  outline: 'bg-transparent border-2 border-gray-200 focus:border-bottle-green focus:bg-white'
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  autoFocus = false,
  debounceMs = 300,
  className
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const searchValue = isControlled ? controlledValue : internalValue;

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (onSearch && searchValue !== '') {
      debounceRef.current = setTimeout(() => {
        onSearch(searchValue);
      }, debounceMs);
    }

    return undefined;

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue, onSearch, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (isTouchDevice()) {
      triggerHapticFeedback(25);
    }

    const newValue = '';
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn('relative', fullWidth && 'w-full', className)}
    >
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none z-10">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-bottle-green" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'w-full rounded-2xl transition-all duration-300',
          'placeholder:text-text-muted/60 text-text-dark',
          'focus:outline-none focus:ring-0 touch-target',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Variant styles
          searchVariants[variant],
          
          // Size styles
          searchSizes[size],
          
          // Icon padding
          'pl-12',
          searchValue && 'pr-12',
          
          // Focus ring
          isFocused && 'ring-2 ring-bottle-green/20',
        )}
        autoComplete="off"
        spellCheck="false"
      />

      {/* Clear button */}
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || loading}
          className={cn(
            'absolute right-4 top-1/2 transform -translate-y-1/2',
            'p-1 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text-dark',
            'transition-colors duration-200 touch-target',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green/40'
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;