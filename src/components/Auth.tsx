import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { validatePassword, validateInput, sanitizeInput, VALIDATION_RULES } from '@/utils/validation';

interface AuthProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const { signUp, signIn, resetPassword } = useAuth();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!isResetMode) {
      // Validate password
      if (!isLogin) {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors[0];
        }
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }

      // Validate names for sign up
      if (!isLogin) {
        const firstNameValidation = validateInput(
          formData.firstName,
          VALIDATION_RULES.user.firstName,
          'First name'
        );
        if (!firstNameValidation.isValid) {
          errors.firstName = firstNameValidation.error!;
        }

        const lastNameValidation = validateInput(
          formData.lastName,
          VALIDATION_RULES.user.lastName,
          'Last name'
        );
        if (!lastNameValidation.isValid) {
          errors.lastName = lastNameValidation.error!;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const sanitizedData = {
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      if (isResetMode) {
        const { error } = await resetPassword(sanitizedData.email);
        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Password reset email sent! Check your inbox.');
        }
      } else if (isLogin) {
        const { error } = await signIn(sanitizedData.email, sanitizedData.password);
        if (error) {
          console.log('Sign in error:', error);
          setMessage(error.message);
        } else {
          console.log('Sign in successful');
          onSuccess();
        }
      } else {
        const { error } = await signUp(
          sanitizedData.email, 
          sanitizedData.password, 
          sanitizedData.firstName, 
          sanitizedData.lastName
        );
        if (error) {
          console.log('Sign up error:', error);
          setMessage(error.message);
        } else {
          setMessage('Account created! Please check your email to confirm your account.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    setMessage('');
    setValidationErrors({});
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setIsResetMode(false);
    resetForm();
  };

  const switchToSignUp = () => {
    setIsLogin(false);
    setIsResetMode(false);
    resetForm();
  };

  const switchToReset = () => {
    setIsResetMode(true);
    setIsLogin(true);
    resetForm();
  };

  const getTitle = () => {
    if (isResetMode) return 'Reset Password';
    return isLogin ? 'Welcome Back' : 'Join NarrArtive';
  };

  const getSubtitle = () => {
    if (isResetMode) return 'Enter your email to reset your password';
    return isLogin ? 'Sign in to continue your creative journey' : 'Start transforming your stories today';
  };

  const getButtonText = () => {
    if (loading) return 'Please wait...';
    if (isResetMode) return 'Send Reset Email';
    return isLogin ? 'Sign In' : 'Create Account';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl">
          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {getTitle()}
              </h1>
              <p className="text-gray-600 mt-2">
                {getSubtitle()}
              </p>
            </div>

            {/* Error/Success Message */}
            {message && (
              <div className={`mb-6 p-3 rounded-lg text-sm ${
                message.includes('sent') || message.includes('created') 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && !isResetMode && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                      disabled={loading}
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                      disabled={loading}
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                  disabled={loading}
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              {!isResetMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-white/80 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-12"
                      required
                      disabled={loading}
                      minLength={isLogin ? 6 : 8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>
                  )}
                  {!isLogin && formData.password && (
                    <PasswordStrengthMeter password={formData.password} />
                  )}
                </div>
              )}

              {isLogin && !isResetMode && (
                <div className="text-right">
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-emerald-600 hover:text-emerald-700 p-0"
                    onClick={switchToReset}
                    disabled={loading}
                  >
                    Forgot Password?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {getButtonText()}
              </Button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              {isResetMode ? (
                <p className="text-gray-600">
                  Remember your password?
                  <Button
                    variant="link"
                    onClick={switchToLogin}
                    className="text-emerald-600 hover:text-emerald-700 ml-1 p-0"
                    disabled={loading}
                  >
                    Sign In
                  </Button>
                </p>
              ) : (
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <Button
                    variant="link"
                    onClick={isLogin ? switchToSignUp : switchToLogin}
                    className="text-emerald-600 hover:text-emerald-700 ml-1 p-0"
                    disabled={loading}
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Button>
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
