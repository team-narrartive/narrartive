
import React from 'react';
import { useStories, useLikeStory, useIncrementViews } from '@/hooks/useStories';
import { useLikedStories } from '@/hooks/useLikedStories';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Eye, Share2, BookOpen, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MyProjectsProps {
  onBack: () => void;
  onCreateNew: () => void;
  onViewStory: (storyId: string) => void;
}

export const MyProjects: React.FC<MyProjectsProps> = ({
  onBack,
  onCreateNew,
  onViewStory
}) => {
  const { data: stories, isLoading } = useStories('personal');
  const likeStoryMutation = useLikeStory();
  const incrementViewsMutation = useIncrementViews();
  const { toast } = useToast();
  const { toggleLike, isLiked, isLoading: likesLoading } = useLikedStories();

  console.log('Personal stories:', stories);

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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Check out "${story.title}" - ${story.description}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Link copied!",
        description: "Story details copied to clipboard."
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
      return `${diffInDays}d ago`;
    }
  };

  if (isLoading || likesLoading) {
    return (
      <Layout showSidebar={true} currentView="projects">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} currentView="projects">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 px-4 md:px-0">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 text-sm md:text-base">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
        
        <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 text-sm md:text-base w-full sm:w-auto">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Create New Story</span>
          <span className="sm:hidden">Create Story</span>
        </Button>
      </div>

      <div className="text-center mb-8 md:mb-12 px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
          My Projects 📚
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Manage and view all your creative stories in one place.
        </p>
      </div>

      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-0">
          {stories.map((story) => {
            const userLiked = isLiked(story.id);
            
            return (
              <Card key={story.id} className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
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
                    <Badge variant={story.is_public ? "default" : "secondary"} className={`${story.is_public ? "bg-accent" : "bg-gray-500"} text-xs md:text-sm`}>
                      {story.is_public ? 'Public' : 'Private'}
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
                        {story.view_count || 0}
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
          <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm md:text-base">
            You haven't created any stories yet. Start your creative journey by creating your first interactive story!
          </p>
          <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Story
          </Button>
        </div>
      )}
    </Layout>
  );
};
