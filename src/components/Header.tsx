
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Search, User } from 'lucide-react';
import { Notifications } from './Notifications';
import { UserProfile } from './UserProfile';

interface HeaderProps {
  showSidebar?: boolean;
  onSettings?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showSidebar, onSettings, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false); // Close profile if open
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false); // Close notifications if open
  };

  const handleSettingsClick = () => {
    setShowProfile(false);
    onSettings?.();
  };

  const handleLogoutClick = () => {
    setShowProfile(false);
    onLogout?.();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!showSidebar && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                NarrArtive
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 bg-white/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            <Notifications 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          </div>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleProfileClick}
            >
              <User className="w-5 h-5" />
            </Button>
            <UserProfile 
              isOpen={showProfile} 
              onClose={() => setShowProfile(false)}
              onSettings={handleSettingsClick}
              onLogout={handleLogoutClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
