
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface NavigationManagerProps {
  user: any;
  currentView: string;
  setCurrentView: (view: string) => void;
  setCurrentStory: (story: string) => void;
  setCurrentStoryId: (id: string) => void;
}

export const NavigationManager: React.FC<NavigationManagerProps> = ({
  user,
  currentView,
  setCurrentView,
  setCurrentStory,
  setCurrentStoryId
}) => {
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
          // Clear any local state
          setCurrentStory('');
          setCurrentStoryId('');
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
  }, [user, setCurrentView, setCurrentStory, setCurrentStoryId]);

  return null; // This component only handles side effects
};
