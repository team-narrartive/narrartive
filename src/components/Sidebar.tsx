
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  Settings, 
  MessageSquare, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: string;
  onNavigate?: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, currentView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', onClick: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' })) },
    { id: 'projects', icon: BookOpen, label: 'My Projects', onClick: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'projects' })) },
    { id: 'community', icon: Sparkles, label: 'Community', onClick: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'community' })) },
    { id: 'settings', icon: Settings, label: 'Settings', onClick: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' })) },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback', onClick: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'feedback' })) },
  ];

  const handleLogout = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'logout' }));
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-xl border-r border-white/20 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center animate-glow">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                NarrArtive
              </h1>
              <p className="text-xs text-gray-500">Where stories come to life</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="absolute -right-3 top-8 z-10">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="w-6 h-6 p-0 bg-white shadow-md border-gray-200 hover:bg-gray-50"
        >
          {isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            onClick={item.onClick}
            variant={currentView === item.id ? "default" : "ghost"}
            className={`w-full justify-start space-x-3 ${!isOpen && 'px-3'} ${
              currentView === item.id 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'hover:bg-purple-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {isOpen && <span>{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full justify-start space-x-3 text-red-500 hover:bg-red-50 ${!isOpen && 'px-3'}`}
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span>Log Out</span>}
        </Button>
      </div>
    </div>
  );
};
