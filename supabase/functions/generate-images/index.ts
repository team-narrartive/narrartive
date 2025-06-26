
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { story, characters } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing story for image generation...');

    // Determine number of images based on word count
    const wordCount = story.split(' ').filter((word: string) => word.length > 0).length;
    let numImages = 1;
    
    if (wordCount > 200) numImages = 2;
    if (wordCount > 500) numImages = 3;
    if (wordCount > 1000) numImages = 4;
    
    // Cap at 4 images maximum
    numImages = Math.min(numImages, 4);

    console.log(`Generating ${numImages} images for story with ${wordCount} words`);

    const images: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < numImages; i++) {
      // Create a detailed prompt for each image
      let prompt = `Create a detailed, high-quality illustration for scene ${i + 1} of this story: "${story}"\n\n`;
      
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
      
      prompt += "\nStyle: Detailed, vibrant, story illustration style. Focus on bringing the narrative to life with rich colors and engaging composition.";

      try {
        console.log(`Making OpenAI API call for image ${i + 1}...`);
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'high'
          }),
        });

        const data = await response.json();
        console.log(`OpenAI API response for image ${i + 1}:`, { status: response.status, ok: response.ok, data });
        
        if (!response.ok) {
          const errorMessage = data.error?.message || `API call failed with status ${response.status}`;
          console.error(`OpenAI API error for image ${i + 1}:`, data);
          errors.push(`Image ${i + 1}: ${errorMessage}`);
          continue;
        }

        if (data.data && data.data[0] && data.data[0].url) {
          images.push(data.data[0].url);
          console.log(`Successfully generated image ${i + 1}/${numImages}`);
        } else {
          const errorMessage = 'No image URL in response';
          console.error(`Error for image ${i + 1}: ${errorMessage}`, data);
          errors.push(`Image ${i + 1}: ${errorMessage}`);
        }
      } catch (imageError: any) {
        console.error(`Error generating image ${i + 1}:`, imageError);
        errors.push(`Image ${i + 1}: ${imageError.message || 'Unknown error'}`);
      }
    }

    console.log(`Image generation complete. Generated: ${images.length}, Errors: ${errors.length}`);

    // If no images were generated and we have errors, return an error response
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

    // If some images failed but some succeeded, include error details in response
    const response: any = { images };
    if (errors.length > 0) {
      response.warnings = errors;
      response.message = `Generated ${images.length} out of ${numImages} requested images. Some images failed: ${errors.join('; ')}`;
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
