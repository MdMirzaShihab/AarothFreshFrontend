import { z } from 'zod';
import { PhoneValidator } from '@/utils';
import { USER_ROLES } from '@/constants';

// Phone validation schema
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    (phone) => {
      const result = PhoneValidator.validate(phone);
      return result.isValid;
    },
    {
      message: 'Please enter a valid phone number with country code (e.g., +8801234567890)',
    }
  );

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// Name validation schema
const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces');

// Business name validation schema
const businessNameSchema = z
  .string()
  .min(2, 'Business name must be at least 2 characters')
  .max(100, 'Business name must not exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\.\-\_\&]+$/, 'Business name contains invalid characters');

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

// Login schema
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Base registration schema
const baseRegistrationSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  name: nameSchema,
  role: z.enum([USER_ROLES.VENDOR, USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER]),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Vendor-specific fields schema
const vendorFieldsSchema = z.object({
  businessName: businessNameSchema,
  businessType: z.string().min(1, 'Business type is required'),
  businessAddress: addressSchema,
  businessLicense: z.string().optional(),
});

// Restaurant-specific fields schema
const restaurantFieldsSchema = z.object({
  restaurantName: businessNameSchema,
  restaurantType: z.string().min(1, 'Restaurant type is required'),
  restaurantAddress: addressSchema,
  cuisineType: z.array(z.string()).optional(),
});

// Dynamic registration schema based on role
export const createRegistrationSchema = (role: string) => {
  let schema = baseRegistrationSchema;
  
  if (role === USER_ROLES.VENDOR) {
    schema = schema.merge(vendorFieldsSchema);
  } else if (role === USER_ROLES.RESTAURANT_OWNER || role === USER_ROLES.RESTAURANT_MANAGER) {
    schema = schema.merge(restaurantFieldsSchema);
  }
  
  return schema.refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );
};

// Full registration schema with all optional fields
export const registrationSchema = baseRegistrationSchema
  .merge(vendorFieldsSchema.partial())
  .merge(restaurantFieldsSchema.partial())
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  )
  .refine(
    (data) => {
      // Validate role-specific required fields
      if (data.role === USER_ROLES.VENDOR) {
        return data.businessName && data.businessType && data.businessAddress;
      }
      if (data.role === USER_ROLES.RESTAURANT_OWNER || data.role === USER_ROLES.RESTAURANT_MANAGER) {
        return data.restaurantName && data.restaurantType && data.restaurantAddress;
      }
      return true;
    },
    {
      message: 'Required fields for selected role are missing',
      path: ['role'],
    }
  );

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z
  .object({
    phone: phoneSchema,
    otp: z.string().min(4, 'OTP must be at least 4 digits').max(8, 'OTP must not exceed 8 digits'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// OTP verification schema
export const otpVerificationSchema = z.object({
  phone: phoneSchema,
  otp: z.string().min(4, 'OTP must be at least 4 digits').max(8, 'OTP must not exceed 8 digits'),
});

export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema,
  businessName: businessNameSchema.optional(),
  businessType: z.string().optional(),
  restaurantName: businessNameSchema.optional(),
  restaurantType: z.string().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Role selection schema for registration
export const roleSelectionSchema = z.object({
  role: z.enum([USER_ROLES.VENDOR, USER_ROLES.RESTAURANT_OWNER, USER_ROLES.RESTAURANT_MANAGER], {
    message: 'Please select your role',
  }),
});

export type RoleSelectionFormData = z.infer<typeof roleSelectionSchema>;

// Business types options
export const BUSINESS_TYPES = [
  'Vegetable Wholesaler',
  'Fruit Wholesaler',
  'Organic Produce Supplier',
  'Local Farmer',
  'Agricultural Cooperative',
  'Import/Export Company',
  'Food Distributor',
] as const;

// Restaurant types options
export const RESTAURANT_TYPES = [
  'Fine Dining',
  'Casual Dining',
  'Fast Food',
  'Cafe',
  'Bakery',
  'Food Truck',
  'Catering Service',
  'Hotel Restaurant',
  'Cloud Kitchen',
] as const;

// Cuisine types options
export const CUISINE_TYPES = [
  'Bangladeshi',
  'Indian',
  'Chinese',
  'Continental',
  'Italian',
  'Thai',
  'Mexican',
  'Middle Eastern',
  'Japanese',
  'Korean',
  'American',
  'Mediterranean',
] as const;