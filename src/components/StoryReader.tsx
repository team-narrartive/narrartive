
import React, { useEffect } from 'react';
import { useStory, useLikeStory } from '@/hooks/useStories';
import { useLikedStories } from '@/hooks/useLikedStories';
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
  const { toast } = useToast();
  const { toggleLike, isLiked } = useLikedStories();

  const userLiked = story ? isLiked(story.id) : false;

  const handleLike = async () => {
    if (!story) return;
    
    const userCurrentlyLikes = userLiked;
    console.log('StoryReader HandleLike called:', story.id, 'userCurrentlyLikes:', userCurrentlyLikes);
    
    // Toggle local like state for immediate UI feedback
    toggleLike(story.id);
    
    try {
      // Call the mutation - if user currently likes it, we want to unlike (shouldLike = false)
      // If user doesn't currently like it, we want to like (shouldLike = true)
      await likeStoryMutation.mutateAsync({ 
        storyId: story.id, 
        shouldLike: !userCurrentlyLikes
      });
    } catch (error) {
      // Revert local state if database update fails
      toggleLike(story.id);
      console.error('Error with like/unlike:', error);
    }
  };

  const handleShare = async () => {
    if (!story) return;
    
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
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = async () => {
    if (!story) return;
    
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Function to split story content into paragraphs and interleave with images
  const createStoryWithImages = (content: string, images: string[]) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const result = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      result.push(
        <div key={`paragraph-${i}`} className="mb-8">
          <p className="text-lg leading-relaxed text-gray-800 mb-6">
            {paragraphs[i]}
          </p>
        </div>
      );
      
      // Insert image after every 2-3 paragraphs
      if (images && images.length > 0 && (i + 1) % 2 === 0) {
        const imageIndex = Math.floor(i / 2) % images.length;
        result.push(
          <div key={`image-${i}`} className="my-12">
            <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={images[imageIndex]} 
                alt={`Story illustration ${imageIndex + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        );
      }
    }
    
    return result;
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

        <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          {story.main_image && (
            <div className="relative aspect-[21/9] bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
              <img 
                src={story.main_image} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Title Overlay with improved layout */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  {/* Left side - Title and metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex-shrink-0">
                        {story.category || 'Story'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm flex-shrink-0">
                        <Calendar className="h-4 w-4" />
                        {formatDate(story.created_at)}
                      </div>
                    </div>
                    
                    <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight break-words">
                      {story.title}
                    </h1>
                    
                    <p className="text-lg lg:text-xl leading-relaxed mb-4 lg:mb-6 break-words">
                      {story.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {story.view_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {story.like_count || 0} likes
                      </span>
                    </div>
                  </div>
                  
                  {/* Right side - Action buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      disabled={likeStoryMutation.isPending}
                      className={`bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors ${
                        userLiked 
                          ? 'bg-pink-500/30 border-pink-300' 
                          : ''
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${userLiked ? 'fill-current' : ''}`} />
                      {userLiked ? 'Liked' : 'Like'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Story Content with Integrated Images */}
          <div className="p-8 lg:p-12">
            {/* If no hero image, show title here */}
            {!story.main_image && (
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {story.category || 'Story'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(story.created_at)}
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {story.title}
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {story.description}
                </p>

                {/* Stats and Actions for non-hero stories */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
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
                      className={`hover:bg-pink-50 hover:border-pink-200 transition-colors ${
                        userLiked 
                          ? 'bg-pink-50 text-pink-600 border-pink-200' 
                          : 'hover:text-pink-600'
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${userLiked ? 'fill-current' : ''}`} />
                      {userLiked ? 'Liked' : 'Like'}
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
            )}

            {/* Story Content with Images Integrated */}
            <div className="prose prose-lg max-w-none">
              {createStoryWithImages(story.story_content, story.additional_images || [])}
            </div>

            {/* Story Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Published on {formatDate(story.created_at)}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    disabled={likeStoryMutation.isPending}
                    className={`hover:bg-pink-50 hover:border-pink-200 transition-colors ${
                      userLiked 
                        ? 'bg-pink-50 text-pink-600 border-pink-200' 
                        : 'hover:text-pink-600'
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${userLiked ? 'fill-current' : ''}`} />
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
