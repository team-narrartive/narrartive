import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Character {
  name: string;
  type: 'human' | 'animal' | 'creature' | 'object';
  description?: string;
  attributes: Record<string, any>;
}

interface ImageSettings {
  numImages: number;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'artistic' | 'cartoon';
  instructions?: string;
}

// Constants for optimization  
const MAX_PROMPT_LENGTH = 3500;
// No individual timeouts - let OpenAI take as long as needed
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000;

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Initialize Supabase client for file uploads
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced retry logic with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    
    console.log(`Retrying after ${delayMs}ms, attempts remaining: ${attempts - 1}`);
    await delay(delayMs);
    return retryWithBackoff(fn, attempts - 1, delayMs * 1.5);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { story, characters, settings } = await req.json();
    
    console.log('Processing story for image generation with settings:', settings);
    console.log(`Story length: ${story?.length || 0} characters`);
    console.log(`Characters count: ${characters?.length || 0}`);
    console.log('Characters data:', JSON.stringify(characters, null, 2));

    // Input validation
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!story) {
      throw new Error('Missing required parameter: story');
    }

    // Use settings from the request with validation
    const imageSettings: ImageSettings = settings || {
      numImages: Math.min(Math.max(1, Math.floor(story.split(' ').length / 200)), 4),
      quality: 'medium',
      style: 'realistic'
    };

    if (imageSettings.numImages < 1 || imageSettings.numImages > 10) {
      throw new Error('Number of images must be between 1 and 10');
    }

    // Truncate very long stories for better performance
    const processedStory = story.length > 1800 ? story.slice(0, 1800) + '...' : story;

    // Define optimized style prompts
    const stylePrompts = {
      realistic: "Photorealistic, highly detailed, professional quality",
      artistic: "Artistic illustration, beautiful composition, expressive style",
      cartoon: "Cartoon style, vibrant colors, expressive characters"
    };

    // Scene distribution function for multiple images
    const getSceneDescription = (imageIndex: number, totalImages: number, storyText: string): string => {
      if (totalImages === 1) return "the main key scene";
      
      // Predefined scene distributions for common cases
      const sceneDistributions = {
        2: ["opening scene", "concluding scene"],
        3: ["opening scene", "middle scene", "final scene"],
        4: ["opening scene", "early middle scene", "late middle scene", "final scene"],
        5: ["opening scene", "early scene", "middle scene", "late scene", "final scene"]
      };
      
      if (sceneDistributions[totalImages]) {
        return sceneDistributions[totalImages][imageIndex];
      }
      
      // For more images, distribute evenly across story progression
      const progress = imageIndex / (totalImages - 1);
      if (progress === 0) return "opening scene";
      if (progress === 1) return "final scene";
      return `scene ${imageIndex + 1} (${Math.round(progress * 100)}% through story)`;
    };

    // Enhanced character description function with clear visual attribute labeling
    const formatCharacterDescription = (char: Character): string => {
      if (!char?.name) return '';
      
      let description = char.name;
      
      // Build detailed visual description with proper context
      if (char.attributes && Object.keys(char.attributes).length > 0) {
        const visualDescriptions = [];
        
        // Process attributes with clear contextual descriptions
        Object.entries(char.attributes).forEach(([key, value]) => {
          if (!value || value === "Not described" || !value.toString().trim()) return;
          
          const lowerKey = key.toLowerCase();
          const valueStr = value.toString().trim();
          
          // Convert attributes to descriptive text with proper context
          if (lowerKey.includes('shirt') || lowerKey.includes('top')) {
            visualDescriptions.push(`wearing a ${valueStr}`);
          } else if (lowerKey.includes('pants') || lowerKey.includes('shorts') || lowerKey.includes('bottom')) {
            visualDescriptions.push(`wearing ${valueStr}`);
          } else if (lowerKey.includes('hair') && lowerKey.includes('color')) {
            visualDescriptions.push(`${valueStr} hair`);
          } else if (lowerKey.includes('eye') && lowerKey.includes('color')) {
            visualDescriptions.push(`${valueStr} eyes`);
          } else if (lowerKey.includes('skin')) {
            visualDescriptions.push(`${valueStr} skin tone`);
          } else if (lowerKey.includes('height')) {
            visualDescriptions.push(`${valueStr} tall`);
          } else if (lowerKey.includes('ethnicity') || lowerKey.includes('nationality')) {
            visualDescriptions.push(`${valueStr} ethnicity`);
          } else if (lowerKey.includes('age')) {
            visualDescriptions.push(`${valueStr} years old`);
          } else if (lowerKey.includes('watch') || lowerKey.includes('accessory')) {
            visualDescriptions.push(`wearing a ${valueStr}`);
          } else if (lowerKey.includes('hair') && lowerKey.includes('type')) {
            visualDescriptions.push(`${valueStr} hair`);
          } else if (lowerKey.includes('facial') && lowerKey.includes('hair')) {
            visualDescriptions.push(`${valueStr}`);
          } else if (lowerKey.includes('body') && lowerKey.includes('type')) {
            visualDescriptions.push(`${valueStr} build`);
          } else if (lowerKey.includes('clothing') && lowerKey.includes('style')) {
            visualDescriptions.push(`${valueStr} clothing style`);
          } else {
            // For any other important visual attributes, include with context
            if (lowerKey.includes('color') || lowerKey.includes('appearance')) {
              visualDescriptions.push(`${key.toLowerCase()}: ${valueStr}`);
            }
          }
        });
        
        // Limit to most important visual details to avoid overwhelming the prompt
        const finalDescriptions = visualDescriptions.slice(0, 8);
        
        if (finalDescriptions.length > 0) {
          description += ` (${finalDescriptions.join(", ")})`;
        }
      }
      
      return description;
    };

    console.log(`Generating ${imageSettings.numImages} images with ${imageSettings.quality} quality and ${imageSettings.style} style`);

    const generatedImages: string[] = [];
    const errors: string[] = [];
    const startTime = Date.now();

    // Quality mapping for gpt-image-1
    const qualityMap = {
      low: "low",
      medium: "medium", 
      high: "high"
    };

    // Generate all images in parallel for better performance
    const imagePromises = [];
    
    for (let i = 0; i < imageSettings.numImages; i++) {
      try {
        const sceneDescription = getSceneDescription(i, imageSettings.numImages, processedStory);
        
        // Build optimized prompt for single scene focus
        let prompt = `${stylePrompts[imageSettings.style]}. `;
        prompt += `Create ONLY ${sceneDescription} from this story: "${processedStory}" `;
        prompt += `Show ONE specific moment only. Do not combine multiple story events. `;
        
        // Add character information efficiently
        if (characters?.length > 0) {
          const validChars = characters
            .filter(char => char?.name)
            .slice(0, 4) // Limit to 4 characters max for prompt efficiency
            .map(formatCharacterDescription)
            .filter(desc => desc.length > 0);
            
          if (validChars.length > 0) {
            prompt += `Include characters: ${validChars.join("; ")}. `;
          }
        }
        
        // Add user instructions if provided
        if (imageSettings.instructions?.trim()) {
          prompt += `Additional requirements: ${imageSettings.instructions.trim().slice(0, 200)}. `;
        }
        
        // Ensure prompt length is within limits
        if (prompt.length > MAX_PROMPT_LENGTH) {
          prompt = prompt.slice(0, MAX_PROMPT_LENGTH - 20) + "...";
          console.log(`Prompt truncated to ${prompt.length} characters for image ${i + 1}`);
        }
        
        // Create async function for this image
        const generateImage = async () => {
          try {
        console.log(`Generating image ${i + 1}/${imageSettings.numImages} - Scene: ${sceneDescription}`);
        console.log(`Prompt length: ${prompt.length} characters`);
        console.log(`Full prompt for image ${i + 1}:`, prompt);

            // Make API call with retry logic (no timeout)
            const imageData = await retryWithBackoff(async () => {
              const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openAIApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: "gpt-image-1",
                  prompt: prompt.trim(),
                  size: "1024x1024",
                  quality: qualityMap[imageSettings.quality] || "medium",
                  output_format: "png"
                })
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                throw new Error(`OpenAI API error: ${errorMessage}`);
              }

              const data = await response.json();
              
              if (!data.data?.[0]) {
                throw new Error('No image data received from OpenAI API');
              }

              const imageItem = data.data[0];
              
              if (!imageItem.b64_json) {
                throw new Error('No base64 image data in response');
              }

              // Convert base64 to blob and upload to Supabase storage
              const imageBuffer = Uint8Array.from(atob(imageItem.b64_json), c => c.charCodeAt(0));
              const fileName = `${Date.now()}-image-${i + 1}.png`;
              const storyId = crypto.randomUUID(); // Generate unique story ID
              const filePath = `stories/${storyId}/${fileName}`;

              console.log(`Uploading image ${i + 1} to storage: ${filePath}`);
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('story-images')
                .upload(filePath, imageBuffer, {
                  contentType: 'image/png',
                  upsert: false
                });

              if (uploadError) {
                console.error(`Storage upload error for image ${i + 1}:`, uploadError);
                throw new Error(`Failed to upload image: ${uploadError.message}`);
              }

              // Get public URL
              const { data: urlData } = supabase.storage
                .from('story-images')
                .getPublicUrl(filePath);

              console.log(`✓ Image ${i + 1} uploaded successfully: ${urlData.publicUrl}`);
              return urlData.publicUrl;
            });

            console.log(`✓ Successfully generated image ${i + 1}/${imageSettings.numImages} for ${sceneDescription}`);
            return { success: true, data: imageData, index: i + 1 };
            
          } catch (error) {
            console.error(`✗ Failed to generate image ${i + 1}:`, error.message);
            return { success: false, error: `Image ${i + 1}: ${error.message}`, index: i + 1 };
          }
        };

        imagePromises.push(generateImage());
      } catch (error) {
        console.error(`✗ Failed to build prompt for image ${i + 1}:`, error.message);
        // Create error result for this image
        imagePromises.push(Promise.resolve({ 
          success: false, 
          error: `Image ${i + 1}: ${error.message}`, 
          index: i + 1 
        }));
      }
    }

    // Wait for all images to complete (parallel processing)
    console.log('Processing all images in parallel...');
    const results = await Promise.allSettled(imagePromises);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const imageResult = result.value;
        if (imageResult.success) {
          generatedImages.push(imageResult.data);
        } else {
          errors.push(imageResult.error);
        }
      } else {
        errors.push(`Image ${index + 1}: ${result.reason?.message || 'Unknown error'}`);
      }
    });

    const totalTime = Date.now() - startTime;
    console.log(`Generation completed in ${totalTime}ms: ${generatedImages.length}/${imageSettings.numImages} images successful`);

    // Handle results - even partial success is valuable
    if (generatedImages.length === 0) {
      console.error('All image generation attempts failed:', errors);
      return new Response(JSON.stringify({
        error: `All ${imageSettings.numImages} image generation attempts failed`,
        details: errors,
        images: []
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare successful response
    const result = {
      images: generatedImages,
      total_generated: generatedImages.length,
      requested: imageSettings.numImages,
      generation_time_ms: totalTime,
      ...(errors.length > 0 && { 
        warnings: errors,
        message: `Successfully generated ${generatedImages.length} out of ${imageSettings.numImages} requested images`
      })
    };

    // Return 206 (Partial Content) if some images failed, 200 if all succeeded
    const responseStatus = generatedImages.length === imageSettings.numImages ? 200 : 206;

    return new Response(JSON.stringify(result), {
      status: responseStatus,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Critical error in generate-images function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        details: 'Check function logs for detailed error information',
        images: []
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
