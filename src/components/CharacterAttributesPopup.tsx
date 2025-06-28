import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Save } from 'lucide-react';

interface Character {
  name: string;
  type: 'human' | 'animal' | 'creature' | 'object';
  description?: string;
  attributes: Record<string, any>;
}

interface CharacterAttributesPopupProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCharacter: Character) => void;
}

// Only keep dropdown options for attributes that benefit from specific choices
const DROPDOWN_ATTRIBUTES: Record<string, Record<string, string[]>> = {
  human: {
    'Hair Color': ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Auburn', 'Strawberry Blonde'],
    'Eye Color': ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Violet'],
    'Hair Type': ['Straight', 'Wavy', 'Curly', 'Coily', 'Kinky'],
    'Facial Hair': ['Clean-shaven', 'Beard', 'Goatee', 'Mustache', 'Stubble', 'Full Beard'],
    'Age': ['Child (5-12)', 'Teen (13-17)', 'Young Adult (18-25)', 'Adult (26-40)', 'Middle-aged (41-60)', 'Senior (60+)']
  },
  animal: {
    'Animal Type': ['Dog', 'Cat', 'Horse', 'Bird', 'Rabbit', 'Fox', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Other'],
    'Breed': ['Mixed', 'Purebred', 'Unknown'],
    'Eye Color': ['Brown', 'Blue', 'Green', 'Amber', 'Yellow', 'Black'],
    'Size': ['Very Small', 'Small', 'Medium', 'Large', 'Very Large']
  },
  creature: {
    'Creature Type': ['Dragon', 'Fairy', 'Goblin', 'Elf', 'Dwarf', 'Giant', 'Spirit', 'Monster', 'Mythical Beast'],
    'Size': ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Colossal']
  },
  object: {
    'Object Type': ['Weapon', 'Tool', 'Jewelry', 'Furniture', 'Vehicle', 'Clothing', 'Book', 'Container'],
    'Size': ['Tiny', 'Small', 'Medium', 'Large', 'Huge']
  }
};

// Free-text attributes for each type
const TEXT_ATTRIBUTES: Record<string, string[]> = {
  human: [
    'Skin Tone', 'Ethnicity/Nationality', 'Height', 'Body Type', 'Clothing Style',
    'Shirt Color', 'Pants Color', 'Accessories'
  ],
  animal: [
    'Fur/Feather Color', 'Distinctive Features', 'Accessories', 'Mood/Expression'
  ],
  creature: [
    'Color Scheme', 'Special Features', 'Magical Abilities', 'Temperament'
  ],
  object: [
    'Material', 'Color', 'Condition', 'Special Properties'
  ]
};

export const CharacterAttributesPopup: React.FC<CharacterAttributesPopupProps> = ({
  character,
  isOpen,
  onClose,
  onSave
}) => {
  const [editedCharacter, setEditedCharacter] = useState<Character>(character);
  const [customAttributeKey, setCustomAttributeKey] = useState('');
  const [customAttributeValue, setCustomAttributeValue] = useState('');

  const dropdownOptions = DROPDOWN_ATTRIBUTES[character.type] || {};
  const textAttributes = TEXT_ATTRIBUTES[character.type] || [];

  const allPredefinedAttributes = [...Object.keys(dropdownOptions), ...textAttributes];

  const handleAttributeChange = (key: string, value: string) => {
    setEditedCharacter(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }));
  };

  const addCustomAttribute = () => {
    if (customAttributeKey.trim() && customAttributeValue.trim()) {
      handleAttributeChange(customAttributeKey.trim(), customAttributeValue.trim());
      setCustomAttributeKey('');
      setCustomAttributeValue('');
    }
  };

  const removeAttribute = (key: string) => {
    const newAttributes = { ...editedCharacter.attributes };
    delete newAttributes[key];
    setEditedCharacter(prev => ({
      ...prev,
      attributes: newAttributes
    }));
  };

  const handleSave = () => {
    onSave(editedCharacter);
    onClose();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'human': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'animal': return 'bg-green-100 text-green-800 border-green-200';
      case 'creature': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'object': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(character.type)}`}>
              {character.type.charAt(0).toUpperCase() + character.type.slice(1)}
            </div>
            <span>{character.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Description */}
            {character.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {character.description}
                </p>
              </div>
            )}

            {/* Dropdown Attributes */}
            {Object.keys(dropdownOptions).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Select Attributes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(dropdownOptions).map(([key, options]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{key}</label>
                      <Select
                        value={editedCharacter.attributes[key] || ''}
                        onValueChange={(value) => handleAttributeChange(key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${key.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Free Text Attributes */}
            {textAttributes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Describe Attributes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textAttributes.map((key) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{key}</label>
                      <Input
                        value={editedCharacter.attributes[key] || ''}
                        onChange={(e) => handleAttributeChange(key, e.target.value)}
                        placeholder={`Enter ${key.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Custom Attributes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Custom Attributes</h4>
              
              {/* Existing Custom Attributes */}
              {Object.entries(editedCharacter.attributes)
                .filter(([key]) => !allPredefinedAttributes.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="flex items-center gap-2">
                      <span className="font-medium">{key}:</span>
                      <span>{String(value)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttribute(key)}
                        className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}

              {/* Add Custom Attribute */}
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Attribute name"
                  value={customAttributeKey}
                  onChange={(e) => setCustomAttributeKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Attribute value"
                  value={customAttributeValue}
                  onChange={(e) => setCustomAttributeValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={addCustomAttribute}
                  size="sm"
                  variant="outline"
                  disabled={!customAttributeKey.trim() || !customAttributeValue.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Attributes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
