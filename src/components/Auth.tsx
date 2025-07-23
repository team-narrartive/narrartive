
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#ffee8c' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/8 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s', backgroundColor: 'hsl(30, 80%, 95%)'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/8 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl card-premium">
          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-8 h-8"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground font-display">
                {getTitle()}
              </h1>
              <p className="text-muted-foreground mt-2">
                {getSubtitle()}
              </p>
            </div>

            {/* Error/Success Message */}
            {message && (
              <div className={`mb-6 p-3 rounded-lg text-sm ${
                message.includes('sent') || message.includes('created') 
                  ? 'bg-success-light text-success-foreground border border-success/20' 
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
                    className="bg-white/80 border-border focus:border-primary focus:ring-primary"
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
                    className="bg-white/80 border-border focus:border-primary focus:ring-primary"
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
                className="bg-white/80 border-border focus:border-primary focus:ring-primary"
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
                    className="bg-white/80 border-border focus:border-primary focus:ring-primary pr-12"
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
                     className="text-primary hover:text-primary/80 p-0"
                     onClick={switchToReset}
                     disabled={loading}
                   >
                     Forgot Password?
                   </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-elegant py-3 transition-all duration-300"
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
                    className="text-primary hover:text-primary/80 ml-1 p-0"
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
                    className="text-primary hover:text-primary/80 ml-1 p-0"
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
