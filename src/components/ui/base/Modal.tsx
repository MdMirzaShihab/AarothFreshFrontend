import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full m-4'
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  contentClassName
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalRef.current?.focus();
        }
      }, 100);
    } else {
      // Restore previous focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
    return undefined;
  }, [isOpen]);

  // Focus trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      if (isTouchDevice()) {
        triggerHapticFeedback(30);
      }
      onClose();
    }
  };

  const handleClose = () => {
    if (isTouchDevice()) {
      triggerHapticFeedback(25);
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            'relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl',
            'border border-white/50 animate-scale-in w-full',
            'focus:outline-none',
            modalSizes[size],
            className
          )}
          onKeyDown={handleTabKey}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              {title && (
                <h2 
                  id="modal-title" 
                  className="text-xl font-semibold text-text-dark"
                >
                  {title}
                </h2>
              )}
              
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 touch-target touch-scale focus:outline-none focus:ring-2 focus:ring-bottle-green/40"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={cn('p-6', contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;