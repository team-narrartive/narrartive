import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, useAuth } from './hooks/useAuth';
import { Landing } from './components/Landing';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { StoryInput } from './components/StoryInput';
import { Settings } from './components/Settings';
import { Feedback } from './components/Feedback';
import { CommunityShowcase } from './components/CommunityShowcase';
import { MyProjects } from './components/MyProjects';
import { StoryReader } from './components/StoryReader';

const queryClient = new QueryClient();

type View = 'landing' | 'auth' | 'dashboard' | 'story-input' | 'creation' | 'settings' | 'feedback' | 'community' | 'projects' | 'story-reader';

const AppContent = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentStory, setCurrentStory] = useState('');
  const [currentStoryId, setCurrentStoryId] = useState('');
  const { user, loading } = useAuth();

  // Handle authentication state changes
  useEffect(() => {
    console.log('Auth state effect - User:', user?.email, 'Loading:', loading, 'Current view:', currentView);
    
    if (!loading) {
      if (user && currentView === 'landing') {
        console.log('Authenticated user detected, redirecting to dashboard');
        setCurrentView('dashboard');
      } else if (!user && currentView !== 'landing' && currentView !== 'auth') {
        console.log('Unauthenticated user detected, redirecting to landing');
        setCurrentView('landing');
      }
    }
  }, [user, loading, currentView]);

  // Set up event listeners for navigation
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const destination = event.detail;
      console.log('Navigation event:', destination);
      
      switch (destination) {
        case 'dashboard':
          if (user) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('auth');
          }
          break;
        case 'projects':
          if (user) {
            setCurrentView('projects');
          } else {
            setCurrentView('auth');
          }
          break;
        case 'community':
          if (user) {
            setCurrentView('community');
          } else {
            setCurrentView('auth');
          }
          break;
        case 'settings':
          if (user) {
            setCurrentView('settings');
          } else {
            setCurrentView('auth');
          }
          break;
        case 'feedback':
          if (user) {
            setCurrentView('feedback');
          } else {
            setCurrentView('auth');
          }
          break;
        case 'logout':
          console.log('Logout navigation event received, redirecting to landing');
          setCurrentView('landing');
          break;
        default:
          console.log('Unknown navigation destination:', destination);
      }
    };

    window.addEventListener('navigate', handleNavigation as EventListener);
    
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, [user]);

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
    setCurrentView('projects');
  };

  const handleViewCommunity = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setCurrentView('community');
  };

  const handleViewStory = (storyId: string) => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setCurrentStoryId(storyId);
    setCurrentView('story-reader');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <Landing 
            onGetStarted={handleGetStarted}
            onLogin={handleLogin}
          />
        );
      
      case 'auth':
        return (
          <Auth 
            onSuccess={handleAuthSuccess}
            onBack={handleBackToLanding}
          />
        );
      
      case 'dashboard':
        return (
          <Dashboard 
            onCreateNew={handleCreateNew}
            onViewProjects={handleViewProjects}
            onViewCommunity={handleViewCommunity}
          />
        );
      
      case 'story-input':
        return (
          <StoryInput 
            onBack={handleBackToDashboard}
            onGenerateWidgets={handleGenerateWidgets}
          />
        );

      case 'settings':
        return (
          <Settings onBack={handleBackToDashboard} />
        );

      case 'feedback':
        return (
          <Feedback onBack={handleBackToDashboard} />
        );

      case 'community':
        return (
          <CommunityShowcase 
            onBack={handleBackToDashboard}
            onViewStory={handleViewStory}
          />
        );

      case 'projects':
        return (
          <MyProjects 
            onBack={handleBackToDashboard}
            onCreateNew={handleCreateNew}
            onViewStory={handleViewStory}
          />
        );

      case 'story-reader':
        return (
          <StoryReader 
            storyId={currentStoryId}
            onBack={handleBackToDashboard}
          />
        );
      
      case 'creation':
        return (
          <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Creation Interface</h1>
              <p className="text-xl text-gray-600">Coming Soon...</p>
              <button 
                onClick={handleBackToDashboard}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return renderCurrentView();
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen">
            <AppContent />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
