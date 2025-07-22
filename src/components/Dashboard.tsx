import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
import { useUserStats } from '@/hooks/useUserStats';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Users, Heart, Clock, AlertCircle, Eye, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { runImageMigration } from '@/utils/runMigrationScript';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  onCreateNew: () => void;
  onViewProjects: () => void;
  onViewCommunity: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onCreateNew,
  onViewProjects,
  onViewCommunity
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userStories, isLoading: userStoriesLoading, error: userStoriesError } = useStories('personal');
  const { data: communityStories, isLoading: communityLoading } = useStories('community');
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();

  // Use user stats from profiles table for instant loading
  const totalStories = userStats?.stories_generated || 0;
  const totalLikes = userStats?.likes_received || 0;
  const totalViews = userStats?.total_views || 0;
  const minutesSpent = userStats?.minutes_spent || 0;

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Creator';

  // Show error message if there's an issue loading stories
  const showError = userStoriesError && !userStoriesLoading;

  const handleMigration = async () => {
    setIsMigrating(true);
    
    try {
      const result = await runImageMigration();
      toast({
        title: "Migration completed",
        description: `Successfully migrated ${result.migratedCount} stories. All Base64 images have been converted to storage URLs.`
      });
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration failed",
        description: "There was an error migrating the images. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Layout showSidebar={true} currentView="dashboard">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-display text-brand mb-6">
          Welcome back, {firstName}!
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
          Ready to create your next masterpiece? Your creative journey continues here.
        </p>
      </div>

      {showError && (
        <Alert className="mb-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Having trouble loading your data. This might be due to a slow connection or server issue. 
            Your stories are safe - try refreshing the page or check back in a moment.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <Card className="card-premium group hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Minutes Spent</CardTitle>
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Clock className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-foreground mb-1">
              {userStatsLoading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                minutesSpent
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Creating amazing content</p>
          </CardContent>
        </Card>

        <Card className="card-premium group hover:scale-105 transition-transform duration-300 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stories Generated</CardTitle>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-primary mb-1">
              {userStatsLoading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalStories
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Your creative works</p>
          </CardContent>
        </Card>

        <Card className="card-premium group hover:scale-105 transition-transform duration-300 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Likes Received</CardTitle>
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <Heart className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-success mb-1">
              {userStatsLoading ? (
                <div className="w-6 h-6 border-2 border-success border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalLikes
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Community appreciation</p>
          </CardContent>
        </Card>

        <Card className="card-premium group hover:scale-105 transition-transform duration-300 border-brand/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Views</CardTitle>
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center group-hover:bg-brand/20 transition-colors">
              <Users className="h-5 w-5 text-brand" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display text-brand mb-1">
              {userStatsLoading ? (
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalViews
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Story engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <Card className="gradient-primary text-white border-0 shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col transform hover:scale-105 rounded-3xl overflow-hidden" onClick={onCreateNew}>
          <CardHeader className="flex-1 p-8">
            <CardTitle className="flex items-center gap-4 text-2xl font-display">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <PlusCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
              </div>
              Create New Story
            </CardTitle>
            <CardDescription className="text-white/90 flex-1 py-4 text-lg font-medium leading-relaxed">Start crafting your next amazing interactive story</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 p-8">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 py-3 text-lg font-semibold rounded-2xl">
              Get Started →
            </Button>
          </CardContent>
        </Card>

        <Card className="gradient-brand text-white border-0 shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col transform hover:scale-105 rounded-3xl overflow-hidden" onClick={onViewProjects}>
          <CardHeader className="flex-1 p-8">
            <CardTitle className="flex items-center gap-4 text-2xl font-display">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <BookOpen className="h-7 w-7 group-hover:scale-110 transition-transform" />
              </div>
              My Projects
            </CardTitle>
            <CardDescription className="text-white/90 flex-1 py-4 text-lg font-medium leading-relaxed">
              View and manage your created stories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 p-8">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 py-3 text-lg font-semibold rounded-2xl">
              {userStoriesLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                `View All (${totalStories}) →`
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="gradient-success text-white border-0 shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col transform hover:scale-105 rounded-3xl overflow-hidden" onClick={onViewCommunity}>
          <CardHeader className="flex-1 p-8">
            <CardTitle className="flex items-center gap-4 text-2xl font-display">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Users className="h-7 w-7 group-hover:scale-110 transition-transform" />
              </div>
              Community Hub
            </CardTitle>
            <CardDescription className="text-white/90 flex-1 py-4 text-lg font-medium leading-relaxed">
              Explore stories from other creators
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 p-8">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 py-3 text-lg font-semibold rounded-2xl">
              {communityLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                `Explore (${communityStories?.length || 0}) →`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - only show if we have stories and they're loaded */}
      {userStories && userStories.length > 0 && !userStoriesLoading && (
        <div className="mt-16">
          <h2 className="text-3xl lg:text-4xl font-display text-foreground mb-10">Your Recent Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userStories.slice(0, 3).map((story) => (
              <Card key={story.id} className="card-premium group cursor-pointer transform hover:scale-105">
                <div className="aspect-video gradient-primary relative overflow-hidden rounded-t-2xl">
                  {story.main_image && (
                    <img 
                      src={story.main_image} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-display text-foreground">{story.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground font-medium">
                    {story.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex justify-between items-center text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {story.view_count || 0} views
                    </span>
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      {story.like_count || 0} likes
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Migration Section */}
      <div className="mt-16">
        <Card className="border-orange-200 bg-orange-50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Upload className="h-5 w-5" />
              Image Migration
            </CardTitle>
            <CardDescription className="text-orange-600">
              Convert existing Base64 images to Supabase Storage for better performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleMigration} 
              disabled={isMigrating}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {isMigrating ? 'Migrating Images...' : 'Run Image Migration'}
            </Button>
            <p className="text-sm text-orange-600 mt-2">
              This will upload all Base64 images to storage and update database records with URLs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Show loading state for recent activity */}
      {userStoriesLoading && (
        <div className="mt-16 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading your stories...</p>
        </div>
      )}
    </Layout>
  );
};