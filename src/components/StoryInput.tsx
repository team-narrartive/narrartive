import React, { useState } from 'react';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CharacterSidebar } from './CharacterSidebar';
import { EnhancedGeneratedImages } from './EnhancedGeneratedImages';
import { ImageGenerationSettingsComponent } from './ImageGenerationSettings';
import { SpinningCatLoader } from './SpinningCatLoader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Users, Image, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStorySaving } from '@/hooks/useStorySaving';

interface Character {
  name: string;
  type: 'human' | 'animal' | 'creature' | 'object';
  description?: string;
  attributes: Record<string, any>;
}

interface ImageGenerationSettings {
  numImages: number;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'artistic' | 'cartoon';
  instructions?: string;
}

interface ImageVersion {
  id: string;
  images: string[];
  created_at: string;
  settings: ImageGenerationSettings;
}

interface StoryInputProps {
  onBack: () => void;
  onGenerateWidgets: (story: string) => void;
}

export const StoryInput: React.FC<StoryInputProps> = ({ onBack, onGenerateWidgets }) => {
  const [story, setStory] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [imageVersions, setImageVersions] = useState<ImageVersion[]>([]);
  const [isExtractingCharacters, setIsExtractingCharacters] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [hasGeneratedWidgets, setHasGeneratedWidgets] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [imageSettings, setImageSettings] = useState<ImageGenerationSettings>({
    numImages: 3,
    quality: 'medium',
    style: 'realistic',
    instructions: ''
  });
  
  const { toast } = useToast();
  const { saveStory, isSaving } = useStorySaving();

  const handleExtractCharacters = async () => {
    if (!story.trim()) {
      toast({
        title: "No story provided",
        description: "Please enter a story before generating widgets.",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting character extraction...');
    setIsExtractingCharacters(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-characters', {
        body: { story: story.trim() }
      });

      console.log('Character extraction response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      const extractedCharacters = data.characters || [];
      console.log('Setting characters:', extractedCharacters);
      setCharacters(extractedCharacters);
      setHasGeneratedWidgets(true);
      
      toast({
        title: "Characters extracted!",
        description: `Found ${extractedCharacters.length} characters in your story.`
      });
    } catch (error: any) {
      console.error('Error extracting characters:', error);
      toast({
        title: "Character extraction failed",
        description: error.message || "Failed to analyze story for characters.",
        variant: "destructive"
      });
    } finally {
      setIsExtractingCharacters(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!story.trim()) {
      toast({
        title: "No story provided",
        description: "Please enter a story before generating images.",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting image generation with settings:', imageSettings);
    setIsGeneratingImages(true);
    setImageGenerationError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-images', {
        body: { 
          story: story.trim(),
          characters: characters,
          settings: imageSettings
        }
      });

      console.log('Image generation response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Function returned error:', data.error);
        setImageGenerationError(data.error);
        throw new Error(data.error);
      }

      const images = data.images || [];
      console.log('Setting images:', images);
      
      // Create new image version
      const newVersion: ImageVersion = {
        id: `version-${Date.now()}`,
        images,
        created_at: new Date().toISOString(),
        settings: imageSettings
      };
      
      setImageVersions(prev => [...prev, newVersion]);
      
      toast({
        title: "Images generated!",
        description: `Created ${images.length} AI-generated images from your story.`
      });
    } catch (error: any) {
      console.error('Error generating images:', error);
      const errorMessage = error.message || "Failed to generate images from your story.";
      setImageGenerationError(errorMessage);
      toast({
        title: "Image generation failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleCharacterUpdate = (index: number, updatedCharacter: Character) => {
    const newCharacters = [...characters];
    newCharacters[index] = updatedCharacter;
    setCharacters(newCharacters);
  };

  const handleSaveStory = async () => {
    if (!storyTitle.trim() || !storyDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and description.",
        variant: "destructive"
      });
      return;
    }

    const savedStory = await saveStory({
      title: storyTitle,
      description: storyDescription,
      storyContent: story,
      imageVersions,
      isPublic: false
    });

    if (savedStory) {
      setShowSaveDialog(false);
      toast({
        title: "Success! 🎉",
        description: "Your story has been saved and is now available in My Projects."
      });
    }
  };

  const exampleStory = `In the mystical realm of Aethermoor, Princess Luna discovered an ancient crystal that pulsed with otherworldly energy. Her loyal companion, a silver wolf named Asher, sensed danger approaching. The evil sorcerer Malachar had been searching for this very artifact for centuries, and now his dark magic grew stronger with each passing moment. Luna knew she had to protect her kingdom, but she would need the help of her childhood friend Marcus, a brave knight with a mysterious past.`;

  const shouldShowRightSidebar = imageVersions.length === 0 && !isGeneratingImages;
  const hasImages = imageVersions.length > 0;

  return (
    <>
      {/* Spinning Cat Loader - Full screen overlay */}
      <SpinningCatLoader 
        isVisible={isGeneratingImages} 
        message="Creating magical images from your story... 🎨✨"
      />
      
      <Layout showSidebar={true} currentView="create" onBack={onBack}>
        <div className="flex min-h-screen">
          {/* Character Sidebar */}
          <CharacterSidebar 
            characters={characters}
            loading={isExtractingCharacters}
            onCharacterUpdate={handleCharacterUpdate}
          />

          {/* Main Content */}
          <div className={`flex-1 space-y-6 p-6 ${shouldShowRightSidebar ? 'max-w-4xl mx-auto' : ''}`}>
            {/* Save Button - Top Right */}
            {hasImages && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Project
                </Button>
              </div>
            )}

            {/* Persistent Error Message */}
            {imageGenerationError && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Image generation failed</h3>
                    <p className="text-red-700 text-sm">{imageGenerationError}</p>
                    <p className="text-red-600 text-xs mt-2">This error will persist until you try generating images again.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Image Generation Settings - Show after widgets are generated */}
            {hasGeneratedWidgets && (
              <>
                <ImageGenerationSettingsComponent
                  settings={imageSettings}
                  onSettingsChange={setImageSettings}
                />
                
                {/* Generate Images Button - Prominently placed */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleGenerateImages}
                    disabled={!story.trim() || isGeneratingImages}
                    size="lg"
                    className="bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isGeneratingImages ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Generating Images...
                      </>
                    ) : (
                      <>
                        <Image className="w-5 h-5 mr-3" />
                        Generate Images
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Story Input */}
            <div className={`grid ${shouldShowRightSidebar ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
              <div className={shouldShowRightSidebar ? 'lg:col-span-2' : ''}>
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
                  
                  <div className="mt-6 space-y-4">
                    <div className="text-sm text-gray-500 text-center">
                      {story.length} characters • {story.split(' ').filter(word => word.length > 0).length} words
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStory(exampleStory)}
                        className="text-sky-500 border-sky-200 hover:bg-sky-50 px-6 h-11"
                      >
                        Try Example
                      </Button>
                      
                      {!hasGeneratedWidgets && (
                        <Button
                          onClick={handleExtractCharacters}
                          disabled={!story.trim() || isExtractingCharacters}
                          className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 h-11 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isExtractingCharacters ? (
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
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tips Sidebar - Only show when images haven't been generated */}
              {shouldShowRightSidebar && (
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
              )}
            </div>
          </div>

          {/* Enhanced Generated Images Sidebar */}
          {(imageVersions.length > 0 || isGeneratingImages) && (
            <EnhancedGeneratedImages 
              imageVersions={imageVersions}
              loading={isGeneratingImages}
              story={story}
            />
          )}
        </div>
      </Layout>

      {/* Save Story Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Story Title</label>
              <Input
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="Enter a title for your story"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                value={storyDescription}
                onChange={(e) => setStoryDescription(e.target.value)}
                placeholder="Brief description of your story"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveStory}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Story
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
