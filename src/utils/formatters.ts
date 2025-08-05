// Formatting utilities for display

export class CurrencyFormatter {
  private static readonly CURRENCY_SYMBOLS: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  /**
   * Format price in Bangladeshi Taka
   */
  static formatBDT(amount: number): string {
    if (isNaN(amount)) return '৳0';
    
    return `৳${amount.toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Format price with currency symbol
   */
  static format(amount: number, currency: string = 'BDT'): string {
    if (isNaN(amount)) return `${this.CURRENCY_SYMBOLS[currency] || currency}0`;
    
    const symbol = this.CURRENCY_SYMBOLS[currency] || currency;
    
    return `${symbol}${amount.toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Format price per unit
   */
  static formatPerUnit(amount: number, unit: string): string {
    return `${this.formatBDT(amount)} per ${unit}`;
  }
}

export class DateFormatter {
  /**
   * Format date for display
   */
  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format date and time
   */
  static formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  static formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return this.formatDate(dateObj);
  }

  /**
   * Format time only
   */
  static formatTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid time';
    
    return dateObj.toLocaleTimeString('en-BD', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export class NumberFormatter {
  /**
   * Format large numbers with K, M suffixes
   */
  static formatCompact(num: number): string {
    if (isNaN(num)) return '0';
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  /**
   * Format percentage
   */
  static formatPercentage(num: number, decimals: number = 1): string {
    if (isNaN(num)) return '0%';
    return `${num.toFixed(decimals)}%`;
  }

  /**
   * Format weight/quantity with units
   */
  static formatQuantity(quantity: number, unit: string): string {
    if (isNaN(quantity)) return `0 ${unit}`;
    
    // Handle decimal places based on quantity
    const decimals = quantity < 1 ? 2 : quantity < 10 ? 1 : 0;
    
    return `${quantity.toFixed(decimals)} ${unit}`;
  }
}

export class TextFormatter {
  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || '';
    return `${text.substring(0, maxLength).trim()}...`;
  }

  /**
   * Capitalize first letter of each word
   */
  static titleCase(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Convert to slug (URL-friendly)
   */
  static slugify(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Extract initials from name
   */
  static getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2); // Max 2 characters
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

export class AddressFormatter {
  /**
   * Format address for display
   */
  static formatAddress(address: {
    street?: string;
    area?: string;
    city?: string;
    postalCode?: string;
  }): string {
    const parts = [
      address.street,
      address.area,
      address.city,
      address.postalCode,
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Format address for single line display
   */
  static formatAddressShort(address: {
    area?: string;
    city?: string;
  }): string {
    const parts = [address.area, address.city].filter(Boolean);
    return parts.join(', ');
  }
}