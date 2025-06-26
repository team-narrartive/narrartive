
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
        image_versions: data.imageVersions,
        is_public: data.isPublic || false,
        canvas_data: data.canvasData || null,
        like_count: 0,
        view_count: 0,
        generation_settings: data.imageVersions.length > 0 
          ? data.imageVersions[data.imageVersions.length - 1].settings 
          : {}
      };

      const { data: savedStory, error } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();

      if (error) {
        console.error('Error saving story:', error);
        throw error;
      }

      toast({
        title: "Story saved successfully! 🎉",
        description: "Your story and images have been saved to your projects."
      });

      return savedStory;
    } catch (error: any) {
      console.error('Error saving story:', error);
      toast({
        title: "Failed to save story",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveStory,
    isSaving
  };
};
