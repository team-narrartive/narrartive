
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useDeleteStory = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteStory = async (storyId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete stories.",
        variant: "destructive"
      });
      return false;
    }

    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id); // Ensure user can only delete their own stories

      if (error) {
        console.error('Error deleting story:', error);
        throw error;
      }

      // Invalidate and refetch stories to update the UI
      await queryClient.invalidateQueries({ queryKey: ['stories'] });
      await queryClient.refetchQueries({ queryKey: ['stories', 'personal'] });

      toast({
        title: "Story deleted successfully! 🗑️",
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
