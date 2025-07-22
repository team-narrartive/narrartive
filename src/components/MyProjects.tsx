
import React, { useState } from 'react';
import { useStories } from '@/hooks/useStories';
import { useDeleteStory } from '@/hooks/useDeleteStory';
import { useIncrementViews } from '@/hooks/useStories';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  BookOpen, 
  Eye, 
  Heart, 
  Trash2, 
  Calendar,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  const [editingStory, setEditingStory] = useState<{id: string, title: string, description: string, isPublic: boolean} | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (storyId: string) => {
    if (deletingStoryId) return; // Prevent multiple deletions
    
    setDeletingStoryId(storyId);
    try {
      await deleteStoryMutation.deleteStory(storyId);
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

  const handleEdit = (story: any) => {
    setEditingStory({
      id: story.id,
      title: story.title,
      description: story.description,
      isPublic: story.is_public
    });
  };

  const handleSaveEdit = async () => {
    if (!editingStory || isSaving) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stories')
        .update({ 
          title: editingStory.title,
          description: editingStory.description,
          is_public: editingStory.isPublic
        })
        .eq('id', editingStory.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['stories'] });
      
      toast({
        title: "Story updated",
        description: "Your changes have been saved successfully."
      });
      
      setEditingStory(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Edit error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 relative z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleEdit(story);
                        setIsEditDialogOpen(true);
                      }}
                      className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full w-8 h-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{story.title}</CardTitle>
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

      {/* Edit Story Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => { 
          setIsEditDialogOpen(open); 
          if (!open) setEditingStory(null); 
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
          </DialogHeader>
          {editingStory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingStory.title}
                  onChange={(e) => setEditingStory(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingStory.description}
                  onChange={(e) => setEditingStory(prev => prev ? {...prev, description: e.target.value} : null)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="privacy">Privacy Settings</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="privacy"
                    checked={editingStory.isPublic}
                    onCheckedChange={(checked) => setEditingStory(prev => prev ? {...prev, isPublic: checked} : null)}
                  />
                  <span className="text-sm text-gray-600">
                    {editingStory.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isSaving}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Story
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Story</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{editingStory.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(editingStory.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
