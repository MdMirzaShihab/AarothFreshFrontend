// Phone number validation utilities for Bangladesh and international numbers

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  countryCode: string;
  nationalNumber: string;
  error?: string;
}

export class PhoneValidator {
  // Bangladesh mobile number patterns
  private static readonly BD_PATTERNS = [
    /^(\+88)?01[3-9]\d{8}$/, // Standard Bangladesh mobile
    /^(\+880)?1[3-9]\d{8}$/, // Alternative format
  ];

  // Common international patterns (basic validation)
  private static readonly INTERNATIONAL_PATTERN = /^\+\d{1,4}\d{4,14}$/;

  /**
   * Validate and format phone number
   * Prioritizes Bangladesh numbers but supports international
   */
  static validate(phone: string): PhoneValidationResult {
    if (!phone || typeof phone !== 'string') {
      return {
        isValid: false,
        formatted: '',
        countryCode: '',
        nationalNumber: '',
        error: 'Phone number is required',
      };
    }

    // Clean the input
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Try Bangladesh number validation first
    const bdResult = this.validateBangladeshNumber(cleaned);
    if (bdResult.isValid) {
      return bdResult;
    }

    // Try international number validation
    const intlResult = this.validateInternationalNumber(cleaned);
    if (intlResult.isValid) {
      return intlResult;
    }

    return {
      isValid: false,
      formatted: cleaned,
      countryCode: '',
      nationalNumber: '',
      error: 'Invalid phone number format',
    };
  }

  /**
   * Validate Bangladesh mobile numbers
   */
  private static validateBangladeshNumber(phone: string): PhoneValidationResult {
    for (const pattern of this.BD_PATTERNS) {
      if (pattern.test(phone)) {
        let formatted = phone;
        let nationalNumber = phone;

        // Normalize to +88 format
        if (phone.startsWith('+88')) {
          formatted = phone;
          nationalNumber = phone.substring(3);
        } else if (phone.startsWith('+880')) {
          formatted = phone.replace('+880', '+88');
          nationalNumber = phone.substring(4);
        } else if (phone.startsWith('88')) {
          formatted = `+${phone}`;
          nationalNumber = phone.substring(2);
        } else if (phone.startsWith('01')) {
          formatted = `+88${phone}`;
          nationalNumber = phone;
        } else {
          // Handle edge cases
          formatted = `+88${phone}`;
          nationalNumber = phone;
        }

        return {
          isValid: true,
          formatted,
          countryCode: '+88',
          nationalNumber,
        };
      }
    }

    return {
      isValid: false,
      formatted: phone,
      countryCode: '',
      nationalNumber: '',
      error: 'Invalid Bangladesh mobile number',
    };
  }

  /**
   * Basic international number validation
   */
  private static validateInternationalNumber(phone: string): PhoneValidationResult {
    if (this.INTERNATIONAL_PATTERN.test(phone)) {
      const countryCodeMatch = phone.match(/^\+(\d{1,4})/);
      const countryCode = countryCodeMatch ? `+${countryCodeMatch[1]}` : '';
      const nationalNumber = phone.replace(/^\+\d{1,4}/, '');

      return {
        isValid: true,
        formatted: phone,
        countryCode,
        nationalNumber,
      };
    }

    return {
      isValid: false,
      formatted: phone,
      countryCode: '',
      nationalNumber: '',
      error: 'Invalid international phone number',
    };
  }

  /**
   * Format phone number for display
   */
  static formatForDisplay(phone: string): string {
    const result = this.validate(phone);
    return result.isValid ? result.formatted : phone;
  }

  /**
   * Check if phone number is Bangladesh number
   */
  static isBangladeshNumber(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return this.BD_PATTERNS.some(pattern => pattern.test(cleaned));
  }

  /**
   * Get country code from phone number
   */
  static getCountryCode(phone: string): string {
    const result = this.validate(phone);
    return result.countryCode;
  }

  /**
   * Get national number (without country code)
   */
  static getNationalNumber(phone: string): string {
    const result = this.validate(phone);
    return result.nationalNumber;
  }
}

// Additional validation utilities
export class ValidationUtils {
  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let score = 0;

    if (!password) {
      return {
        isValid: false,
        errors: ['Password is required'],
        strength: 'weak',
      };
    }

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Validate email format (for notifications, not authentication)
   */
  static validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate business name
   */
  static validateBusinessName(name: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Business name is required' };
    }

    if (name.length < 2) {
      return { isValid: false, error: 'Business name must be at least 2 characters' };
    }

    if (name.length > 100) {
      return { isValid: false, error: 'Business name cannot exceed 100 characters' };
    }

    // Check for valid characters (letters, numbers, spaces, basic punctuation)
    if (!/^[a-zA-Z0-9\s\.\-\_\&]+$/.test(name)) {
      return { isValid: false, error: 'Business name contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate price (for listings)
   */
  static validatePrice(price: number | string): {
    isValid: boolean;
    error?: string;
  } {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return { isValid: false, error: 'Price must be a valid number' };
    }

    if (numPrice <= 0) {
      return { isValid: false, error: 'Price must be greater than 0' };
    }

    if (numPrice > 100000) {
      return { isValid: false, error: 'Price cannot exceed 100,000' };
    }

    // Check for reasonable decimal places (max 2)
    const decimalPlaces = (numPrice.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return { isValid: false, error: 'Price cannot have more than 2 decimal places' };
    }

    return { isValid: true };
  }
}