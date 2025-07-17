
import React, { useState } from 'react';
import { useStories } from '@/hooks/useStories';
import { useDeleteStory } from '@/hooks/useDeleteStory';
import { useIncrementViews } from '@/hooks/useStories';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Eye, 
  Heart, 
  Trash2, 
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { data: stories, isLoading, error } = useStories('personal');
  const deleteStoryMutation = useDeleteStory();
  const incrementViewsMutation = useIncrementViews();
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

  const handleDelete = async (storyId: string) => {
    if (deletingStoryId) return; // Prevent multiple deletions
    
    setDeletingStoryId(storyId);
    try {
      await deleteStoryMutation.mutateAsync(storyId);
    } catch (error) {
      console.error('Error deleting story:', error);
    } finally {
      setDeletingStoryId(null);
    }
  };

  const handleReadStory = async (storyId: string) => {
    try {
      await incrementViewsMutation.mutateAsync(storyId);
      onViewStory(storyId);
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Still navigate to story even if view increment fails
      onViewStory(storyId);
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

  if (error) {
    return (
      <Layout showSidebar={true} currentView="projects">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">Manage and view your created stories</p>
            </div>
            <Button onClick={onBack} variant="outline">
              Back to Dashboard
            </Button>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Having trouble loading your projects. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} currentView="projects">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Manage and view your created stories</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {stories && stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="group bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                  {story.main_image && (
                    <img 
                      src={story.main_image} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/80 text-gray-700">
                      {story.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg line-clamp-1">{story.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(story.id)}
                      disabled={deletingStoryId === story.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {deletingStoryId === story.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {story.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {story.view_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {story.like_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(story.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleReadStory(story.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first story to get started</p>
            <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Story
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};
