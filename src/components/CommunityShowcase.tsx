
import React from 'react';
import { useStories, useLikeStory, useIncrementViews } from '@/hooks/useStories';
import { useLikedStories } from '@/hooks/useLikedStories';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Eye, Share2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommunityShowcaseProps {
  onBack: () => void;
  onViewStory: (storyId: string) => void;
}

export const CommunityShowcase: React.FC<CommunityShowcaseProps> = ({
  onBack,
  onViewStory
}) => {
  const { data: stories, isLoading } = useStories('community');
  const likeStoryMutation = useLikeStory();
  const incrementViewsMutation = useIncrementViews();
  const { toast } = useToast();
  const { toggleLike, isLiked, isLoading: likesLoading } = useLikedStories();

  console.log('Community stories:', stories);

  const handleLike = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    
    if (likesLoading || likeStoryMutation.isPending) return;
    
    const userCurrentlyLikes = isLiked(storyId);
    console.log('HandleLike called:', storyId, 'userCurrentlyLikes:', userCurrentlyLikes);
    
    // Toggle local like state for immediate UI feedback
    toggleLike(storyId);
    
    try {
      // Call the mutation - if user currently likes it, we want to unlike (shouldLike = false)
      // If user doesn't currently like it, we want to like (shouldLike = true)
      await likeStoryMutation.mutateAsync({ 
        storyId, 
        shouldLike: !userCurrentlyLikes
      });
      console.log('Like/Unlike successful for story:', storyId);
    } catch (error) {
      // Revert local state if database update fails
      toggleLike(storyId);
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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "1 day ago";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (isLoading || likesLoading) {
    return (
      <Layout showSidebar={true} currentView="community">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community stories...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Filter to only show public stories from the database
  const publicStories = stories?.filter(story => story.is_public) || [];

  return (
    <Layout showSidebar={true} currentView="community">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 text-sm md:text-base">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <div className="text-center mb-8 md:mb-12 px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
          Community Showcase ✨
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing stories created by our talented community of storytellers.
        </p>
      </div>

      {publicStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-0">
          {publicStories.map((story) => {
            const userLiked = isLiked(story.id);
            
            return (
              <Card key={story.id} className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="aspect-video gradient-primary relative overflow-hidden">
                  {story.main_image && (
                    <img 
                      src={story.main_image} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 md:top-4 right-3 md:right-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300 text-xs md:text-sm">
                      Public
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {story.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2 text-sm md:text-base">
                    {story.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="flex items-center justify-between mb-4 text-xs md:text-sm text-gray-500">
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        {formatCount(story.view_count || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 md:h-4 md:w-4" />
                        {story.like_count || 0}
                      </span>
                    </div>
                    <span className="hidden sm:inline">{formatTimeAgo(story.created_at)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleReadStory(story.id)}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base h-8 md:h-10"
                      disabled={incrementViewsMutation.isPending}
                    >
                      <BookOpen className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      {incrementViewsMutation.isPending ? 'Loading...' : 'Read'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleLike(e, story.id)}
                      disabled={likeStoryMutation.isPending || likesLoading}
                      className={`hover:bg-pink-50 hover:border-pink-200 transition-colors h-8 md:h-10 w-8 md:w-10 p-0 ${
                        userLiked 
                          ? 'bg-pink-50 text-pink-600 border-pink-200' 
                          : 'hover:text-pink-600'
                      }`}
                    >
                      <Heart className={`h-3 w-3 md:h-4 md:w-4 ${userLiked ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleShare(e, story)}
                      className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 h-8 md:h-10 w-8 md:w-10 p-0"
                    >
                      <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 md:w-24 md:h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-white" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Public Stories Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
            Be the first to share your story with the community! Create your first story and make it public to help build our creative community.
          </p>
        </div>
      )}
    </Layout>
  );
};
