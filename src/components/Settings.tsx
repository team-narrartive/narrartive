import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from './Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';
interface SettingsProps {
  onBack: () => void;
}
export const Settings: React.FC<SettingsProps> = ({
  onBack
}) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();

  // Get real user data from auth
  const firstName = user?.user_metadata?.first_name || '';
  const lastName = user?.user_metadata?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const [userName, setUserName] = useState(fullName);
  const [userEmail, setUserEmail] = useState(email);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'User';
      setUserName(fullName);
      setUserEmail(user.email || '');
    }
  }, [user]);
  const handleSaveSettings = () => {
    console.log('Settings saved:', {
      userName,
      userEmail
    });
    toast({
      title: "Settings saved!",
      description: "Your preferences have been updated."
    });
  };
  return <Layout showSidebar={true} currentView="settings">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences</p>
          </div>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {/* Authentication Status - removed invalid user object rendering */}

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-600">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <Input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Enter your full name" />
                
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <Input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Enter your email" disabled />
                
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Layout>;
};