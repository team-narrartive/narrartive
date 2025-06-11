import React, { useEffect } from 'react';
import { useStory, useLikeStory, useIncrementViews } from '@/hooks/useStories';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Eye, Share2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StoryReaderProps {
  storyId: string;
  onBack: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  storyId,
  onBack
}) => {
  const { data: story, isLoading } = useStory(storyId);
  const likeStoryMutation = useLikeStory();
  const incrementViewsMutation = useIncrementViews();
  const { toast } = useToast();

  // Increment view count when story loads
  useEffect(() => {
    if (story) {
      incrementViewsMutation.mutate(storyId);
    }
  }, [story, storyId, incrementViewsMutation]);

  const handleLike = async () => {
    try {
      await likeStoryMutation.mutateAsync(storyId);
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleShare = async () => {
    if (!story) return;
    
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Layout showSidebar={true} currentView="story-reader">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading story...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!story) {
    return (
      <Layout showSidebar={true} currentView="story-reader">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
            <p className="text-gray-600 mb-6">The story you're looking for doesn't exist or has been removed.</p>
            <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} currentView="story-reader">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <article className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          {/* Header Image */}
          {story.main_image && (
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
              <img 
                src={story.main_image} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}

          <div className="p-8">
            {/* Story Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {story.category || 'Story'}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(story.created_at)}
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {story.title}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {story.description}
              </p>

              {/* Story Stats and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {story.view_count || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {story.like_count || 0} likes
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    disabled={likeStoryMutation.isPending}
                    className="hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 mb-8" />

            {/* Story Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                {story.story_content}
              </div>
            </div>

            {/* Additional Images */}
            {story.additional_images && story.additional_images.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Story Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {story.additional_images.map((imageUrl, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Story image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Story Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Published on {formatDate(story.created_at)}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    disabled={likeStoryMutation.isPending}
                    className="hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {story.like_count || 0} Likes
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Story
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};
