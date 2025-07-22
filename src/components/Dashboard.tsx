import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Users, Heart, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { user } = useAuth();
  const { data: userStories, isLoading: userStoriesLoading, error: userStoriesError } = useStories('personal');
  const { data: communityStories, isLoading: communityLoading } = useStories('community');

  // Calculate statistics based on actual data
  const totalStories = userStories?.length || 0;
  const totalLikes = user?.user_metadata?.likes_received ?? 0;
  const totalViews = userStories?.reduce((sum, story) => sum + (story.view_count || 0), 0) || 0;
  
  // For now, show minutes as stories * 45 (estimated time per story)
  const minutesSpent = totalStories * 45;

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Creator';

  // Show error message if there's an issue loading stories
  const showError = userStoriesError && !userStoriesLoading;

  return (
    <Layout showSidebar={true} currentView="dashboard">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome back, {firstName}!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white/90 backdrop-blur-sm border-border shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Minutes Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userStoriesLoading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                minutesSpent
              )}
            </div>
            <p className="text-xs text-muted-foreground">Creating amazing content</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-primary/30 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stories Generated</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {userStoriesLoading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalStories
              )}
            </div>
            <p className="text-xs text-muted-foreground">Your creative works</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-accent/30 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Likes Received</CardTitle>
            <Heart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {userStoriesLoading ? (
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalLikes
              )}
            </div>
            <p className="text-xs text-muted-foreground">Community appreciation</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-primary-glow/30 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <Users className="h-4 w-4 text-primary-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-glow">
              {userStoriesLoading ? (
                <div className="w-6 h-6 border-2 border-primary-glow border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalViews
              )}
            </div>
            <p className="text-xs text-muted-foreground">Story engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="gradient-primary text-white border-0 hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col" onClick={onCreateNew}>
          <CardHeader className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <PlusCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
              Create New Story
            </CardTitle>
            <CardDescription className="text-white/90 flex-1 py-[10px]">Start crafting your next amazing interactive story</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
              Get Started →
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-primary text-white border-0 hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col" onClick={onViewProjects}>
          <CardHeader className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 group-hover:scale-110 transition-transform" />
              My Projects
            </CardTitle>
            <CardDescription className="text-white/90 flex-1 py-[10px]">
              View and manage your created stories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
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

        <Card className="bg-accent text-white border-0 hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col" onClick={onViewCommunity}>
          <CardHeader className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
              Community Hub
            </CardTitle>
            <CardDescription className="text-white/90 flex-1 py-[10px]">
              Explore stories from other creators
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
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
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Recent Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userStories.slice(0, 3).map((story) => (
              <Card key={story.id} className="bg-white/90 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 border border-white/30 group">
                <div className="aspect-video gradient-primary relative overflow-hidden">
                  {story.main_image && (
                    <img 
                      src={story.main_image} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{story.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {story.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{story.view_count || 0} views</span>
                    <span>{story.like_count || 0} likes</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Show loading state for recent activity */}
      {userStoriesLoading && (
        <div className="mt-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your stories...</p>
        </div>
      )}
    </Layout>
  );
};