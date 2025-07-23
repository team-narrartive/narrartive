import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
const API_TIMEOUT = 45000; // 45 seconds per request (reduced)
const RETRY_ATTEMPTS = 2; // Reduced retries
const RETRY_DELAY = 1000; // 1 second

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Optimized character description function
    const formatCharacterDescription = (char: Character): string => {
      if (!char?.name) return '';
      
      let description = char.name;
      
      // Only include the most important attributes to keep prompt concise
      if (char.attributes && Object.keys(char.attributes).length > 0) {
        const importantAttrs = Object.entries(char.attributes)
          .filter(([_, value]) => value && value !== "Not described" && value.toString().trim())
          .slice(0, 6) // Limit to 6 most important attributes
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        
        if (importantAttrs) {
          description += ` (${importantAttrs})`;
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

            // Make API call with timeout handling
            const imageData = await retryWithBackoff(async () => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => {
                controller.abort();
                console.log(`API timeout for image ${i + 1} after ${API_TIMEOUT}ms`);
              }, API_TIMEOUT);
              
              try {
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
                  }),
                  signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                  throw new Error(`OpenAI API error: ${errorMessage}`);
                }

                const data = await response.json();
                
                // Handle gpt-image-1 response format
                if (!data.data?.[0]) {
                  throw new Error('No image data received from OpenAI API');
                }

                const imageItem = data.data[0];
                
                // gpt-image-1 returns base64 by default
                if (imageItem.b64_json) {
                  return `data:image/png;base64,${imageItem.b64_json}`;
                } else if (imageItem.url) {
                  return imageItem.url;
                } else {
                  throw new Error('No valid image data format in response');
                }
                
              } catch (error) {
                clearTimeout(timeoutId);
                throw error;
              }
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
