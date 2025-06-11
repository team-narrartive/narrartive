
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

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user && currentView === 'landing') {
      setCurrentView('dashboard');
    }
    if (!loading && !user && currentView !== 'landing' && currentView !== 'auth') {
      setCurrentView('landing');
    }
  }, [user, loading, currentView]);

  // Set up event listeners for navigation
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const destination = event.detail;
      console.log('Navigation event:', destination);
      
      switch (destination) {
        case 'dashboard':
          setCurrentView('dashboard');
          break;
        case 'projects':
          setCurrentView('projects');
          break;
        case 'community':
          setCurrentView('community');
          break;
        case 'settings':
          setCurrentView('settings');
          break;
        case 'feedback':
          setCurrentView('feedback');
          break;
        case 'logout':
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
  }, []);

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleLogin = () => {
    setCurrentView('auth');
  };

  const handleAuthSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleCreateNew = () => {
    setCurrentView('story-input');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleGenerateWidgets = (story: string) => {
    setCurrentStory(story);
    setCurrentView('creation');
  };

  const handleViewProjects = () => {
    setCurrentView('projects');
  };

  const handleViewCommunity = () => {
    setCurrentView('community');
  };

  const handleViewStory = (storyId: string) => {
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
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Creation Interface</h1>
              <p className="text-xl text-gray-600">Coming Soon...</p>
              <button 
                onClick={handleBackToDashboard}
                className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
