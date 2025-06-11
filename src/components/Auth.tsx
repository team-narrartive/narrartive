
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const { signUp, signIn, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isResetMode) {
        const { error } = await resetPassword(formData.email);
        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Password reset email sent! Check your inbox.');
        }
      } else if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          console.log('Sign in error:', error);
          setMessage(error.message);
        } else {
          console.log('Sign in successful');
          onSuccess();
        }
      } else {
        const { error } = await signUp(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName
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
      setMessage(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    setMessage('');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                  ? 'bg-green-100 text-green-700 border border-green-200' 
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
                      className="bg-white/60 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                      disabled={loading}
                    />
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
                      className="bg-white/60 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                      disabled={loading}
                    />
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
                  className="bg-white/60 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
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
                      className="bg-white/60 border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
                      required
                      disabled={loading}
                      minLength={6}
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
                </div>
              )}

              {isLogin && !isResetMode && (
                <div className="text-right">
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-purple-600 hover:text-purple-700 p-0"
                    onClick={switchToReset}
                    disabled={loading}
                  >
                    Forgot Password?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-300"
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
                    className="text-purple-600 hover:text-purple-700 ml-1 p-0"
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
                    className="text-purple-600 hover:text-purple-700 ml-1 p-0"
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
