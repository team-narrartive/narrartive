
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useImageUpload } from './useImageUpload';

export const useDeleteStory = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { deleteStoryImages } = useImageUpload();

  const deleteStory = async (storyId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete stories.",
        variant: "destructive"
      });
      return false;
    }

    // If already deleting, prevent multiple clicks
    if (isDeleting) return false;

    setIsDeleting(true);
    
    try {
      // Delete story from database first
      const { error } = await (supabase as any)
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id); // Ensure user can only delete their own stories

      if (error) {
        console.error('Error deleting story:', error);
        throw error;
      }

      // Delete associated images from storage (fire and forget)
      deleteStoryImages(storyId).catch(err => 
        console.warn('Could not delete story images from storage:', err)
      );

      // Immediately update local cache to remove the story
      queryClient.setQueryData(['stories'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((story: any) => story.id !== storyId);
      });

      toast({
        title: "Story deleted successfully",
        description: "Your story has been permanently removed."
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting story:', error);
      toast({
        title: "Failed to delete story",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteStory,
    isDeleting
  };
};
