import React, { useEffect, useState } from 'react';
import { useStory, useLikeStory, useIncrementViews } from '@/hooks/useStories';
import { useLikedStories } from '@/hooks/useLikedStories';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Heart, Eye, Share2, Calendar, ChevronDown, ChevronRight, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageVersion {
  id: string;
  images: string[];
  created_at: string;
  settings: {
    numImages: number;
    quality: string;
    style: string;
  };
}

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
  const [showPreviousVersions, setShowPreviousVersions] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const userLiked = story && !likesLoading ? isLiked(story.id) : false;

  // Parse image versions from the story data with proper type casting
  const imageVersions: ImageVersion[] = Array.isArray(story?.image_versions) ? (story.image_versions as unknown as ImageVersion[]) : [];
  const currentVersion = imageVersions.length > 0 ? imageVersions[imageVersions.length - 1] : null;
  const previousVersions = imageVersions.slice(0, -1);

  // Remove the automatic view increment here since MyProjects already handles it

  const handleLike = async () => {
    if (!story || likesLoading || likeStoryMutation.isPending) return;
    
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
      console.log('StoryReader: Like/Unlike successful for story:', story.id);
    } catch (error) {
      // Revert local state if database update fails
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

  // Function to split story content into paragraphs and interleave with images
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
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto px-4 md:px-0">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2 text-sm md:text-base">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">Back</span>
            </Button>

            {/* Show gallery button */}
            {story.additional_images && story.additional_images.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowGallery(!showGallery)} 
                className="flex items-center gap-2 text-sm md:text-base ml-auto"
              >
                <Image className="h-4 w-4" />
                <span>{showGallery ? "Hide Gallery" : "View Gallery"}</span>
              </Button>
            )}
          </div>

          {/* Image Gallery */}
          {showGallery && story.additional_images && story.additional_images.length > 0 && (
            <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Story Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {story.additional_images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                    onClick={() => window.open(img, '_blank')}
                  >
                    <img 
                      src={img} 
                      alt={`Story image ${idx + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Image */}
            {story.main_image && (
              <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                <img 
                  src={story.main_image} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                {/* Thumbnail previews of additional images */}
                {story.additional_images && story.additional_images.length > 0 && (
                  <div className="absolute bottom-4 right-4 p-2 flex gap-2 bg-black/30 backdrop-blur-sm rounded-lg">
                    {story.additional_images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Story image ${index + 1}`}
                        className="w-12 h-12 rounded-md border-2 border-white/20 hover:border-white/50 transition-all cursor-pointer object-cover"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                    {story.additional_images.length > 3 && (
                      <div 
                        className="w-12 h-12 rounded-md bg-black/40 text-white flex items-center justify-center cursor-pointer"
                        onClick={() => setShowGallery(true)}
                      >
                        +{story.additional_images.length - 3}
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Title Overlay with improved mobile layout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 text-white">
                  <div className="flex flex-col gap-4 md:gap-6">
                    {/* Metadata and title */}
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
                          userLiked 
                            ? 'bg-pink-500/30 border-pink-300' 
                            : ''
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

            {/* Story Content with Integrated Images */}
            <div className="p-4 md:p-8 lg:p-12">
              {/* If no hero image, show title here */}
              {!story.main_image && (
                <div className="mb-8 md:mb-12">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 md:mb-6">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 w-fit text-xs md:text-sm">
                      {story.category || 'Story'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      {formatDate(story.created_at)}
                    </div>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                    {story.title}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-6 md:mb-8">
                    {story.description}
                  </p>

                  {/* Stats and Actions for non-hero stories */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        {story.view_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 md:h-4 md:w-4" />
                        {story.like_count || 0} likes
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleLike}
                        disabled={likeStoryMutation.isPending || likesLoading}
                        className={`hover:bg-pink-50 hover:border-pink-200 transition-colors text-xs md:text-sm h-8 md:h-10 ${
                          userLiked 
                            ? 'bg-pink-50 text-pink-600 border-pink-200' 
                            : 'hover:text-pink-600'
                        }`}
                      >
                        <Heart className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${userLiked ? 'fill-current' : ''}`} />
                        {userLiked ? 'Liked' : 'Like'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-xs md:text-sm h-8 md:h-10"
                      >
                        <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Story Content with Images Integrated */}
              <div className="prose prose-sm md:prose-lg max-w-none">
                {createStoryWithImages(story.story_content, story.additional_images || [])}
              </div>

              {/* Gallery Section */}
              {story.additional_images && story.additional_images.length > 0 && (
                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Story Illustrations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {story.additional_images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-video rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                        onClick={() => window.open(img, '_blank')}
                      >
                        <img 
                          src={img} 
                          alt={`Story image ${idx + 1}`} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Footer */}
              <div className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs md:text-sm text-gray-500">
                    Published on {formatDate(story.created_at)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      disabled={likeStoryMutation.isPending || likesLoading}
                      className={`hover:bg-pink-50 hover:border-pink-200 transition-colors text-xs md:text-sm h-8 md:h-10 ${
                        userLiked 
                          ? 'bg-pink-50 text-pink-600 border-pink-200' 
                          : 'hover:text-pink-600'
                      }`}
                    >
                      <Heart className={`h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 ${userLiked ? 'fill-current' : ''}`} />
                      {story.like_count || 0} Likes
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-xs md:text-sm h-8 md:h-10"
                    >
                      <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Share Story</span>
                      <span className="sm:hidden">Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Image Versions Sidebar */}
        {imageVersions.length > 0 && (
          <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/30 h-screen flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/20 bg-white/80">
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-sky-600" />
                <h2 className="font-semibold text-gray-900">Generated Images</h2>
                <span className="text-xs bg-sky-100 text-sky-600 px-2 py-1 rounded-full">
                  {currentVersion?.images.length || 0}
                </span>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {/* Previous Versions - Collapsible */}
                {previousVersions.length > 0 && (
                  <Collapsible open={showPreviousVersions} onOpenChange={setShowPreviousVersions}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between p-2 h-auto text-left"
                      >
                        <span className="flex items-center text-sm font-medium">
                          <span>Previous Versions</span>
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {previousVersions.length}
                          </span>
                        </span>
                        {showPreviousVersions ? (
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        ) : (
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 space-y-2 pl-2">
                        {previousVersions.map((version, vIndex) => (
                          <div key={version.id} className="pt-2">
                            <div className="text-xs text-gray-500 mb-1">
                              {new Date(version.created_at).toLocaleDateString()} - 
                              {version.settings && (
                                <span className="ml-1">
                                  {version.settings.quality || 'Standard'} · 
                                  {version.settings.style || 'Default'}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {version.images.slice(0, 4).map((img, imgIndex) => (
                                <div key={imgIndex} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                                  <img 
                                    src={img} 
                                    alt={`Version ${vIndex + 1} image ${imgIndex + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {version.images.length > 4 && (
                                <div className="col-span-2 text-xs text-center text-gray-500 mt-1">
                                  +{version.images.length - 4} more images
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {/* Current Version */}
                {currentVersion && (
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Current Version</h3>
                      {currentVersion.created_at && (
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(currentVersion.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {currentVersion.images.map((img, imgIndex) => (
                        <Card key={imgIndex} className="overflow-hidden">
                          <img 
                            src={img} 
                            alt={`Current version image ${imgIndex + 1}`}
                            className="w-full aspect-video object-cover"
                          />
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};