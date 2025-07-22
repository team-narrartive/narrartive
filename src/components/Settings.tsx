import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from './Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Save, ArrowLeft } from 'lucide-react';
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
        <div className="flex items-center justify-start gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences</p>
          </div>
        </div>

        {/* Authentication Status - removed invalid user object rendering */}

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card className="p-8 bg-card/90 backdrop-blur-sm border border-primary/10 rounded-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <Input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Enter your full name" className="rounded-xl border-border focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <Input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Enter your email" disabled className="rounded-xl border-border bg-muted/50" />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Layout>;
};