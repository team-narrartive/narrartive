import React, { useEffect } from 'react';
import { useStories, useIncrementViews } from '@/hooks/useStories';
import { useUserLikes } from '@/hooks/useUserLikes';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Eye, Share2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
export interface CommunityShowcaseProps {
  onBack: () => void;
  onViewStory: (storyId: string) => void;
}
export const CommunityShowcase: React.FC<CommunityShowcaseProps> = ({
  onBack,
  onViewStory
}) => {
  const queryClient = useQueryClient();
  const {
    data: stories,
    isLoading
  } = useStories('community');
  const incrementViewsMutation = useIncrementViews();
  const {
    toast
  } = useToast();
  const {
    isLiked,
    likeStory,
    isLoading: likesLoading,
    isLiking
  } = useUserLikes();

  // Set up real-time updates for story likes and views
  useEffect(() => {
    const channel = supabase.channel('community-stories-changes').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'stories',
      filter: 'is_public=eq.true'
    }, payload => {
      console.log('Real-time story update:', payload);

      // Update the specific story in cache
      if (payload.new) {
        queryClient.setQueryData(['story', payload.new.id], payload.new);

        // Update stories list
        queryClient.setQueriesData({
          queryKey: ['stories', 'community']
        }, (oldData: any[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(story => story.id === payload.new.id ? payload.new : story);
        });
      }
    }).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_story_likes'
    }, payload => {
      console.log('Real-time likes update:', payload);

      // Refresh user likes cache when likes change
      queryClient.invalidateQueries({
        queryKey: ['user-likes']
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  console.log('Community stories:', stories);
  const handleLike = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (likesLoading || isLiking) return;
    const userCurrentlyLikes = isLiked(storyId);
    console.log('HandleLike called:', storyId, 'userCurrentlyLikes:', userCurrentlyLikes);
    try {
      await likeStory({
        storyId,
        shouldLike: !userCurrentlyLikes
      });
      console.log('Like/Unlike successful for story:', storyId);
    } catch (error) {
      console.error('Error with like/unlike:', error);
    }
  };
  const handleShare = async (e: React.MouseEvent, story: any) => {
    e.stopPropagation();
    const shareData = {
      title: story.title,
      text: story.description,
      url: `${window.location.origin}/?story=${story.id}`
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Story shared! 📤",
          description: "Thanks for spreading the word!"
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.log('Error sharing:', error);
          fallbackShare(story);
        }
      }
    } else {
      fallbackShare(story);
    }
  };
  const fallbackShare = async (story: any) => {
    try {
      const shareText = `Check out "${story.title}" - ${story.description}\n\n${window.location.origin}/?story=${story.id}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Link copied! 📋",
        description: "Story link copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share or copy link.",
        variant: "destructive"
      });
    }
  };
  const handleReadStory = async (storyId: string) => {
    console.log('Reading story:', storyId);

    // Increment view count when user clicks read
    try {
      await incrementViewsMutation.mutateAsync(storyId);
      console.log('View count incremented successfully for story:', storyId);
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Continue to story view even if view increment fails
    }

    // Navigate to story view
    onViewStory(storyId);
  };
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) {
      return "a few seconds ago";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else {
        return new Date(dateString).toLocaleDateString();
      }
    }
  };
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };
  if (isLoading || likesLoading) {
    return <Layout showSidebar={true} currentView="community">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community stories...</p>
          </div>
        </div>
      </Layout>;
  }

  // Filter to only show public stories from the database
  const publicStories = stories?.filter(story => story.is_public) || [];
  return <Layout showSidebar={true} currentView="community">
      <div className="space-y-6">
        <div className="flex items-center justify-start gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Showcase</h1>
            <p className="text-muted-foreground mt-2">Discover amazing stories created by our talented community of storytellers</p>
          </div>
        </div>

        {publicStories.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicStories.map(story => {
          const userLiked = isLiked(story.id);
          return <Card key={story.id} className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="aspect-video gradient-primary relative overflow-hidden">
                  {story.main_image && <img 
                    src={story.main_image} 
                    alt={story.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">
                    {story.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {story.description}
                  </CardDescription>
                  <div className="text-xs text-muted-foreground mt-1">
                    by {(story as any).profiles ? 
                      `${((story as any).profiles.first_name || '').trim()} ${((story as any).profiles.last_name || '').trim()}`.trim() + 
                      ` (${(story as any).profiles.email?.split('@')[0] || (story as any).profiles.display_name || 'user'})` 
                      : 'Anonymous'}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatCount(story.view_count || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {story.like_count || 0}
                      </span>
                    </div>
                    <span>{formatTimeAgo(story.created_at)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleReadStory(story.id)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={incrementViewsMutation.isPending}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      {incrementViewsMutation.isPending ? 'Loading...' : 'Read'}
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={e => handleLike(e, story.id)} disabled={isLiking || likesLoading} className={`hover:bg-pink-50 hover:border-pink-200 transition-colors ${userLiked ? 'bg-pink-50 text-pink-600 border-pink-200' : 'hover:text-pink-600'}`}>
                      <Heart className={`w-4 h-4 ${userLiked ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={e => handleShare(e, story)} className="hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>;
        })}
          </div> : <div className="text-center py-12 px-4">
          <div className="w-16 h-16 md:w-24 md:h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Public Stories Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
            Be the first to share your story with the community! Create your first story and make it public to help build our creative community.
            </p>
          </div>}
      </div>
    </Layout>;
};