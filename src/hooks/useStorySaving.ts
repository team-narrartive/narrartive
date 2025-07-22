
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useImageUpload } from './useImageUpload';

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
  const { uploadMultipleImages, base64ToBlob } = useImageUpload();

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
      // Generate a temporary story ID for organizing images
      const tempStoryId = crypto.randomUUID();
      
      // Get only the latest generation for processing
      const latestVersion = data.imageVersions[data.imageVersions.length - 1];
      
      let mainImageUrl = null;
      let additionalImageUrls: string[] = [];
      
      // Upload images to storage if they exist and are Base64
      if (latestVersion?.images && latestVersion.images.length > 0) {
        console.log('Uploading images to storage...');
        
        // Filter out any existing URLs (in case of mixed data)
        const base64Images = latestVersion.images.filter(img => 
          img.startsWith('data:image/') || (!img.startsWith('http'))
        );
        
        if (base64Images.length > 0) {
          // Convert Base64 strings to Blobs
          const imageBlobs = base64Images.map(base64 => base64ToBlob(base64));
          
          // Upload all images
          const uploadResults = await uploadMultipleImages(imageBlobs, tempStoryId);
          
          // Set main image and additional images
          mainImageUrl = uploadResults[0]?.url || null;
          additionalImageUrls = uploadResults.slice(1).map(result => result.url);
        } else {
          // If images are already URLs, use them directly
          mainImageUrl = latestVersion.images[0] || null;
          additionalImageUrls = latestVersion.images.slice(1);
        }
      }
      
      // Use provided main image if available, otherwise use first uploaded image
      const finalMainImage = data.mainImage || mainImageUrl;
      
      const storyData = {
        user_id: user.id,
        title: data.title,
        description: data.description,
        story_content: data.storyContent,
        main_image: finalMainImage,
        additional_images: additionalImageUrls,
        generation_settings: JSON.parse(JSON.stringify(
          latestVersion?.settings || {}
        )),
        is_public: data.isPublic || false,
        canvas_data: JSON.parse(JSON.stringify(data.canvasData || null)),
        like_count: 0,
        view_count: 0
      };

      console.log('Saving story with uploaded image URLs:', storyData);

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
