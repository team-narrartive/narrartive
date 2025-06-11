
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Eye,
  Clock,
  User
} from 'lucide-react';
import { useStory, useLikeStory, useIncrementViews } from '@/hooks/useStories';
import { useToast } from '@/hooks/use-toast';

interface StoryReaderProps {
  storyId: string;
  onBack: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({ storyId, onBack }) => {
  const { data: story, isLoading, error } = useStory(storyId);
  const likeStory = useLikeStory();
  const incrementViews = useIncrementViews();
  const { toast } = useToast();

  useEffect(() => {
    if (story) {
      incrementViews.mutate(storyId);
    }
  }, [story, storyId]);

  const handleLike = () => {
    likeStory.mutate(storyId);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: story?.title,
        text: story?.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Story link has been copied to clipboard."
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h1>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex space-x-2">
            <Button onClick={handleLike} variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-1" />
              {story.like_count || 0}
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Story Content */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 overflow-hidden">
          {/* Hero Image */}
          {story.main_image && (
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={story.main_image} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Title and Meta */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{story.title}</h1>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Anonymous Author</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(story.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{story.view_count || 0} views</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Badge variant={story.is_public ? "default" : "secondary"}>
                    {story.is_public ? "Public" : "Private"}
                  </Badge>
                  <Badge variant="outline">
                    {story.category}
                  </Badge>
                </div>
              </div>

              <p className="text-xl text-gray-700 leading-relaxed">{story.description}</p>
            </div>

            {/* Story Content */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-purple-500">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {story.story_content}
                </p>
              </div>
            </div>

            {/* Additional Images */}
            {story.additional_images && story.additional_images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {story.additional_images.map((image, index) => (
                    <div key={index} className="aspect-video relative overflow-hidden rounded-lg">
                      <img 
                        src={image} 
                        alt={`${story.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
