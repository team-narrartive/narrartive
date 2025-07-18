
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

  // Use profile statistics and fallback to calculated values
  const minutesSpent = user?.user_metadata?.minutes_spent ?? 0;
  const totalStories = user?.user_metadata?.stories_generated ?? (userStories?.length || 0);
  const totalLikes = user?.user_metadata?.likes_received ?? 0;
  const totalViews = userStories?.reduce((sum, story) => sum + (story.view_count || 0), 0) || 0;

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Creator';

  // Show error message if there's an issue loading stories
  const showError = userStoriesError && !userStoriesLoading;

  return (
    <Layout showSidebar={true} currentView="dashboard">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
        <Card className="bg-white/80 backdrop-blur-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Minutes Spent</CardTitle>
            <Clock className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              {userStoriesLoading ? (
                <div className="w-6 h-6 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                minutesSpent
              )}
            </div>
            <p className="text-xs text-gray-500">Creating amazing content</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stories Generated</CardTitle>
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
            <p className="text-xs text-gray-500">Your creative works</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Likes Received</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-500">
              {userStoriesLoading ? (
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalLikes
              )}
            </div>
            <p className="text-xs text-gray-500">Community appreciation</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-accent/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {userStoriesLoading ? (
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              ) : (
                totalViews
              )}
            </div>
            <p className="text-xs text-gray-500">Story engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with improved darker colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-br from-emerald-600 to-green-600 text-white border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col" onClick={onCreateNew}>
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

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col" onClick={onViewProjects}>
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

        <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col" onClick={onViewCommunity}>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Recent Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userStories.slice(0, 3).map((story) => (
              <Card key={story.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="aspect-video gradient-primary relative overflow-hidden">
                  {story.main_image && (
                    <img 
                      src={story.main_image} 
                      alt={story.title} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{story.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {story.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-500">
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
          <p className="text-gray-600">Loading your stories...</p>
        </div>
      )}
    </Layout>
  );
};
