import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/schemas/auth.schemas';
import { AuthService } from '@/services/auth.service';
import { useNotificationStore } from '@/stores/notificationStore';
import { ApiError } from '@/types';

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone: '',
    },
  });

  // Watch phone value for PhoneInput
  const phoneValue = watch('phone');

  const forgotPasswordMutation = useMutation({
    mutationFn: AuthService.forgotPassword,
    onSuccess: () => {
      setIsSubmitted(true);
      addNotification({
        type: 'success',
        title: 'Reset link sent!',
        message: 'Check your phone for the password reset code',
      });
    },
    onError: (error: ApiError) => {
      console.error('Forgot password error:', error);
      
      if (error.status === 404) {
        setError('phone', {
          type: 'manual',
          message: 'No account found with this phone number',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Request failed',
          message: error.message || 'Unable to send reset code. Please try again.',
        });
      }
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate({
      phone: data.phone,
    });
  };

  const handlePhoneChange = (value: string) => {
    setValue('phone', value, { shouldValidate: true });
  };

  const handleBackToLogin = () => {
    navigate('/auth/login');
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Check Your Phone | Aaroth Fresh Password Reset</title>
          <meta name="description" content="Password reset code sent to your phone. Check your messages to reset your Aaroth Fresh account password." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <AuthLayout
          title="Check Your Phone"
          subtitle="Password reset code sent"
          showBackButton={true}
          backPath="/auth/login"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-mint-fresh/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-bottle-green" />
            </div>
            
            <h1 className="text-2xl font-medium text-text-dark mb-4">
              Code Sent Successfully!
            </h1>
            
            <div className="space-y-4 text-text-muted mb-8">
              <p>
                We've sent a password reset code to your phone number:
              </p>
              <p className="font-medium text-bottle-green bg-bottle-green/5 px-4 py-2 rounded-xl">
                {phoneValue}
              </p>
              <p className="text-sm">
                Enter the code in the text message to reset your password. 
                The code will expire in 10 minutes.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/auth/reset-password', { 
                  state: { phone: phoneValue } 
                })}
                className="w-full bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 transition-all duration-300"
              >
                I Have the Code
              </button>
              
              <button
                onClick={handleBackToLogin}
                className="w-full text-bottle-green hover:text-bottle-green/80 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-bottle-green/5"
              >
                Back to Sign In
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-text-muted">
                Didn't receive the code?{' '}
                <button
                  onClick={() => onSubmit({ phone: phoneValue })}
                  disabled={forgotPasswordMutation.isPending}
                  className="text-bottle-green hover:text-bottle-green/80 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Resend code'}
                </button>
              </p>
            </div>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password | Aaroth Fresh - Reset Your Account Password</title>
        <meta 
          name="description" 
          content="Forgot your Aaroth Fresh password? Enter your phone number to receive a password reset code and regain access to your account." 
        />
        <meta name="keywords" content="forgot password, reset password, Aaroth Fresh, account recovery, password help" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AuthLayout
        title="Forgot Password"
        subtitle="We'll send you a reset code"
        showBackButton={true}
        backPath="/auth/login"
      >
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-medium text-text-dark mb-2">
                Reset Your Password
              </h1>
              <p className="text-text-muted">
                Enter your phone number and we'll send you a code to reset your password
              </p>
            </div>

            {/* Form */}
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
                  disabled={forgotPasswordMutation.isPending}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className={`
                  w-full bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium 
                  transition-all duration-300 min-h-[52px] border-0 focus:outline-none focus:ring-2 focus:ring-bottle-green/20
                  ${forgotPasswordMutation.isPending 
                    ? 'opacity-75 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5'
                  }
                  flex items-center justify-center gap-3
                `}
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Reset Code
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 text-bottle-green hover:text-bottle-green/80 font-medium transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default ForgotPasswordPage;