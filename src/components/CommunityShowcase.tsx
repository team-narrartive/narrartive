
import React from 'react';
import { Layout } from './Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Eye, 
  Share2, 
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useStories, useLikeStory } from '@/hooks/useStories';

interface CommunityShowcaseProps {
  onBack: () => void;
  onViewStory: (storyId: string) => void;
}

export const CommunityShowcase: React.FC<CommunityShowcaseProps> = ({ onBack, onViewStory }) => {
  const { data: communityProjects = [], isLoading } = useStories('community');
  const likeStory = useLikeStory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleLike = (storyId: string) => {
    likeStory.mutate(storyId);
  };

  if (isLoading) {
    return (
      <Layout showSidebar={true} currentView="community">
        <div className="flex items-center justify-center min-h-screen">
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Showcase</h1>
            <p className="text-gray-600 mt-2">Discover amazing stories created by our community</p>
          </div>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {/* Featured Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8" />
              <div>
                <p className="text-2xl font-bold">{communityProjects.length}</p>
                <p className="text-purple-100">Featured Stories</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-2xl font-bold">{communityProjects.reduce((acc, p) => acc + (p.like_count || 0), 0)}</p>
                <p className="text-emerald-100">Total Likes</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8" />
              <div>
                <p className="text-2xl font-bold">{communityProjects.reduce((acc, p) => acc + (p.view_count || 0), 0)}</p>
                <p className="text-orange-100">Total Views</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Community Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              {/* Project Image */}
              {project.main_image && (
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={project.main_image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/80 text-gray-900">
                      {(project.additional_images?.length || 0) + 1} images
                    </Badge>
                  </div>
                </div>
              )}

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                {/* Story Preview */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-700 line-clamp-3 italic">
                    "{project.story_content.substring(0, 120)}..."
                  </p>
                </div>

                {/* Project Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{project.like_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{project.view_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onViewStory(project.id)}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Read
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleLike(project.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {communityProjects.length === 0 && (
          <Card className="p-12 bg-white/80 backdrop-blur-sm border border-white/20 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Community Stories Yet</h3>
            <p className="text-gray-600">Be the first to share your story with the community!</p>
          </Card>
        )}
      </div>
    </Layout>
  );
};
