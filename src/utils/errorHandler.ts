// Global error handling utilities

import { toast } from '@/stores/notificationStore';
import { DEV_CONFIG, ERROR_MESSAGES } from '@/constants';

export interface ErrorInfo {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
  stack?: string;
}

export class ErrorHandler {
  /**
   * Handle API errors with user-friendly messages
   */
  static handleApiError(error: any): ErrorInfo {
    const errorInfo: ErrorInfo = {
      message: ERROR_MESSAGES.serverError,
      status: error?.response?.status,
      code: error?.code,
      details: error?.response?.data?.details,
      stack: error?.stack,
    };

    // Extract error message from response
    if (error?.response?.data?.message) {
      errorInfo.message = error.response.data.message;
    } else if (error?.message) {
      errorInfo.message = error.message;
    }

    // Handle specific HTTP status codes
    switch (error?.response?.status) {
      case 400:
        errorInfo.message = error?.response?.data?.message || ERROR_MESSAGES.validationError;
        break;
      case 401:
        errorInfo.message = ERROR_MESSAGES.unauthorized;
        break;
      case 403:
        errorInfo.message = ERROR_MESSAGES.forbidden;
        break;
      case 404:
        errorInfo.message = ERROR_MESSAGES.notFound;
        break;
      case 422:
        errorInfo.message = error?.response?.data?.message || ERROR_MESSAGES.validationError;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorInfo.message = ERROR_MESSAGES.serverError;
        break;
      default:
        if (error?.code === 'NETWORK_ERROR') {
          errorInfo.message = ERROR_MESSAGES.network;
        }
    }

    return errorInfo;
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any): ErrorInfo {
    const errorInfo = this.handleApiError(error);

    // Specific auth error handling
    switch (error?.response?.status) {
      case 401:
        errorInfo.message = ERROR_MESSAGES.invalidCredentials;
        break;
      case 423:
        errorInfo.message = ERROR_MESSAGES.accountSuspended;
        break;
      default:
        if (error?.response?.data?.message?.includes('approved')) {
          errorInfo.message = ERROR_MESSAGES.accountNotApproved;
        }
    }

    return errorInfo;
  }

  /**
   * Handle validation errors
   */
  static handleValidationErrors(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([field, fieldErrors]) => {
      fieldErrors.forEach(error => {
        toast.error(`${field}: ${error}`);
      });
    });
  }

  /**
   * Show error toast notification
   */
  static showError(error: any, customMessage?: string): void {
    const errorInfo = this.handleApiError(error);
    const message = customMessage || errorInfo.message;
    
    toast.error('Error', message);
    
    // Log error in development
    if (DEV_CONFIG.enableLogging) {
      console.error('Error occurred:', {
        error,
        errorInfo,
        customMessage,
      });
    }
  }

  /**
   * Show auth error toast notification
   */
  static showAuthError(error: any): void {
    const errorInfo = this.handleAuthError(error);
    toast.error('Authentication Error', errorInfo.message);
    
    // Log error in development
    if (DEV_CONFIG.enableLogging) {
      console.error('Auth error occurred:', {
        error,
        errorInfo,
      });
    }
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(): void {
    toast.error('Network Error', ERROR_MESSAGES.network);
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(error: any): void {
    const errorInfo = this.handleApiError(error);
    
    // Show validation errors if available
    if (errorInfo.details) {
      this.handleValidationErrors(errorInfo.details);
    } else {
      toast.error('Form Error', errorInfo.message);
    }
  }

  /**
   * Log error for monitoring/debugging
   */
  static logError(error: any, context?: string): void {
    const errorInfo = this.handleApiError(error);
    
    if (DEV_CONFIG.enableLogging) {
      console.error(`Error ${context ? `in ${context}` : ''}:`, {
        error,
        errorInfo,
        timestamp: new Date().toISOString(),
      });
    }

    // In production, send to error monitoring service
    if (DEV_CONFIG.isProduction) {
      // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
      this.sendToMonitoring(error, context);
    }
  }

  /**
   * Send error to monitoring service (placeholder)
   */
  private static sendToMonitoring(error: any, context?: string): void {
    // TODO: Implement error monitoring integration
    // Example: Sentry.captureException(error, { tags: { context } });
    console.warn('Error monitoring not implemented:', { error, context });
  }

  /**
   * Create user-friendly error message
   */
  static createUserMessage(error: any): string {
    const errorInfo = this.handleApiError(error);
    return errorInfo.message;
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
    const status = error?.response?.status;
    
    // Don't retry client errors (4xx)
    if (status >= 400 && status < 500) {
      return false;
    }
    
    // Retry server errors (5xx) and network errors
    return status >= 500 || error?.code === 'NETWORK_ERROR';
  }

  /**
   * Handle React error boundary errors
   */
  static handleReactError(error: Error, errorInfo: any): void {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Show user-friendly message
    toast.error(
      'Application Error',
      'Something went wrong. Please refresh the page and try again.'
    );
    
    // Log to monitoring service
    this.logError(error, 'React Error Boundary');
  }
}

// Convenience functions
export const showApiError = (error: any, customMessage?: string) => {
  ErrorHandler.showError(error, customMessage);
};

export const showAuthError = (error: any) => {
  ErrorHandler.showAuthError(error);
};

export const showFormError = (error: any) => {
  ErrorHandler.handleFormError(error);
};

export const showNetworkError = () => {
  ErrorHandler.handleNetworkError();
};

export const logError = (error: any, context?: string) => {
  ErrorHandler.logError(error, context);
};

export const isRetryableError = (error: any): boolean => {
  return ErrorHandler.isRetryableError(error);
};