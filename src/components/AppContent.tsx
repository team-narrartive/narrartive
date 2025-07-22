
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { NavigationManager } from './NavigationManager';
import { ViewRenderer } from './ViewRenderer';

type View = 'landing' | 'auth' | 'dashboard' | 'story-input' | 'creation' | 'settings' | 'feedback' | 'community' | 'projects' | 'story-reader' | 'password-reset';

export const AppContent = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentStory, setCurrentStory] = useState('');
  const [currentStoryId, setCurrentStoryId] = useState('');
  const [previousView, setPreviousView] = useState<View>('dashboard'); // Track where user came from
  const { user, loading } = useAuth();

  // Check for password reset in URL on component mount
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    console.log('Current path:', path, 'Hash:', hash);
    
    // Check if this is a password reset link
    if (path === '/reset-password' || hash.includes('type=recovery')) {
      console.log('Password reset link detected, showing password reset page');
      setCurrentView('password-reset');
      return;
    }
    
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    console.log('Auth state effect - User:', user?.email, 'Loading:', loading, 'Current view:', currentView);
    
    if (!loading && currentView !== 'password-reset') {
      if (user && currentView === 'landing') {
        console.log('Authenticated user detected, redirecting to dashboard');
        setCurrentView('dashboard');
      } else if (!user && currentView !== 'landing' && currentView !== 'auth') {
        console.log('Unauthenticated user detected, redirecting to landing');
        setCurrentView('landing');
      }
    }
  }, [user, loading, currentView]);

  const handleGetStarted = () => {
    console.log('Get started clicked');
    setCurrentView('auth');
  };

  const handleLogin = () => {
    console.log('Login clicked');
    setCurrentView('auth');
  };

  const handleAuthSuccess = () => {
    console.log('Auth success, redirecting to dashboard');
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    console.log('Back to landing clicked');
    setCurrentView('landing');
  };

  const handleCreateNew = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setCurrentView('story-input');
  };

  const handleBackToDashboard = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setCurrentView('dashboard');
  };

  const handleGenerateWidgets = (story: string) => {
    setCurrentStory(story);
    setCurrentView('creation');
  };

  const handleViewProjects = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setPreviousView('dashboard');
    setCurrentView('projects');
  };

  const handleViewCommunity = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setPreviousView('dashboard');
    setCurrentView('community');
  };

  const handleViewStory = (storyId: string) => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setPreviousView(currentView); // Remember where we came from
    setCurrentStoryId(storyId);
    setCurrentView('story-reader');
  };

  const handleBackFromStoryReader = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    // Go back to where we came from
    setCurrentView(previousView);
  };

  const handleBackToAuth = () => {
    console.log('Back to auth clicked');
    setCurrentView('auth');
  };

  if (loading && currentView !== 'password-reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavigationManager
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setCurrentStory={setCurrentStory}
        setCurrentStoryId={setCurrentStoryId}
      />
      <ViewRenderer
        currentView={currentView}
        currentStory={currentStory}
        currentStoryId={currentStoryId}
        previousView={previousView}
        user={user}
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={handleBackToLanding}
        onCreateNew={handleCreateNew}
        onBackToDashboard={handleBackToDashboard}
        onGenerateWidgets={handleGenerateWidgets}
        onViewProjects={handleViewProjects}
        onViewCommunity={handleViewCommunity}
        onViewStory={handleViewStory}
        onBackFromStoryReader={handleBackFromStoryReader}
        onBackToAuth={handleBackToAuth}
      />
    </>
  );
};
