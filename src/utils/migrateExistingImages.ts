import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';

interface StoryWithImages {
  id: string;
  main_image: string | null;
  additional_images: string[];
}

export const migrateExistingImages = async () => {
  const { uploadImage, base64ToBlob } = useImageUpload();
  
  try {
    console.log('Starting migration of existing Base64 images to storage...');
    
    // Get all stories with Base64 images
    const { data: stories, error } = await supabase
      .from('stories')
      .select('id, main_image, additional_images')
      .or('main_image.like.data:image%,additional_images.ov.{data:image%}') as { data: StoryWithImages[] | null, error: any };
    
    if (error) {
      console.error('Error fetching stories:', error);
      return;
    }
    
    if (!stories || stories.length === 0) {
      console.log('No stories with Base64 images found.');
      return;
    }
    
    console.log(`Found ${stories.length} stories with Base64 images to migrate.`);
    
    for (const story of stories) {
      console.log(`Migrating story ${story.id}...`);
      
      let newMainImage = story.main_image;
      let newAdditionalImages = [...(story.additional_images || [])];
      
      // Migrate main image if it's Base64
      if (story.main_image && story.main_image.startsWith('data:image/')) {
        try {
          console.log(`Converting main image for story ${story.id}...`);
          const blob = base64ToBlob(story.main_image);
          const result = await uploadImage(blob, story.id, 'main.png');
          newMainImage = result.url;
          console.log(`Main image migrated: ${result.url}`);
        } catch (error) {
          console.error(`Failed to migrate main image for story ${story.id}:`, error);
        }
      }
      
      // Migrate additional images if they're Base64
      if (story.additional_images && story.additional_images.length > 0) {
        const migratedAdditionalImages: string[] = [];
        
        for (let i = 0; i < story.additional_images.length; i++) {
          const image = story.additional_images[i];
          
          if (image.startsWith('data:image/')) {
            try {
              console.log(`Converting additional image ${i + 1} for story ${story.id}...`);
              const blob = base64ToBlob(image);
              const result = await uploadImage(blob, story.id, `additional-${i + 1}.png`);
              migratedAdditionalImages.push(result.url);
              console.log(`Additional image ${i + 1} migrated: ${result.url}`);
            } catch (error) {
              console.error(`Failed to migrate additional image ${i + 1} for story ${story.id}:`, error);
              // Keep the original Base64 if migration fails
              migratedAdditionalImages.push(image);
            }
          } else {
            // Keep existing URLs
            migratedAdditionalImages.push(image);
          }
        }
        
        newAdditionalImages = migratedAdditionalImages;
      }
      
      // Update the story with new URLs
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          main_image: newMainImage,
          additional_images: newAdditionalImages
        })
        .eq('id', story.id);
      
      if (updateError) {
        console.error(`Failed to update story ${story.id}:`, updateError);
      } else {
        console.log(`Successfully migrated story ${story.id}`);
      }
    }
    
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
