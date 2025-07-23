
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
import { useDeleteStory } from '@/hooks/useDeleteStory';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Heart, Eye, Calendar, Trash2, Edit, Globe, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MyProjectsProps {
  onBack: () => void;
  onCreateNew: () => void;
  onViewStory: (storyId: string) => void;
}

export const MyProjects: React.FC<MyProjectsProps> = ({ onBack, onCreateNew, onViewStory }) => {
  const { user } = useAuth();
  const { data: stories, isLoading, error } = useStories('personal');
  const { deleteStory, isDeleting } = useDeleteStory();
  const { toast } = useToast();

  const handleDelete = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      toast({
        title: "Story deleted",
        description: "Your story has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error deleting story",
        description: "There was an issue deleting your story. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout showSidebar={true} currentView="projects" onBack={onBack}>
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground font-medium">Loading your projects...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showSidebar={true} currentView="projects" onBack={onBack}>
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Projects</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't load your projects right now. Please try refreshing the page or check back later.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} currentView="projects" onBack={onBack}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-display text-foreground mb-6">
            My Projects
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Your creative library of <span className="text-primary font-semibold">interactive stories</span>
          </p>
        </div>

        {!stories || stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">No Projects Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start creating your first interactive story and watch your library grow!
            </p>
            <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Your First Story
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <Card key={story.id} className="border border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer transform hover:scale-105 rounded-xl overflow-hidden bg-white">
                <div className="aspect-video gradient-primary relative overflow-hidden">
                  {story.main_image ? (
                    <img
                      src={story.main_image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  {/* Privacy Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant={story.is_public ? "default" : "secondary"} className="text-xs">
                      {story.is_public ? (
                        <>
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-display text-foreground line-clamp-2 mb-2">
                        {story.title}
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground font-medium line-clamp-3">
                        {story.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  <div className="flex justify-between items-center text-sm text-muted-foreground font-medium mb-4">
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {story.view_count || 0} views
                    </span>
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      {story.like_count || 0} likes
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(story.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Story</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{story.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(story.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
