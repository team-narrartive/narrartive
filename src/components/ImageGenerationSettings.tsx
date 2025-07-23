
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Settings } from 'lucide-react';

interface ImageGenerationSettings {
  numImages: number;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'artistic' | 'cartoon';
  instructions?: string;
}

interface ImageGenerationSettingsProps {
  settings: ImageGenerationSettings;
  onSettingsChange: (settings: ImageGenerationSettings) => void;
}

export const ImageGenerationSettingsComponent: React.FC<ImageGenerationSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const handleNumImagesChange = (value: number[]) => {
    onSettingsChange({ ...settings, numImages: value[0] });
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    onSettingsChange({ ...settings, quality });
  };

  const handleStyleChange = (style: 'realistic' | 'artistic' | 'cartoon') => {
    onSettingsChange({ ...settings, style });
  };

  const handleInstructionsChange = (instructions: string) => {
    onSettingsChange({ ...settings, instructions });
  };

  return (
    <Card className="p-6 bg-white border border-border rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Image Generation Settings</h2>
          <p className="text-sm text-gray-600">Customize your image generation preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Number of Images */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Number of Images: {settings.numImages}
          </Label>
          <Slider
            value={[settings.numImages]}
            onValueChange={handleNumImagesChange}
            max={6}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span>6</span>
          </div>
        </div>

        {/* Quality Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Image Quality</Label>
          <Select value={settings.quality} onValueChange={handleQualityChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Quality (Fast)</SelectItem>
              <SelectItem value="medium">Medium Quality (Balanced)</SelectItem>
              <SelectItem value="high">High Quality (Best)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Art Style</Label>
          <Select value={settings.style} onValueChange={handleStyleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realistic">Realistic</SelectItem>
              <SelectItem value="artistic">Artistic</SelectItem>
              <SelectItem value="cartoon">Cartoon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Instructions */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Additional Instructions (Optional)
        </Label>
        <Textarea
          value={settings.instructions || ''}
          onChange={(e) => handleInstructionsChange(e.target.value)}
          placeholder="Describe specific scenes, settings, or context you want in the images..."
          className="min-h-[80px] resize-none"
        />
        <p className="text-xs text-gray-500">
          These instructions will be added to your story and character details to create more accurate images.
        </p>
      </div>
    </Card>
  );
};
