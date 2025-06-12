
import React from 'react';
import { Landing } from './Landing';
import { Auth } from './Auth';
import { Dashboard } from './Dashboard';
import { StoryInput } from './StoryInput';
import { Settings } from './Settings';
import { Feedback } from './Feedback';
import { CommunityShowcase } from './CommunityShowcase';
import { MyProjects } from './MyProjects';
import { StoryReader } from './StoryReader';
import { PasswordReset } from './PasswordReset';

type View = 'landing' | 'auth' | 'dashboard' | 'story-input' | 'creation' | 'settings' | 'feedback' | 'community' | 'projects' | 'story-reader' | 'password-reset';

interface ViewRendererProps {
  currentView: View;
  currentStory: string;
  currentStoryId: string;
  previousView: View;
  user: any;
  onGetStarted: () => void;
  onLogin: () => void;
  onAuthSuccess: () => void;
  onBackToLanding: () => void;
  onCreateNew: () => void;
  onBackToDashboard: () => void;
  onGenerateWidgets: (story: string) => void;
  onViewProjects: () => void;
  onViewCommunity: () => void;
  onViewStory: (storyId: string) => void;
  onBackFromStoryReader: () => void;
  onBackToAuth: () => void;
}

export const ViewRenderer: React.FC<ViewRendererProps> = ({
  currentView,
  currentStoryId,
  previousView,
  user,
  onGetStarted,
  onLogin,
  onAuthSuccess,
  onBackToLanding,
  onCreateNew,
  onBackToDashboard,
  onGenerateWidgets,
  onViewProjects,
  onViewCommunity,
  onViewStory,
  onBackFromStoryReader,
  onBackToAuth
}) => {
  switch (currentView) {
    case 'password-reset':
      return (
        <PasswordReset onBack={onBackToAuth} />
      );
    
    case 'landing':
      return (
        <Landing 
          onGetStarted={onGetStarted}
          onLogin={onLogin}
        />
      );
    
    case 'auth':
      return (
        <Auth 
          onSuccess={onAuthSuccess}
          onBack={onBackToLanding}
        />
      );
    
    case 'dashboard':
      return (
        <Dashboard 
          onCreateNew={onCreateNew}
          onViewProjects={onViewProjects}
          onViewCommunity={onViewCommunity}
        />
      );
    
    case 'story-input':
      return (
        <StoryInput 
          onBack={onBackToDashboard}
          onGenerateWidgets={onGenerateWidgets}
        />
      );

    case 'settings':
      return (
        <Settings onBack={onBackToDashboard} />
      );

    case 'feedback':
      return (
        <Feedback onBack={onBackToDashboard} />
      );

    case 'community':
      return (
        <CommunityShowcase 
          onBack={onBackToDashboard}
          onViewStory={onViewStory}
        />
      );

    case 'projects':
      return (
        <MyProjects 
          onBack={onBackToDashboard}
          onCreateNew={onCreateNew}
          onViewStory={onViewStory}
        />
      );

    case 'story-reader':
      return (
        <StoryReader 
          storyId={currentStoryId}
          onBack={onBackFromStoryReader}
        />
      );
    
    case 'creation':
      return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Creation Interface</h1>
            <p className="text-xl text-gray-600">Coming Soon...</p>
            <button 
              onClick={onBackToDashboard}
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
