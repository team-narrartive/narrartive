
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStories } from '@/hooks/useStories';
import { useDeleteStory } from '@/hooks/useDeleteStory';
import { Layout } from './Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Heart, Eye, Calendar, Trash2, Edit, Globe, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  
  const [editingStory, setEditingStory] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', is_public: false });
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (story: any) => {
    setEditingStory(story);
    setEditForm({
      title: story.title,
      description: story.description,
      is_public: story.is_public
    });
  };

  const handleSaveEdit = async () => {
    if (!editingStory) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          title: editForm.title,
          description: editForm.description,
          is_public: editForm.is_public
        })
        .eq('id', editingStory.id);

      if (error) throw error;

      // Update the cache immediately
      queryClient.setQueryData(['stories', 'personal'], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(story => 
          story.id === editingStory.id 
            ? { ...story, ...editForm }
            : story
        );
      });

      toast({
        title: "Story updated",
        description: "Your story has been successfully updated.",
      });
      
      setEditingStory(null);
    } catch (error) {
      toast({
        title: "Error updating story",
        description: "There was an issue updating your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      // Optimistically update the UI immediately
      queryClient.setQueryData(['stories', 'personal'], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.filter(story => story.id !== storyId);
      });

      await deleteStory(storyId);
      toast({
        title: "Story deleted",
        description: "Your story has been successfully deleted.",
      });
    } catch (error) {
      // If deletion fails, revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['stories', 'personal'] });
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
      <div className="space-y-6">
        <div className="flex items-center justify-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
            <p className="text-muted-foreground mt-2">Your creative library of interactive stories</p>
          </div>
        </div>

        {!stories || stories.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base mb-8">
              Start creating your first interactive story and watch your library grow!
            </p>
            <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Your First Story
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="border border-gray-300 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="aspect-video gradient-primary relative overflow-hidden">
                  {story.main_image ? (
                    <img
                      src={story.main_image}
                      alt={story.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
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

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">
                    {story.title}
                  </CardTitle>
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
                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={editingStory?.id === story.id} onOpenChange={(open) => !open && setEditingStory(null)}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => handleEditClick(story)}
                          variant="outline"
                          className="flex-1 bg-white text-black border-black hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Story</DialogTitle>
                          <DialogDescription>
                            Update your story details and privacy settings.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              placeholder="Story title..."
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Story description..."
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="public"
                              checked={editForm.is_public}
                              onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
                            />
                            <Label htmlFor="public">Make story public</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
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
