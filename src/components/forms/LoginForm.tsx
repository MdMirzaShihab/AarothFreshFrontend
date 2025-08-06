import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { loginSchema, LoginFormData } from '@/schemas/auth.schemas';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { ApiError } from '@/types';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectPath = '/dashboard',
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
      rememberMe: false,
    },
  });

  // Watch phone value for PhoneInput
  const phoneValue = watch('phone');

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (response) => {
      // Store auth data
      loginStore(response.user, response.token);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: `Successfully logged in as ${response.user.name}`,
      });

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectPath);
      }
    },
    onError: (error: ApiError) => {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.status === 401) {
        setError('password', {
          type: 'manual',
          message: 'Invalid phone number or password',
        });
      } else if (error.status === 404) {
        setError('phone', {
          type: 'manual',
          message: 'No account found with this phone number',
        });
      } else if (error.status === 403) {
        addNotification({
          type: 'error',
          title: 'Account not verified',
          message: 'Please verify your phone number before logging in',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Login failed',
          message: error.message || 'Unable to log in. Please try again.',
        });
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      phone: data.phone,
      password: data.password,
    });
  };

  const handlePhoneChange = (value: string) => {
    setValue('phone', value, { shouldValidate: true });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-text-dark mb-2">
            Welcome Back
          </h1>
          <p className="text-text-muted">
            Sign in to your Aaroth Fresh account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone Number Field */}
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
              disabled={loginMutation.isPending}
              required
            />
          </div>

          {/* Password Field */}
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
                placeholder="Enter your password"
                disabled={loginMutation.isPending}
                className={`
                  w-full px-6 py-4 pr-12 rounded-2xl transition-all duration-300 min-h-[44px] focus:outline-none
                  ${errors.password ? 
                    'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10' : 
                    'bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green'
                  }
                  ${loginMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                  placeholder:text-text-muted/60 text-text-dark
                `}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={loginMutation.isPending}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('rememberMe')}
                type="checkbox"
                disabled={loginMutation.isPending}
                className="w-5 h-5 rounded-lg text-bottle-green focus:ring-0 focus:ring-offset-0 border-2 border-gray-200 transition-all duration-200 hover:border-bottle-green"
              />
              <span className="text-sm text-text-muted select-none">
                Remember me
              </span>
            </label>
            
            <Link
              to="/auth/forgot-password"
              className="text-sm text-bottle-green hover:text-bottle-green/80 font-medium transition-colors duration-200"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`
              w-full bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium 
              transition-all duration-300 min-h-[52px] border-0 focus:outline-none focus:ring-2 focus:ring-bottle-green/20
              ${loginMutation.isPending 
                ? 'opacity-75 cursor-not-allowed' 
                : 'hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5'
              }
              flex items-center justify-center gap-3
            `}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-text-muted">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="text-bottle-green hover:text-bottle-green/80 font-medium transition-colors duration-200"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;