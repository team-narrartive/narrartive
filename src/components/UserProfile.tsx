
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
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
  const { user, signOut } = useAuth();
  const { data: userStories } = useStories('personal');

  // Calculate real user stats
  const totalProjects = userStories?.length || 0;
  const totalLikes = userStories?.reduce((sum, story) => sum + (story.like_count || 0), 0) || 0;
  const totalViews = userStories?.reduce((sum, story) => sum + (story.view_count || 0), 0) || 0;

  // Get user info from auth
  const firstName = user?.user_metadata?.first_name || 'User';
  const lastName = user?.user_metadata?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'No email';

  // Generate avatar from initials or use default
  const avatarInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  
  const handleLogout = async () => {
    console.log('UserProfile: Starting logout process');
    try {
      await signOut();
      console.log('UserProfile: signOut completed, triggering navigation');
      // Close the profile dropdown first
      onClose();
      // Dispatch logout navigation event to ensure app state is updated
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'logout' }));
    } catch (error) {
      console.error('UserProfile: Logout error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-72 z-[100]">
      <Card className="bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
              {avatarInitials}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{fullName}</h4>
              <p className="text-sm text-gray-600">{email}</p>
              {user && (
                <p className="text-xs text-green-600">✓ Authenticated</p>
              )}
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{totalProjects}</p>
              <p className="text-xs text-gray-600">Projects</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <Heart className="w-4 h-4 text-pink-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{totalLikes}</p>
              <p className="text-xs text-gray-600">Likes</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{totalViews}</p>
              <p className="text-xs text-gray-600">Views</p>
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
              onClick={handleLogout}
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
