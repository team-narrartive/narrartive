
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Users, Heart, Clock } from 'lucide-react';

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
  const { data: userStories } = useStories('personal');
  const { data: communityStories } = useStories('community');

  // Calculate real metrics from database
  const totalStories = userStories?.length || 0;
  const totalLikes = userStories?.reduce((sum, story) => sum + (story.like_count || 0), 0) || 0;
  const totalViews = userStories?.reduce((sum, story) => sum + (story.view_count || 0), 0) || 0;
  // Estimate minutes spent based on stories created (rough calculation)
  const minutesSpent = totalStories * 45; // Assume 45 minutes per story

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Creator';

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Minutes Spent</CardTitle>
            <Clock className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{minutesSpent}</div>
            <p className="text-xs text-gray-500">Creating amazing content</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-sky-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Stories Generated</CardTitle>
            <BookOpen className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-500">{totalStories}</div>
            <p className="text-xs text-gray-500">Your creative works</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Likes Received</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-500">{totalLikes}</div>
            <p className="text-xs text-gray-500">Community appreciation</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{totalViews}</div>
            <p className="text-xs text-gray-500">Story engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with improved layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-br from-slate-400 to-slate-500 text-white border-0 hover:from-slate-500 hover:to-slate-600 transition-all duration-300 cursor-pointer group flex flex-col" onClick={onCreateNew}>
          <CardHeader className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <PlusCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
              Create New Story
            </CardTitle>
            <CardDescription className="text-slate-100 flex-1 py-[10px]">Start crafting your next amazing interactive story</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
              Get Started →
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-400 to-sky-500 text-white border-0 hover:from-sky-500 hover:to-sky-600 transition-all duration-300 cursor-pointer group flex flex-col" onClick={onViewProjects}>
          <CardHeader className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 group-hover:scale-110 transition-transform" />
              My Projects
            </CardTitle>
            <CardDescription className="text-sky-100 flex-1 py-[10px]">
              View and manage your created stories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
              View All ({totalStories}) →
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white border-0 hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 cursor-pointer group flex flex-col" onClick={onViewCommunity}>
          <CardHeader className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
              Community Hub
            </CardTitle>
            <CardDescription className="text-emerald-100 flex-1 py-[10px]">
              Explore stories from other creators
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
              Explore ({communityStories?.length || 0}) →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {userStories && userStories.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Recent Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userStories.slice(0, 3).map((story) => (
              <Card key={story.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-sky-100 to-emerald-100 relative overflow-hidden">
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
    </Layout>
  );
};
