import React, { useState } from 'react';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CharacterSidebar } from './CharacterSidebar';
import { EnhancedGeneratedImages } from './EnhancedGeneratedImages';
import { ImageGenerationSettingsComponent } from './ImageGenerationSettings';
import { SpinningCatLoader } from './SpinningCatLoader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Users, Image, AlertCircle, Save, CheckCircle, ArrowLeft } from 'lucide-react';
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
export const StoryInput: React.FC<StoryInputProps> = ({
  onBack,
  onGenerateWidgets
}) => {
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
  const [isPublic, setIsPublic] = useState(false);
  const [imageSettings, setImageSettings] = useState<ImageGenerationSettings>({
    numImages: 3,
    quality: 'medium',
    style: 'realistic',
    instructions: ''
  });
  const {
    toast
  } = useToast();
  const {
    saveStory,
    isSaving
  } = useStorySaving();
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
      const {
        data,
        error
      } = await supabase.functions.invoke('extract-characters', {
        body: {
          story: story.trim()
        }
      });
      console.log('Character extraction response:', {
        data,
        error
      });
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

    // Validate story length to prevent edge function timeouts
    if (story.length > 8000) {
      toast({
        title: "Story too long",
        description: "Please shorten your story to under 8000 characters for better image generation.",
        variant: "destructive"
      });
      return;
    }

    // Filter characters to reduce payload size and prevent timeouts
    const filteredCharacters = characters.map(char => ({
      name: char.name,
      type: char.type,
      description: char.description,
      attributes: Object.fromEntries(Object.entries(char.attributes).filter(([_, value]) => value !== undefined && value !== null && value !== '').slice(0, 15) // Limit to 15 attributes per character
      )
    }));
    console.log('Starting image generation with settings:', imageSettings);
    console.log('Filtered characters count:', filteredCharacters.length);
    setIsGeneratingImages(true);
    setImageGenerationError(null);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-images', {
        body: {
          story: story.trim(),
          characters: filteredCharacters,
          settings: imageSettings
        }
      });
      console.log('Image generation response:', {
        data,
        error
      });
      if (error) {
        console.error('Supabase function error:', error);
        // More specific error handling
        if (error.message?.includes('timeout') || error.message?.includes('FunctionsNetworkError')) {
          throw new Error('Request timed out. Try with fewer characters or a shorter story.');
        }
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
      let errorMessage = error.message || "Failed to generate images from your story.";

      // Provide helpful error messages
      if (errorMessage.includes('timeout') || errorMessage.includes('FunctionsNetworkError')) {
        errorMessage = "Request timed out. Try reducing story length or character attributes.";
      } else if (errorMessage.includes('Failed to send a request')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
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

    // Close dialog immediately
    setShowSaveDialog(false);

    // Show immediate feedback
    toast({
      title: "Saving your story...",
      description: "Your project is being saved."
    });
    try {
      const savedStory = await saveStory({
        title: storyTitle,
        description: storyDescription,
        storyContent: story,
        imageVersions,
        isPublic: isPublic
      });
      if (savedStory) {
        toast({
          title: "Success! 🎉",
          description: "Your story has been saved successfully."
        });

        // Navigate back to dashboard after successful save
        setTimeout(() => {
          onBack();
        }, 1000);
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your story. Please try again.",
        variant: "destructive"
      });
    }
  };
  const hasImages = imageVersions.length > 0;
  return <>
      {/* Spinning Cat Loader - Full screen overlay */}
      <SpinningCatLoader isVisible={isGeneratingImages} message="Creating magical images from your story... 🎨✨" />
      
      <Layout showSidebar={true} currentView="create" onBack={onBack}>
        <div className="flex min-h-screen">
          {/* Character Sidebar */}
          <CharacterSidebar characters={characters} loading={isExtractingCharacters} onCharacterUpdate={handleCharacterUpdate} />

          {/* Main Content */}
          <div className="flex-1 p-6 transition-all duration-300 max-w-[calc(100%-640px)]">
            {/* Persistent Error Message */}
            {imageGenerationError && <Card className="p-4 bg-red-50 border-red-200 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Image generation failed</h3>
                    <p className="text-red-700 text-sm">{imageGenerationError}</p>
                    <p className="text-red-600 text-xs mt-2">This error will persist until you try generating images again.</p>
                  </div>
                </div>
              </Card>}

            {/* Story Input */}
            <div className="flex items-center justify-start gap-4 mb-6">
              <Button onClick={onBack} variant="outline" className="border-border hover:bg-muted">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-primary">Your Story</h2>
                  <div className="flex items-center space-x-2">
                    <Switch id="privacy-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label htmlFor="privacy-toggle" className="text-sm font-medium text-muted-foreground">
                      {isPublic ? 'Public' : 'Private'}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  {story.length} characters • {story.split(' ').filter(word => word.length > 0).length} words
                </div>
                {hasImages && <Button onClick={() => setShowSaveDialog(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="w-4 h-4 mr-2" />
                    Save Project
                  </Button>}
              </div>
              
              <textarea value={story} onChange={e => setStory(e.target.value)} placeholder="Input Story Here..." className="w-full h-48 p-4 border border-border rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-foreground placeholder-muted-foreground" />
              
              <div className="mt-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {hasGeneratedWidgets ? <Button onClick={handleGenerateImages} disabled={!story.trim() || isGeneratingImages} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-11 shadow-lg hover:shadow-xl transition-all duration-300">
                      {isGeneratingImages ? <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Images...
                        </> : <>
                          <Image className="w-4 h-4 mr-2" />
                          Generate Images
                        </>}
                    </Button> : <Button onClick={handleExtractCharacters} disabled={!story.trim() || isExtractingCharacters} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-11 shadow-lg hover:shadow-xl transition-all duration-300">
                      {isExtractingCharacters ? <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Extracting...
                        </> : <>
                          <Users className="w-4 h-4 mr-2" />
                          Generate Widgets
                        </>}
                    </Button>}
                </div>
              </div>
            </Card>

            {/* Image Generation Settings */}
            {hasGeneratedWidgets && <ImageGenerationSettingsComponent settings={imageSettings} onSettingsChange={setImageSettings} />}
          </div>

          {/* Enhanced Generated Images Sidebar */}
          {(imageVersions.length > 0 || isGeneratingImages) && <EnhancedGeneratedImages imageVersions={imageVersions} loading={isGeneratingImages} story={story} />}
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
              <Input value={storyTitle} onChange={e => setStoryTitle(e.target.value)} placeholder="Enter a title for your story" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input value={storyDescription} onChange={e => setStoryDescription(e.target.value)} placeholder="Brief description of your story" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveStory} disabled={isSaving} className="flex-1">
                {isSaving ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </> : <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Story
                  </>}
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>;
};