
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
  const { toggleLike, isLiked } = useLikedStories();

  console.log('Personal stories:', stories);

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

  if (isLoading) {
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
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Story
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          My Projects 📚
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage and view all your creative stories in one place.
        </p>
      </div>

      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div className="absolute top-4 right-4">
                    <Badge variant={story.is_public ? "default" : "secondary"} className={story.is_public ? "bg-accent" : "bg-gray-500"}>
                      {story.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
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
                        {story.view_count || 0}
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
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                      className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
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
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            You haven't created any stories yet. Start your creative journey by creating your first interactive story!
          </p>
          <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Story
          </Button>
        </div>
      )}
    </Layout>
  );
};
