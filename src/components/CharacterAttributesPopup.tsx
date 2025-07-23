
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// All attributes are now text inputs for maximum flexibility
const ATTRIBUTE_TEMPLATES: Record<string, string[]> = {
  human: [
    'Hair Color', 'Eye Color', 'Hair Type', 'Facial Hair', 'Age',
    'Skin Tone', 'Ethnicity/Nationality', 'Height', 'Body Type', 'Clothing Style',
    'Shirt Color', 'Pants Color', 'Accessories'
  ],
  animal: [
    'Animal Type', 'Breed', 'Fur/Feather Color', 'Eye Color', 'Size',
    'Distinctive Features', 'Accessories', 'Mood/Expression'
  ],
  creature: [
    'Creature Type', 'Size', 'Color Scheme', 'Special Features', 
    'Magical Abilities', 'Temperament'
  ],
  object: [
    'Object Type', 'Material', 'Color', 'Size', 'Condition', 'Special Properties'
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

  const attributeTemplates = ATTRIBUTE_TEMPLATES[character.type] || [];

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
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(character.type)}`}>
              {character.type.charAt(0).toUpperCase() + character.type.slice(1)}
            </div>
            <span>{character.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Description */}
            {character.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {character.description}
                </p>
              </div>
            )}

            {/* All Attributes as Text Inputs */}
            {attributeTemplates.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Character Attributes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributeTemplates.map((key) => (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{key}</label>
                      <Input
                        value={editedCharacter.attributes[key] || ''}
                        onChange={(e) => handleAttributeChange(key, e.target.value)}
                        placeholder={`Enter ${key.toLowerCase()}`}
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                .filter(([key]) => !attributeTemplates.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                      <span className="font-medium">{key}:</span>
                      <span>{String(value)}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttribute(key)}
                        className="h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                  className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  placeholder="Attribute value"
                  value={customAttributeValue}
                  onChange={(e) => setCustomAttributeValue(e.target.value)}
                  className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button
                  onClick={addCustomAttribute}
                  size="sm"
                  variant="outline"
                  disabled={!customAttributeKey.trim() || !customAttributeValue.trim()}
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Attributes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
