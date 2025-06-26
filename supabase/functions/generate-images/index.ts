
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
            quality: 'standard'
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('OpenAI API error for image', i + 1, ':', data);
          continue; // Skip this image but continue with others
        }

        if (data.data && data.data[0] && data.data[0].url) {
          images.push(data.data[0].url);
          console.log(`Generated image ${i + 1}/${numImages}`);
        }
      } catch (imageError) {
        console.error(`Error generating image ${i + 1}:`, imageError);
        // Continue with other images even if one fails
      }
    }

    console.log(`Successfully generated ${images.length} images`);

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-images function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      images: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
