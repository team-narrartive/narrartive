
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Landing } from './components/Landing';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { StoryInput } from './components/StoryInput';

const queryClient = new QueryClient();

type View = 'landing' | 'auth' | 'dashboard' | 'story-input' | 'creation';

const App = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentStory, setCurrentStory] = useState('');

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
    // Will implement later
    console.log('View projects');
  };

  const handleViewCommunity = () => {
    // Will implement later
    console.log('View community');
  };

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {renderCurrentView()}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
