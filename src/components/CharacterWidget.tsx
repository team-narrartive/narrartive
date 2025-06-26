
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Cat, Sparkles, Edit, Plus, X } from 'lucide-react';

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

const getEssentialAttributes = (type: string) => {
  switch (type) {
    case 'human':
      return {
        'Hair Color': '',
        'Eye Color': '',
        'Skin Tone': '',
        'Age': '',
        'Height': '',
        'Clothing Style': '',
        'Facial Expression': '',
        'Gender': ''
      };
    case 'animal':
      return {
        'Animal Type': '',
        'Fur/Feather Color': '',
        'Size': '',
        'Eye Color': '',
        'Breed': '',
        'Pose': '',
        'Facial Expression': '',
        'Accessories': ''
      };
    case 'creature':
      return {
        'Creature Type': '',
        'Size': '',
        'Color': '',
        'Special Features': '',
        'Magical Properties': '',
        'Eyes': '',
        'Pose': '',
        'Aura': ''
      };
    default: // objects
      return {
        'Object Type': '',
        'Color': '',
        'Size': '',
        'Material': '',
        'Condition': '',
        'Shape': '',
        'Special Features': '',
        'Age/Era': ''
      };
  }
};

export const CharacterWidget: React.FC<CharacterWidgetProps> = ({ character, onUpdate }) => {
  const [attributes, setAttributes] = useState(() => {
    const defaultAttrs = getEssentialAttributes(character.type);
    return { ...defaultAttrs, ...character.attributes };
  });
  
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);

  const handleAttributeChange = (key: string, value: string) => {
    const newAttributes = { ...attributes, [key]: value };
    setAttributes(newAttributes);
    onUpdate({ ...character, attributes: newAttributes });
  };

  const handleAddCustomAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      const newAttributes = { ...attributes, [newAttributeKey.trim()]: newAttributeValue.trim() };
      setAttributes(newAttributes);
      onUpdate({ ...character, attributes: newAttributes });
      setNewAttributeKey('');
      setNewAttributeValue('');
      setIsAddingAttribute(false);
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const newAttributes = { ...attributes };
    delete newAttributes[key];
    setAttributes(newAttributes);
    onUpdate({ ...character, attributes: newAttributes });
  };

  const filledAttributes = Object.entries(attributes).filter(([_, value]) => value && value.trim()).length;

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
          <DialogContent className="max-w-2xl max-h-[80vh] p-0">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center space-x-2">
                {getCharacterIcon(character.type)}
                <span>{character.name}</span>
                <span className="text-sm font-normal text-gray-500 capitalize">({character.type})</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="px-6 pb-6">
              {character.description && (
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg mt-1">{character.description}</p>
                </div>
              )}
              
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-gray-800">Character Attributes</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingAttribute(true)}
                      className="text-sky-600 border-sky-200 hover:bg-sky-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Custom
                    </Button>
                  </div>
                  
                  {/* Custom Attribute Input */}
                  {isAddingAttribute && (
                    <Card className="p-4 bg-sky-50 border-sky-200">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Attribute Name</Label>
                          <Input
                            value={newAttributeKey}
                            onChange={(e) => setNewAttributeKey(e.target.value)}
                            placeholder="e.g., Tattoo, Scar, Favorite Color"
                            className="mt-1 mx-2 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Value</Label>
                          <Input
                            value={newAttributeValue}
                            onChange={(e) => setNewAttributeValue(e.target.value)}
                            placeholder="Enter the attribute value"
                            className="mt-1 mx-2 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={handleAddCustomAttribute}
                            disabled={!newAttributeKey.trim() || !newAttributeValue.trim()}
                            className="bg-sky-500 hover:bg-sky-600"
                          >
                            Add Attribute
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingAttribute(false);
                              setNewAttributeKey('');
                              setNewAttributeValue('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {/* Attribute Grid with improved padding */}
                  <div className="grid grid-cols-2 gap-4 px-2">
                    {Object.entries(attributes).map(([key, value]) => {
                      const isCustomAttribute = !getEssentialAttributes(character.type).hasOwnProperty(key);
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${character.name}-${key}`} className="text-sm font-medium text-gray-700">
                              {key}
                            </Label>
                            {isCustomAttribute && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAttribute(key)}
                                className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <Input
                            id={`${character.name}-${key}`}
                            value={value || ''}
                            onChange={(e) => handleAttributeChange(key, e.target.value)}
                            className="h-9 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 border-gray-300 mx-1"
                            placeholder={`Enter ${key.toLowerCase()}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="text-xs text-gray-600 mb-2 capitalize flex items-center justify-between">
        <span>{character.type}</span>
        <span className="text-emerald-600 font-medium">{filledAttributes} filled</span>
      </div>
      
      {character.description && (
        <p className="text-xs text-gray-700 line-clamp-2 mb-2">{character.description}</p>
      )}
      
      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {filledAttributes} of {Object.keys(attributes).length} attributes
        </div>
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${(filledAttributes / Object.keys(attributes).length) * 100}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};
