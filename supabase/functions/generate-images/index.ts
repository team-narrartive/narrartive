
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { story, characters, settings } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing story for image generation with settings:', settings);

    // Use settings from the request, with fallback to automatic calculation
    const imageSettings: ImageSettings = settings || {
      numImages: Math.min(Math.max(1, Math.floor(story.split(' ').length / 200)), 4),
      quality: 'medium',
      style: 'realistic'
    };

    console.log(`Generating ${imageSettings.numImages} images with ${imageSettings.quality} quality and ${imageSettings.style} style`);

    const images: string[] = [];
    const errors: string[] = [];

    // Map quality to OpenAI parameters
    const qualityMap = {
      low: 'standard',
      medium: 'standard', 
      high: 'hd'
    };

    // Map style to prompt modifications
    const stylePrompts = {
      realistic: 'photorealistic, detailed, cinematic lighting',
      artistic: 'artistic illustration, painterly style, creative interpretation',
      cartoon: 'cartoon style, animated, colorful and playful'
    };

    for (let i = 0; i < imageSettings.numImages; i++) {
      let prompt = `Create a ${stylePrompts[imageSettings.style]} illustration for scene ${i + 1} of this story: "${story}"\n\n`;
      
      // Add character descriptions
      if (characters && characters.length > 0) {
        prompt += "Characters in the scene:\n";
        characters.forEach((char: Character) => {
          const filledAttributes = Object.entries(char.attributes)
            .filter(([_, value]) => value && value.toString().trim())
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          
          if (filledAttributes) {
            prompt += `- ${char.name} (${char.type}): ${filledAttributes}\n`;
          } else if (char.description) {
            prompt += `- ${char.name} (${char.type}): ${char.description}\n`;
          }
        });
      }
      
      prompt += `\nStyle: ${stylePrompts[imageSettings.style]}. Focus on bringing the narrative to life with rich colors and engaging composition.`;

      try {
        console.log(`Making OpenAI API call for image ${i + 1}...`);
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: qualityMap[imageSettings.quality]
          }),
        });

        const data = await response.json();
        console.log(`OpenAI API response for image ${i + 1}:`, { status: response.status, ok: response.ok });
        
        if (!response.ok) {
          const errorMessage = data.error?.message || `API call failed with status ${response.status}`;
          console.error(`OpenAI API error for image ${i + 1}:`, data);
          errors.push(`Image ${i + 1}: ${errorMessage}`);
          continue;
        }

        // Handle both URL and base64 responses
        if (data.data && data.data[0]) {
          const imageData = data.data[0];
          let imageUrl = '';
          
          if (imageData.url) {
            imageUrl = imageData.url;
          } else if (imageData.b64_json) {
            imageUrl = `data:image/png;base64,${imageData.b64_json}`;
          }
          
          if (imageUrl) {
            images.push(imageUrl);
            console.log(`Successfully generated image ${i + 1}/${imageSettings.numImages}`);
          } else {
            const errorMessage = 'No image URL or base64 data in response';
            console.error(`Error for image ${i + 1}: ${errorMessage}`, data);
            errors.push(`Image ${i + 1}: ${errorMessage}`);
          }
        } else {
          const errorMessage = 'No image data in response';
          console.error(`Error for image ${i + 1}: ${errorMessage}`, data);
          errors.push(`Image ${i + 1}: ${errorMessage}`);
        }
      } catch (imageError: any) {
        console.error(`Error generating image ${i + 1}:`, imageError);
        errors.push(`Image ${i + 1}: ${imageError.message || 'Unknown error'}`);
      }
    }

    console.log(`Image generation complete. Generated: ${images.length}, Errors: ${errors.length}`);

    if (images.length === 0 && errors.length > 0) {
      return new Response(JSON.stringify({ 
        error: `Failed to generate images: ${errors.join('; ')}`,
        images: [],
        details: errors
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response: any = { images };
    if (errors.length > 0) {
      response.warnings = errors;
      response.message = `Generated ${images.length} out of ${imageSettings.numImages} requested images. Some images failed: ${errors.join('; ')}`;
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in generate-images function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      images: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
