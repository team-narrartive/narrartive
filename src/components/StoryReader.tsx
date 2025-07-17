
import React, { useEffect, useState } from 'react';
import { useStory, useLikeStory } from '@/hooks/useStories';
import { useLikedStories } from '@/hooks/useLikedStories';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, Eye, Share2, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  const { toggleLike, isLiked, isLoading: likesLoading } = useLikedStories();
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const userLiked = story && !likesLoading ? isLiked(story.id) : false;

  const handleLike = async () => {
    if (!story || likesLoading || likeStoryMutation.isPending) return;
    
    const userCurrentlyLikes = userLiked;
    console.log('StoryReader HandleLike called:', story.id, 'userCurrentlyLikes:', userCurrentlyLikes);
    
    toggleLike(story.id);
    
    try {
      await likeStoryMutation.mutateAsync({ 
        storyId: story.id, 
        shouldLike: !userCurrentlyLikes
      });
      console.log('StoryReader: Like/Unlike successful for story:', story.id);
    } catch (error) {
      toggleLike(story.id);
      console.error('StoryReader: Error with like/unlike:', error);
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

  const createStoryWithImages = (content: string, images: string[]) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const result = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      result.push(
        <div key={`paragraph-${i}`} className="mb-6 md:mb-8">
          <p className="text-base md:text-lg leading-relaxed text-gray-800 mb-4 md:mb-6">
            {paragraphs[i]}
          </p>
        </div>
      );
      
      if (images && images.length > 0 && (i + 1) % 2 === 0) {
        const imageIndex = Math.floor(i / 2) % images.length;
        result.push(
          <div key={`image-${i}`} className="my-8 md:my-12">
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

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  const nextImage = () => {
    if (story?.additional_images) {
      setCurrentImageIndex((prev) => (prev + 1) % story.additional_images.length);
    }
  };

  const prevImage = () => {
    if (story?.additional_images) {
      setCurrentImageIndex((prev) => (prev - 1 + story.additional_images.length) % story.additional_images.length);
    }
  };

  if (isLoading || likesLoading) {
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
        <div className="flex items-center justify-center min-h-96 px-4">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base">The story you're looking for doesn't exist or has been removed.</p>
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
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 text-sm md:text-base">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          {story.main_image && (
            <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
              <img 
                src={story.main_image} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 md:mb-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex-shrink-0 w-fit text-xs md:text-sm">
                        {story.category || 'Story'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs md:text-sm flex-shrink-0">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                        {formatDate(story.created_at)}
                      </div>
                    </div>
                    
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight break-words">
                      {story.title}
                    </h1>
                    
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-3 md:mb-4 lg:mb-6 break-words">
                      {story.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm mb-4 md:mb-0">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        {story.view_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 md:h-4 md:w-4" />
                        {story.like_count || 0} likes
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      disabled={likeStoryMutation.isPending || likesLoading}
                      className={`bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors text-xs md:text-sm h-8 md:h-10 ${
                        userLiked ? 'bg-pink-500/30 border-pink-300' : ''
                      }`}
                    >
                      <Heart className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${userLiked ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">{userLiked ? 'Liked' : 'Like'}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs md:text-sm h-8 md:h-10"
                    >
                      <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Story Content */}
          <div className="p-4 md:p-8 lg:p-12">
            <div className="prose prose-sm md:prose-lg max-w-none">
              {createStoryWithImages(story.story_content, story.additional_images || [])}
            </div>

            {/* Story Illustrations Album */}
            {story.additional_images && story.additional_images.length > 0 && (
              <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-6">Story Illustrations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {story.additional_images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all group"
                      onClick={() => openGallery(idx)}
                    >
                      <img 
                        src={img} 
                        alt={`Story image ${idx + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Full Screen Gallery Modal */}
        {showGallery && story.additional_images && story.additional_images.length > 0 && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGallery(false)}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {story.additional_images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Current Image */}
              <div className="max-w-4xl max-h-full">
                <img 
                  src={story.additional_images[currentImageIndex]} 
                  alt={`Story image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                {currentImageIndex + 1} / {story.additional_images.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
