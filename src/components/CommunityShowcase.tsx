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
  const { toggleLike, isLiked } = useLikedStories();

  console.log('Community stories:', stories);

  const handleLike = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    
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

  if (isLoading) {
    return (
      <Layout showSidebar={true} currentView="community">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community stories...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} currentView="community">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Community Showcase ✨
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing stories created by our talented community of storytellers.
        </p>
      </div>

      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => {
            const userLiked = isLiked(story.id);
            
            return (
              <Card key={story.id} className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                  {story.main_image && (
                    <img 
                      src={story.main_image} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-purple-700">
                      {story.category || 'Story'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                    {story.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">
                    {story.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatCount(story.view_count || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {story.like_count || 0}
                      </span>
                    </div>
                    <span>{formatTimeAgo(story.created_at)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleReadStory(story.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={incrementViewsMutation.isPending}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {incrementViewsMutation.isPending ? 'Loading...' : 'Read'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleLike(e, story.id)}
                      disabled={likeStoryMutation.isPending}
                      className={`hover:bg-pink-50 hover:border-pink-200 transition-colors ${
                        userLiked 
                          ? 'bg-pink-50 text-pink-600 border-pink-200' 
                          : 'hover:text-pink-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${userLiked ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleShare(e, story)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Be the first to share your story with the community! Create your first story and help build our creative community.
          </p>
        </div>
      )}
    </Layout>
  );
};
