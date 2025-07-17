
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, ArrowLeft } from 'lucide-react';
import { UserProfile } from './UserProfile';

interface HeaderProps {
  showSidebar?: boolean;
  onSettings?: () => void;
  onLogout?: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ showSidebar, onSettings, onLogout, onBack }) => {
  const [showProfile, setShowProfile] = useState(false);

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
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
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 relative z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-sky-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          
          {!showSidebar && !onBack && (
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                alt="NarrArtive Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-primary">
                NarrArtive
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative z-50">
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
