
import React, { useState } from 'react';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CharacterSidebar } from './CharacterSidebar';
import { ArrowLeft, Sparkles, FileText, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Character {
  name: string;
  type: 'human' | 'animal' | 'creature' | 'object';
  description?: string;
  attributes: Record<string, any>;
}

interface StoryInputProps {
  onBack: () => void;
  onGenerateWidgets: (story: string) => void;
}

export const StoryInput: React.FC<StoryInputProps> = ({ onBack, onGenerateWidgets }) => {
  const [story, setStory] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleExtractCharacters = async () => {
    if (!story.trim()) {
      toast({
        title: "No story provided",
        description: "Please enter a story before generating widgets.",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-characters', {
        body: { story: story.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setCharacters(data.characters || []);
      
      toast({
        title: "Characters extracted!",
        description: `Found ${data.characters?.length || 0} characters in your story.`
      });
    } catch (error: any) {
      console.error('Error extracting characters:', error);
      toast({
        title: "Character extraction failed",
        description: error.message || "Failed to analyze story for characters.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = () => {
    if (story.trim()) {
      setIsLoading(true);
      // Simulate processing
      setTimeout(() => {
        setIsLoading(false);
        onGenerateWidgets(story);
      }, 2000);
    }
  };

  const handleCharacterUpdate = (index: number, updatedCharacter: Character) => {
    const newCharacters = [...characters];
    newCharacters[index] = updatedCharacter;
    setCharacters(newCharacters);
  };

  const exampleStory = `In the mystical realm of Aethermoor, Princess Luna discovered an ancient crystal that pulsed with otherworldly energy. Her loyal companion, a silver wolf named Asher, sensed danger approaching. The evil sorcerer Malachar had been searching for this very artifact for centuries, and now his dark magic grew stronger with each passing moment. Luna knew she had to protect her kingdom, but she would need the help of her childhood friend Marcus, a brave knight with a mysterious past.`;

  return (
    <Layout showSidebar={true} currentView="create">
      <div className="flex min-h-screen">
        {/* Character Sidebar */}
        <CharacterSidebar 
          characters={characters}
          loading={isExtracting}
          onCharacterUpdate={handleCharacterUpdate}
        />

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-sky-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">Create New Story</h1>
              <p className="text-gray-600">Step 1 of 3: Enter your story</p>
            </div>
          </div>

          {/* Story Input */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Your Story</h2>
                    <p className="text-sm text-gray-600">Paste or write your story below</p>
                  </div>
                </div>
                
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Input Story Here..."
                  className="w-full h-96 p-4 border border-gray-200 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    {story.length} characters • {story.split(' ').filter(word => word.length > 0).length} words
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStory(exampleStory)}
                      className="text-sky-500 border-sky-200 hover:bg-sky-50"
                    >
                      Try Example
                    </Button>
                    
                    <Button
                      onClick={handleExtractCharacters}
                      disabled={!story.trim() || isExtracting}
                      className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isExtracting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          Generate Widgets
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={!story.trim() || isLoading}
                      className="bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 text-white px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Continue
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tips Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Tips for Better Results</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-sky-500">•</span>
                    <span>Include character descriptions in your story</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-sky-500">•</span>
                    <span>Mention physical attributes, clothing, and personality traits</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-sky-500">•</span>
                    <span>Use character names consistently throughout</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-sky-500">•</span>
                    <span>Include animals, creatures, or objects you want visualized</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
                <div className="text-center">
                  <Users className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Character Widgets</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click "Generate Widgets" to automatically extract characters from your story and create customizable attribute forms.
                  </p>
                  {characters.length > 0 && (
                    <div className="text-sm text-emerald-600 font-medium">
                      {characters.length} characters detected!
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
