import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  url: string;
  path: string;
}

export const useImageUpload = () => {
  const uploadImage = async (
    imageBlob: Blob, 
    storyId: string, 
    filename: string
  ): Promise<ImageUploadResult> => {
    try {
      // Create unique path for the image
      const timestamp = Date.now();
      const path = `stories/${storyId}/${timestamp}-${filename}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('story-images')
        .upload(path, imageBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('story-images')
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const uploadMultipleImages = async (
    imageBlobs: Blob[],
    storyId: string
  ): Promise<ImageUploadResult[]> => {
    const uploadPromises = imageBlobs.map((blob, index) => 
      uploadImage(blob, storyId, `image-${index + 1}.png`)
    );
    
    return Promise.all(uploadPromises);
  };

  const deleteStoryImages = async (storyId: string): Promise<void> => {
    try {
      // List all files in the story folder
      const { data: files, error: listError } = await supabase.storage
        .from('story-images')
        .list(`stories/${storyId}`);

      if (listError) {
        console.error('Error listing files for deletion:', listError);
        return;
      }

      if (files && files.length > 0) {
        // Delete all files in the story folder
        const filePaths = files.map(file => `stories/${storyId}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('story-images')
          .remove(filePaths);

        if (deleteError) {
          console.error('Error deleting story images:', deleteError);
        }
      }
    } catch (error) {
      console.error('Failed to delete story images:', error);
    }
  };

  // Convert Base64 string to Blob
  const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteStoryImages,
    base64ToBlob
  };
};