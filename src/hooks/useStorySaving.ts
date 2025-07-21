
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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

interface SaveStoryData {
  title: string;
  description: string;
  storyContent: string;
  imageVersions: ImageVersion[];
  mainImage?: string;
  isPublic?: boolean;
  canvasData?: any;
}

export const useStorySaving = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveStory = async (data: SaveStoryData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save stories.",
        variant: "destructive"
      });
      return null;
    }

    setIsSaving(true);
    
    try {
      const storyData = {
        user_id: user.id,
        title: data.title,
        description: data.description,
        story_content: data.storyContent,
        main_image: data.mainImage || (data.imageVersions[0]?.images[0] || null),
        additional_images: data.imageVersions.length > 0 
          ? data.imageVersions[data.imageVersions.length - 1].images 
          : [],
        image_versions: JSON.parse(JSON.stringify(data.imageVersions)), // Convert to JSON - ALWAYS save all versions
        is_public: data.isPublic || false,
        canvas_data: JSON.parse(JSON.stringify(data.canvasData || null)), // Convert to JSON
        like_count: 0,
        view_count: 0,
        generation_settings: JSON.parse(JSON.stringify(
          data.imageVersions.length > 0 
            ? data.imageVersions[data.imageVersions.length - 1].settings 
            : {}
        )) // Convert to JSON
      };

      console.log('Saving story with data:', storyData);

      const { data: savedStory, error } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();

      if (error) {
        console.error('Error saving story:', error);
        throw error;
      }

      console.log('Story saved successfully:', savedStory);

      // Immediately invalidate and refetch stories to show the new project quickly
      await queryClient.invalidateQueries({ queryKey: ['stories'] });
      await queryClient.refetchQueries({ queryKey: ['stories', 'personal'] });
      await queryClient.refetchQueries({ queryKey: ['stories', 'community'] });

      return savedStory;
    } catch (error: any) {
      console.error('Error saving story:', error);
      toast({
        title: "Failed to save story",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw so the calling component can handle it
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveStory,
    isSaving
  };
};
