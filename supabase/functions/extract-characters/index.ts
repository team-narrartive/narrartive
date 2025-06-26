
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
    const { story } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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
    `;

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
            content: 'You are an expert at analyzing stories and extracting character information. Return only valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API request failed');
    }

    const content = data.choices[0].message.content;
    console.log('OpenAI response:', content);
    
    // Parse the JSON response
    let characters: Character[] = [];
    try {
      characters = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback: try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        characters = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse character data from AI response');
      }
    }

    return new Response(JSON.stringify({ characters }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-characters function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      characters: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
