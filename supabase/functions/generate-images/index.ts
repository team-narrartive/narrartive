
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
  instructions?: string;
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
    console.log('Characters with attributes:', characters);

    // Use settings from the request, with fallback to automatic calculation
    const imageSettings: ImageSettings = settings || {
      numImages: Math.min(Math.max(1, Math.floor(story.split(' ').length / 200)), 4),
      quality: 'medium',
      style: 'realistic'
    };

    console.log(`Generating ${imageSettings.numImages} images with ${imageSettings.quality} quality and ${imageSettings.style} style using gpt-image-1`);

    const images: string[] = [];
    const errors: string[] = [];

    // Map quality to gpt-image-1 parameters
    const qualityMap = {
      low: 'low',
      medium: 'medium', 
      high: 'high'
    };

    // Enhanced style prompts for better accuracy
    const stylePrompts = {
      realistic: 'photorealistic style, professional photography, highly detailed, natural lighting, crisp sharp details',
      artistic: 'artistic painted style, expressive brushstrokes, rich vibrant colors, creative artistic interpretation',
      cartoon: 'cartoon animated style, vibrant bright colors, clean character designs, playful cartoon illustration'
    };

    // Helper function to format character attributes into detailed descriptions
    const formatCharacterDescription = (char: Character): string => {
      let description = `${char.name} (${char.type})`;
      
      if (char.description) {
        description += `: ${char.description}`;
      }

      const attributes = Object.entries(char.attributes)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => {
          // Handle different attribute types
          if (typeof value === 'object' && value !== null) {
            return `${key}: ${JSON.stringify(value)}`;
          }
          return `${key}: ${value}`;
        });

      if (attributes.length > 0) {
        description += `. Physical and descriptive attributes: ${attributes.join(', ')}`;
      }

      return description;
    };

    for (let i = 0; i < imageSettings.numImages; i++) {
      // Start with style specification for better adherence
      let prompt = `${stylePrompts[imageSettings.style].toUpperCase()}.\n\n`;
      
      // CRITICAL: Ensure single scene composition
      prompt += `CREATE A SINGLE FOCUSED SCENE - NOT A COLLAGE OR MULTIPLE SCENES COMBINED.\n\n`;
      
      // Add story context with scene focus
      prompt += `Focus on scene ${i + 1} from this story: "${story}"\n\n`;
      
      // Add character specifications if available with detailed attributes
      if (characters && characters.length > 0) {
        prompt += "IMPORTANT - Include these characters with ALL their specified attributes:\n";
        characters.forEach((char: Character, index: number) => {
          const characterDesc = formatCharacterDescription(char);
          prompt += `- ${characterDesc}\n`;
        });
        prompt += "\nEnsure ALL character attributes (appearance, clothing, accessories, etc.) are clearly visible and accurate in the image.\n\n";
      }
      
      // Add user instructions if provided
      if (imageSettings.instructions && imageSettings.instructions.trim()) {
        prompt += `Additional requirements: ${imageSettings.instructions.trim()}\n\n`;
      }
      
      // Final composition note with single scene emphasis
      prompt += `Create this as ONE SINGLE ${imageSettings.style} style scene with high quality details. Do NOT create a collage or multiple scenes. Focus on one moment from the story.`;

      console.log(`Generated detailed prompt for image ${i + 1}:`, prompt);

      try {
        console.log(`Making OpenAI API call for image ${i + 1} with gpt-image-1...`);
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: prompt,
            size: '1024x1024',
            quality: qualityMap[imageSettings.quality],
            output_format: 'png'
          }),
        });

        const data = await response.json();
        console.log(`OpenAI API response for image ${i + 1}:`, { 
          status: response.status, 
          ok: response.ok,
          model: 'gpt-image-1',
          quality: qualityMap[imageSettings.quality]
        });
        
        if (!response.ok) {
          const errorMessage = data.error?.message || `API call failed with status ${response.status}`;
          console.error(`OpenAI API error for image ${i + 1}:`, data);
          errors.push(`Image ${i + 1}: ${errorMessage}`);
          continue;
        }

        // Handle gpt-image-1 response (returns base64 by default)
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
            console.log(`Successfully generated image ${i + 1}/${imageSettings.numImages} with detailed character attributes and user instructions`);
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

    console.log(`Image generation complete with detailed character attributes and user instructions. Generated: ${images.length}, Errors: ${errors.length}`);

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
