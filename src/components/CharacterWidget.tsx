
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Cat, Sparkles, Edit } from 'lucide-react';

interface Character {
  name: string;
  type: 'human' | 'animal' | 'creature' | 'object';
  description?: string;
  attributes: Record<string, any>;
}

interface CharacterWidgetProps {
  character: Character;
  onUpdate: (updatedCharacter: Character) => void;
}

const getCharacterIcon = (type: string) => {
  switch (type) {
    case 'human':
      return <User className="w-4 h-4" />;
    case 'animal':
      return <Cat className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const getDefaultAttributes = (type: string) => {
  switch (type) {
    case 'human':
      return {
        'Hair Color': '',
        'Eye Color': '',
        'Shirt Color': '',
        'Pants Color': '',
        'Age': '',
        'Gender': '',
        'Ethnicity': '',
        'Height': '',
        'Build': ''
      };
    case 'animal':
      return {
        'Species': '',
        'Fur/Skin Color': '',
        'Size': '',
        'Distinctive Markings': '',
        'Age': '',
        'Breed': ''
      };
    default:
      return {
        'Color': '',
        'Size': '',
        'Material': '',
        'Shape': '',
        'Special Properties': ''
      };
  }
};

export const CharacterWidget: React.FC<CharacterWidgetProps> = ({ character, onUpdate }) => {
  const [attributes, setAttributes] = useState(() => {
    const defaultAttrs = getDefaultAttributes(character.type);
    return { ...defaultAttrs, ...character.attributes };
  });

  const handleAttributeChange = (key: string, value: string) => {
    const newAttributes = { ...attributes, [key]: value };
    setAttributes(newAttributes);
    onUpdate({ ...character, attributes: newAttributes });
  };

  return (
    <Card className="p-3 bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getCharacterIcon(character.type)}
          <h3 className="font-semibold text-sm text-gray-900">{character.name}</h3>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Edit className="w-3 h-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getCharacterIcon(character.type)}
                <span>{character.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {character.description && (
                <div>
                  <Label className="text-xs font-medium text-gray-600">Description</Label>
                  <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{character.description}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Character Attributes</Label>
                {Object.entries(attributes).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`${character.name}-${key}`} className="text-xs text-gray-600">
                      {key}
                    </Label>
                    <Input
                      id={`${character.name}-${key}`}
                      value={value || ''}
                      onChange={(e) => handleAttributeChange(key, e.target.value)}
                      className="h-8 text-sm"
                      placeholder={`Enter ${key.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="text-xs text-gray-600 mb-2 capitalize">
        {character.type}
      </div>
      
      {character.description && (
        <p className="text-xs text-gray-700 line-clamp-2">{character.description}</p>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        {Object.entries(attributes).filter(([_, value]) => value).length} attributes filled
      </div>
    </Card>
  );
};
