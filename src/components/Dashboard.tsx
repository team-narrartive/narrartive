import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
import { useUserStats } from '@/hooks/useUserStats';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Users, Heart, Clock, AlertCircle, Eye, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    data: userStories,
    isLoading: userStoriesLoading,
    error: userStoriesError
  } = useStories('personal');
  const {
    data: communityStories,
    isLoading: communityLoading
  } = useStories('community');
  const {
    data: userStats,
    isLoading: userStatsLoading
  } = useUserStats();

  // Use user stats from profiles table for instant loading
  const totalStories = userStats?.stories_generated || 0;
  const totalLikes = userStats?.likes_received || 0;
  const totalViews = userStats?.total_views || 0;
  const minutesSpent = userStats?.minutes_spent || 0;
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Creator';

  // Show error message if there's an issue loading stories
  const showError = userStoriesError && !userStoriesLoading;
  return <Layout showSidebar={true} currentView="dashboard">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-display text-foreground mb-6">
          Welcome back, {firstName}!
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">Ready to create your next <span className="text-primary font-semibold">masterpiece</span>?</p>
      </div>

      {showError && <Alert className="mb-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Having trouble loading your data. This might be due to a slow connection or server issue. 
            Your stories are safe - try refreshing the page or check back in a moment.
          </AlertDescription>
        </Alert>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="card-premium group hover:scale-105 transition-transform duration-300" style={{ backgroundColor: 'hsl(30, 80%, 95%)', borderColor: 'hsl(30, 70%, 85%)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minutes Spent</CardTitle>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(30, 70%, 55%)' }}>
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-display text-foreground mb-1">
              {userStatsLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : minutesSpent}
            </div>
            <p className="text-xs text-muted-foreground font-medium">Creating amazing content</p>
          </CardContent>
        </Card>

        <Card className="card-premium group hover:scale-105 transition-transform duration-300" style={{ backgroundColor: 'hsl(200, 80%, 95%)', borderColor: 'hsl(200, 70%, 85%)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stories Generated</CardTitle>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(200, 70%, 55%)' }}>
              <BookOpen className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-display mb-1" style={{ color: 'hsl(200, 70%, 55%)' }}>
              {userStatsLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : totalStories}
            </div>
            <p className="text-xs text-muted-foreground font-medium">Your creative works</p>
          </CardContent>
        </Card>

        <Card className="card-premium group hover:scale-105 transition-transform duration-300" style={{ backgroundColor: 'hsl(270, 60%, 95%)', borderColor: 'hsl(270, 50%, 85%)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Likes Received</CardTitle>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(270, 50%, 55%)' }}>
              <Heart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-display mb-1" style={{ color: 'hsl(270, 50%, 55%)' }}>
              {userStatsLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : totalLikes}
            </div>
            <p className="text-xs text-muted-foreground font-medium">Community appreciation</p>
          </CardContent>
        </Card>

        <Card className="card-premium group hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Views</CardTitle>
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-display text-foreground mb-1">
              {userStatsLoading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : totalViews}
            </div>
            <p className="text-xs text-muted-foreground font-medium">Story engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        <Card className="text-foreground border-0 shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col transform hover:scale-105 rounded-3xl overflow-hidden" style={{ backgroundColor: 'hsl(30, 80%, 95%)' }} onClick={onViewProjects}>
          <CardHeader className="flex-1 p-8">
            <CardTitle className="flex items-center gap-4 text-2xl font-display">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-colors" style={{ backgroundColor: 'hsl(30, 70%, 55%)' }}>
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              My Projects
            </CardTitle>
            <CardDescription className="text-muted-foreground flex-1 py-4 text-lg font-medium leading-relaxed">
              View and manage your created stories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 p-8">
            <Button variant="outline" className="w-full border-2 py-3 text-lg font-semibold rounded-2xl" style={{ borderColor: 'hsl(30, 70%, 55%)', color: 'hsl(30, 70%, 55%)' }}>
              {userStoriesLoading ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div> : `View All (${totalStories}) →`}
            </Button>
          </CardContent>
        </Card>

        <Card className="text-foreground border-0 shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group flex flex-col transform hover:scale-105 rounded-3xl overflow-hidden" style={{ backgroundColor: 'hsl(200, 80%, 95%)' }} onClick={onViewCommunity}>
          <CardHeader className="flex-1 p-8">
            <CardTitle className="flex items-center gap-4 text-2xl font-display">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-colors" style={{ backgroundColor: 'hsl(200, 70%, 55%)' }}>
                <Users className="h-7 w-7 text-white" />
              </div>
              Community Hub
            </CardTitle>
            <CardDescription className="text-muted-foreground flex-1 py-4 text-lg font-medium leading-relaxed">
              Explore stories from other creators
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 p-8">
            <Button variant="outline" className="w-full border-2 py-3 text-lg font-semibold rounded-2xl" style={{ borderColor: 'hsl(200, 70%, 55%)', color: 'hsl(200, 70%, 55%)' }}>
              {communityLoading ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div> : `Explore (${communityStories?.length || 0}) →`}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - only show if we have stories and they're loaded */}
      {userStories && userStories.length > 0 && !userStoriesLoading && <div className="mt-16">
          <h2 className="text-3xl lg:text-4xl font-display text-foreground mb-10">Your Recent Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userStories.slice(0, 3).map(story => <Card key={story.id} className="card-premium group cursor-pointer transform hover:scale-105">
                <div className="aspect-video gradient-primary relative overflow-hidden rounded-t-2xl">
                  {story.main_image && <img src={story.main_image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
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
              </Card>)}
          </div>
        </div>}


      {/* Show loading state for recent activity */}
      {userStoriesLoading && <div className="mt-16 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading your stories...</p>
        </div>}
    </Layout>;
};