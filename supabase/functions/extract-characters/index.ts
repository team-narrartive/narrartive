
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Extract-characters function called');
    
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please check your Supabase secrets.',
        characters: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        characters: [] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { story } = requestBody;

    // Validate story input
    if (!story || typeof story !== 'string' || story.trim().length === 0) {
      console.error('Invalid or empty story provided');
      return new Response(JSON.stringify({ 
        error: 'Story is required and cannot be empty',
        characters: [] 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing story for character extraction (${story.length} characters)`);

    // Create the prompt for character extraction
    const prompt = `Analyze this story and extract ALL main characters (humans, animals, creatures, objects that play important roles). Return ONLY a valid JSON array with no additional text.

Story: "${story.trim()}"

Return format:
[
  {
    "name": "character name",
    "type": "human|animal|creature|object",
    "description": "brief description",
    "attributes": {
      "appearance": "physical description",
      "personality": "character traits",
      "role": "role in story"
    }
  }
]

Rules:
- Return ONLY the JSON array, no markdown, no explanations
- Include main characters that actively participate in the story
- Use exact types: human, animal, creature, or object
- Keep descriptions concise but informative`;

    console.log('Making OpenAI API request...');

    // Make the OpenAI API call
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert story analyzer. Return only valid JSON arrays for character extraction. Never include markdown formatting or explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    console.log(`OpenAI API responded with status: ${openAIResponse.status}`);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error (${openAIResponse.status}): ${errorText}`,
        characters: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', openAIData);
      return new Response(JSON.stringify({ 
        error: 'Invalid response structure from OpenAI',
        characters: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = openAIData.choices[0].message.content;
    console.log('OpenAI response content received:', content?.substring(0, 200) + '...');
    
    // Parse and validate the characters
    let characters: Character[] = [];
    
    try {
      // Clean the content - remove any markdown formatting
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Try to find JSON array in the content
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      console.log('Attempting to parse cleaned content:', cleanContent.substring(0, 100) + '...');
      
      characters = JSON.parse(cleanContent);
      
      // Validate that it's an array
      if (!Array.isArray(characters)) {
        throw new Error('Response is not an array');
      }
      
      // Validate and filter characters
      characters = characters.filter(char => {
        if (!char || typeof char !== 'object') return false;
        if (!char.name || typeof char.name !== 'string' || char.name.trim() === '') return false;
        if (!['human', 'animal', 'creature', 'object'].includes(char.type)) return false;
        
        // Ensure attributes is an object
        if (!char.attributes || typeof char.attributes !== 'object') {
          char.attributes = {};
        }
        
        return true;
      });
      
      console.log(`Successfully extracted and validated ${characters.length} characters`);
      
    } catch (parseError) {
      console.error('Failed to parse character data:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      return new Response(JSON.stringify({ 
        error: 'Could not parse character data from AI response. Please try again.',
        characters: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return successful response
    return new Response(JSON.stringify({ 
      characters,
      message: `Successfully extracted ${characters.length} characters`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error('Unexpected error in extract-characters function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
      characters: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
