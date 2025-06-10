
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User,
  Settings,
  LogOut,
  BookOpen,
  Heart,
  Trophy,
  X
} from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  isOpen, 
  onClose, 
  onSettings, 
  onLogout 
}) => {
  const [userData] = useState({
    name: 'Creative User',
    email: 'user@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    stats: {
      projects: 5,
      likes: 23,
      rank: 'Storyteller'
    }
  });

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-72 z-50">
      <Card className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Profile</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src={userData.avatar} 
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{userData.name}</h4>
              <p className="text-sm text-gray-600">{userData.email}</p>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{userData.stats.projects}</p>
              <p className="text-xs text-gray-600">Projects</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <Heart className="w-4 h-4 text-pink-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{userData.stats.likes}</p>
              <p className="text-xs text-gray-600">Likes</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{userData.stats.rank}</p>
              <p className="text-xs text-gray-600">Rank</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Menu Items */}
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={onSettings}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Log Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
