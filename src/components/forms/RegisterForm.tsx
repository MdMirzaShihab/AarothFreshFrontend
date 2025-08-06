import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { 
  registrationSchema, 
  RegistrationFormData,
  BUSINESS_TYPES,
  RESTAURANT_TYPES
} from '@/schemas/auth.schemas';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { ApiError } from '@/types';
import { USER_ROLES } from '@/constants';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  redirectPath = '/dashboard',
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phone: '',
      password: '',
      confirmPassword: '',
      name: '',
      termsAccepted: false,
    },
  });

  // Watch form values
  const phoneValue = watch('phone');
  const selectedRole = watch('role');

  // Determine if role-specific fields should be shown
  const showVendorFields = selectedRole === USER_ROLES.VENDOR;
  const showRestaurantFields = selectedRole === USER_ROLES.RESTAURANT_OWNER || selectedRole === USER_ROLES.RESTAURANT_MANAGER;

  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: (response) => {
      // Store auth data
      loginStore(response.user, response.token);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Account created successfully!',
        message: `Welcome to Aaroth Fresh, ${response.user.name}`,
      });

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectPath);
      }
    },
    onError: (error: ApiError) => {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.status === 409) {
        setError('phone', {
          type: 'manual',
          message: 'An account with this phone number already exists',
        });
      } else if (error.status === 400) {
        addNotification({
          type: 'error',
          title: 'Invalid information',
          message: error.message || 'Please check your information and try again',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Registration failed',
          message: error.message || 'Unable to create account. Please try again.',
        });
      }
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    const requestData: any = {
      phone: data.phone,
      password: data.password,
      name: data.name,
      role: data.role,
    };

    // Add vendor fields if needed
    if (showVendorFields && data.businessName && data.businessType && data.businessAddress) {
      requestData.businessName = data.businessName;
      requestData.businessType = data.businessType;
      requestData.businessAddress = data.businessAddress;
      if (data.businessLicense) {
        requestData.businessLicense = data.businessLicense;
      }
    }

    // Add restaurant fields if needed
    if (showRestaurantFields && data.restaurantName && data.restaurantType && data.restaurantAddress) {
      requestData.restaurantName = data.restaurantName;
      requestData.restaurantType = data.restaurantType;
      requestData.restaurantAddress = data.restaurantAddress;
      if (data.cuisineType && data.cuisineType.length > 0) {
        requestData.cuisineType = data.cuisineType;
      }
    }

    registerMutation.mutate(requestData);
  };

  const handlePhoneChange = (value: string) => {
    setValue('phone', value, { shouldValidate: true });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const roleOptions = [
    { value: USER_ROLES.VENDOR, label: 'Vendor', description: 'Sell fresh produce to restaurants' },
    { value: USER_ROLES.RESTAURANT_OWNER, label: 'Restaurant Owner', description: 'Purchase ingredients for your restaurant' },
    { value: USER_ROLES.RESTAURANT_MANAGER, label: 'Restaurant Manager', description: 'Manage restaurant operations' },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-text-dark mb-2">
            Join Aaroth Fresh
          </h1>
          <p className="text-text-muted">
            Create your account to start buying or selling fresh produce
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
              >
                Full Name <span className="text-tomato-red">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Enter your full name"
                disabled={registerMutation.isPending}
                className={`
                  w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                  ${errors.name ? 
                    'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                    'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                  }
                  ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                  placeholder:text-text-muted/60 text-text-dark
                `}
              />
              {errors.name && (
                <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
              >
                Phone Number <span className="text-tomato-red">*</span>
              </label>
              <PhoneInput
                id="phone"
                value={phoneValue}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                error={errors.phone?.message}
                disabled={registerMutation.isPending}
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide">
              I am a <span className="text-tomato-red">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    relative cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200
                    ${selectedRole === option.value
                      ? 'border-bottle-green bg-bottle-green/5 ring-2 ring-bottle-green/20'
                      : 'border-gray-200 hover:border-bottle-green/30 hover:bg-bottle-green/5'
                    }
                    ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    {...register('role')}
                    type="radio"
                    value={option.value}
                    disabled={registerMutation.isPending}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium text-text-dark mb-1">{option.label}</div>
                    <div className="text-sm text-text-muted">{option.description}</div>
                  </div>
                  {selectedRole === option.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-bottle-green rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Vendor-Specific Fields */}
          {showVendorFields && (
            <div className="space-y-6 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-text-dark">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div>
                  <label 
                    htmlFor="businessName" 
                    className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
                  >
                    Business Name <span className="text-tomato-red">*</span>
                  </label>
                  <input
                    {...register('businessName')}
                    type="text"
                    id="businessName"
                    placeholder="Enter your business name"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.businessName ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  {errors.businessName && (
                    <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                      <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                {/* Business Type */}
                <div>
                  <label 
                    htmlFor="businessType" 
                    className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
                  >
                    Business Type <span className="text-tomato-red">*</span>
                  </label>
                  <select
                    {...register('businessType')}
                    id="businessType"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none appearance-none cursor-pointer
                      ${errors.businessType ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                      text-text-dark
                    `}
                  >
                    <option value="">Select business type</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                      <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                      {errors.businessType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Business Address */}
              <div>
                <label className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide">
                  Business Address <span className="text-tomato-red">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    {...register('businessAddress.street')}
                    type="text"
                    placeholder="Street address"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.businessAddress?.street ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  <input
                    {...register('businessAddress.area')}
                    type="text"
                    placeholder="Area/Neighborhood"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.businessAddress?.area ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  <input
                    {...register('businessAddress.city')}
                    type="text"
                    placeholder="City"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.businessAddress?.city ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  <input
                    {...register('businessAddress.postalCode')}
                    type="text"
                    placeholder="Postal code"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.businessAddress?.postalCode ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                </div>
              </div>

              {/* Business License (Optional) */}
              <div>
                <label 
                  htmlFor="businessLicense" 
                  className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
                >
                  Business License Number (Optional)
                </label>
                <input
                  {...register('businessLicense')}
                  type="text"
                  id="businessLicense"
                  placeholder="Enter business license number"
                  disabled={registerMutation.isPending}
                  className={`
                    w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                    bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green
                    ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                    placeholder:text-text-muted/60 text-text-dark
                  `}
                />
              </div>
            </div>
          )}

          {/* Restaurant-Specific Fields */}
          {showRestaurantFields && (
            <div className="space-y-6 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-text-dark">Restaurant Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant Name */}
                <div>
                  <label 
                    htmlFor="restaurantName" 
                    className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
                  >
                    Restaurant Name <span className="text-tomato-red">*</span>
                  </label>
                  <input
                    {...register('restaurantName')}
                    type="text"
                    id="restaurantName"
                    placeholder="Enter your restaurant name"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.restaurantName ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  {errors.restaurantName && (
                    <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                      <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                      {errors.restaurantName.message}
                    </p>
                  )}
                </div>

                {/* Restaurant Type */}
                <div>
                  <label 
                    htmlFor="restaurantType" 
                    className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
                  >
                    Restaurant Type <span className="text-tomato-red">*</span>
                  </label>
                  <select
                    {...register('restaurantType')}
                    id="restaurantType"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none appearance-none cursor-pointer
                      ${errors.restaurantType ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                      text-text-dark
                    `}
                  >
                    <option value="">Select restaurant type</option>
                    {RESTAURANT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.restaurantType && (
                    <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                      <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                      {errors.restaurantType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Restaurant Address */}
              <div>
                <label className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide">
                  Restaurant Address <span className="text-tomato-red">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    {...register('restaurantAddress.street')}
                    type="text"
                    placeholder="Street address"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.restaurantAddress?.street ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  <input
                    {...register('restaurantAddress.area')}
                    type="text"
                    placeholder="Area/Neighborhood"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.restaurantAddress?.area ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  <input
                    {...register('restaurantAddress.city')}
                    type="text"
                    placeholder="City"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.restaurantAddress?.city ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                  <input
                    {...register('restaurantAddress.postalCode')}
                    type="text"
                    placeholder="Postal code"
                    disabled={registerMutation.isPending}
                    className={`
                      w-full px-6 py-4 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                      ${errors.restaurantAddress?.postalCode ? 
                        'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                        'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                      }
                      placeholder:text-text-muted/60 text-text-dark
                    `}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
              >
                Password <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Create password"
                  disabled={registerMutation.isPending}
                  className={`
                    w-full px-6 py-4 pr-12 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                    ${errors.password ? 
                      'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                      'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                    }
                    ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                    placeholder:text-text-muted/60 text-text-dark
                  `}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={registerMutation.isPending}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors duration-200 focus:outline-none focus:text-bottle-green"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-text-dark/80 mb-3 tracking-wide"
              >
                Confirm Password <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  disabled={registerMutation.isPending}
                  className={`
                    w-full px-6 py-4 pr-12 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                    ${errors.confirmPassword ? 
                      'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                      'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                    }
                    ${registerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                    placeholder:text-text-muted/60 text-text-dark
                  `}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={registerMutation.isPending}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors duration-200 focus:outline-none focus:text-bottle-green"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...register('termsAccepted')}
                type="checkbox"
                disabled={registerMutation.isPending}
                className="w-5 h-5 rounded-lg text-bottle-green focus:ring-0 focus:ring-offset-0 border-2 border-gray-200 transition-all duration-200 hover:border-bottle-green mt-0.5"
              />
              <span className="text-sm text-text-muted select-none leading-relaxed">
                I agree to Aaroth Fresh's{' '}
                <Link to="/terms" className="text-bottle-green hover:text-bottle-green/80 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-bottle-green hover:text-bottle-green/80 font-medium">
                  Privacy Policy
                </Link>
                <span className="text-tomato-red ml-1">*</span>
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.termsAccepted.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className={`
              w-full bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium 
              transition-all duration-300 min-h-[52px] border-0 focus:outline-none focus:ring-2 focus:ring-bottle-green/20
              ${registerMutation.isPending 
                ? 'opacity-75 cursor-not-allowed' 
                : 'hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5'
              }
              flex items-center justify-center gap-3
            `}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-text-muted">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-bottle-green hover:text-bottle-green/80 font-medium transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;