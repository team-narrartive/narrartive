
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
    console.log('Starting extract-characters function...');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        characters: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json().catch(err => {
      console.error('Failed to parse request body:', err);
      throw new Error('Invalid request body');
    });

    const { story } = requestBody;

    if (!story || typeof story !== 'string' || !story.trim()) {
      console.error('No story provided or story is empty');
      return new Response(JSON.stringify({ 
        error: 'Story is required and cannot be empty',
        characters: [] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing story for character extraction, story length:', story.length);

    const prompt = `
    Analyze the following story and extract all main characters (humans, animals, creatures, objects) with their descriptions and attributes.

    Story: "${story}"

    Please return a JSON array with characters in this format:
    [
      {
        "name": "character name",
        "type": "human|animal|creature|object",
        "description": "brief description from the story",
        "attributes": {
          "key physical traits or characteristics mentioned in the story"
        }
      }
    ]

    Focus on main characters that are actively involved in the story. Include both explicit descriptions and implied characteristics.
    Return only valid JSON, no additional text or formatting.
    `;

    console.log('Making OpenAI API call...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at analyzing stories and extracting character information. Return only valid JSON array format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status} - ${errorText}`,
        characters: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from OpenAI API',
        characters: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = data.choices[0].message.content;
    console.log('OpenAI response content:', content);
    
    // Parse the JSON response
    let characters: Character[] = [];
    try {
      // Try to parse the content directly
      characters = JSON.parse(content);
      
      // Validate that it's an array
      if (!Array.isArray(characters)) {
        throw new Error('Response is not an array');
      }
      
      // Validate character structure
      characters = characters.filter(char => 
        char && 
        typeof char === 'object' &&
        typeof char.name === 'string' &&
        char.name.trim() !== '' &&
        ['human', 'animal', 'creature', 'object'].includes(char.type)
      );
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.log('Raw content:', content);
      
      // Fallback: try to extract JSON from the response
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          characters = JSON.parse(jsonMatch[0]);
          if (!Array.isArray(characters)) {
            throw new Error('Extracted content is not an array');
          }
        } else {
          throw new Error('No JSON array found in response');
        }
      } catch (fallbackError) {
        console.error('Fallback JSON parsing failed:', fallbackError);
        return new Response(JSON.stringify({ 
          error: 'Could not parse character data from AI response',
          characters: [] 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Successfully extracted characters:', characters.length);

    return new Response(JSON.stringify({ characters }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error('Error in extract-characters function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      characters: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
