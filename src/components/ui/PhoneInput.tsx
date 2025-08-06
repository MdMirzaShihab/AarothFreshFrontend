import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';
import { PhoneValidator } from '@/utils';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

// Common country codes with Bangladesh first
const COUNTRY_CODES: CountryCode[] = [
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+88' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', dialCode: '+971' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
];

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string, formatted: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | undefined;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Enter phone number',
  error,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]!);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nationalNumber, setNationalNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const validation = PhoneValidator.validate(value);
      if (validation.isValid) {
        const countryCode = validation.countryCode;
        const nationalNum = validation.nationalNumber;
        
        const country = COUNTRY_CODES.find(c => countryCode.startsWith(c.dialCode));
        if (country) {
          setSelectedCountry(country);
          setNationalNumber(nationalNum);
        }
      } else {
        // If invalid format, try to extract national number
        setNationalNumber(value.replace(/^\+\d+/, ''));
      }
    }
  }, [value]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    
    // Update the phone number with new country code
    const fullNumber = `${country.dialCode}${nationalNumber}`;
    const formatted = PhoneValidator.formatForDisplay(fullNumber);
    onChange?.(fullNumber, formatted);
    
    // Focus back to input
    inputRef.current?.focus();
  };

  const handleNationalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    setNationalNumber(input);
    
    // Create full phone number
    const fullNumber = input ? `${selectedCountry.dialCode}${input}` : '';
    const formatted = fullNumber ? PhoneValidator.formatForDisplay(fullNumber) : '';
    
    onChange?.(fullNumber, formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].includes(e.keyCode)) {
      return;
    }
    
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) {
      return;
    }
    
    // Only allow numeric input
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const displayValue = nationalNumber;
  const isValid = value ? PhoneValidator.validate(value).isValid : true;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          flex items-center w-full rounded-2xl transition-all duration-300 min-h-[44px]
          ${error ? 
            'border-2 border-tomato-red/30 bg-tomato-red/5 focus-within:border-tomato-red/50 focus-within:ring-2 focus-within:ring-tomato-red/10' : 
            'bg-earthy-beige/30 border-0 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-glow-green'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          ${isFocused ? 'bg-white shadow-lg shadow-glow-green' : ''}
        `}
      >
        {/* Country Code Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-3 h-full rounded-l-2xl
              hover:bg-black/5 transition-colors duration-200
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-bottle-green/40 focus:ring-offset-2
            `}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-text-dark">
              {selectedCountry.dialCode}
            </span>
            <ChevronDownIcon 
              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-64 overflow-y-auto">
              {COUNTRY_CODES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200
                    ${selectedCountry.code === country.code ? 'bg-bottle-green/5 text-bottle-green' : 'text-text-dark'}
                  `}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{country.name}</div>
                    <div className="text-sm text-text-muted">{country.dialCode}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <CheckIcon className="w-4 h-4 text-bottle-green" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          ref={inputRef}
          type="tel"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleNationalNumberChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            flex-1 px-4 py-3 bg-transparent border-0 rounded-r-2xl
            placeholder:text-text-muted/60 text-text-dark
            focus:outline-none disabled:cursor-not-allowed
          `}
          autoComplete="tel"
        />

        {/* Validation Indicator */}
        {value && !error && (
          <div className="px-4 py-3">
            {isValid ? (
              <CheckIcon className="w-5 h-5 text-mint-fresh" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-tomato-red/30" />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
          <span className="w-4 h-4 text-tomato-red/60">⚠</span>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && value && (
        <p className="text-text-muted text-xs mt-1">
          {PhoneValidator.validate(value).formatted || value}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;