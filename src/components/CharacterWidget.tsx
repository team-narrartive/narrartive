
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Zap } from 'lucide-react';
import { CharacterAttributesPopup } from './CharacterAttributesPopup';

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

export const CharacterWidget: React.FC<CharacterWidgetProps> = ({ character, onUpdate }) => {
  const [showAttributesPopup, setShowAttributesPopup] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'human': return <User className="w-4 h-4" />;
      case 'animal': return <Zap className="w-4 h-4" />;
      case 'creature': return <Zap className="w-4 h-4" />;
      case 'object': return <Zap className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'human': return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'animal': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'creature': return 'bg-violet-50 text-violet-600 border-violet-200';
      case 'object': return 'bg-purple-50 text-purple-600 border-purple-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Count filled attributes
  const filledAttributes = Object.keys(character.attributes).filter(key => {
    const value = character.attributes[key];
    return value !== null && value !== undefined && value !== '';
  }).length;

  // Get total possible attributes based on type
  const getBaseAttributes = (type: string) => {
    switch (type) {
      case 'human': return 12; // Based on HUMAN_ATTRIBUTES count
      case 'animal': return 8;  // Based on ANIMAL_ATTRIBUTES count
      case 'creature': return 6; // Based on CREATURE_ATTRIBUTES count
      case 'object': return 6;   // Based on OBJECT_ATTRIBUTES count
      default: return 8;
    }
  };

  const baseAttributes = getBaseAttributes(character.type);
  // Use the higher of filled attributes or base attributes to avoid confusing display
  const totalAttributes = Math.max(filledAttributes, baseAttributes);

  const handleSaveAttributes = (updatedCharacter: Character) => {
    onUpdate(updatedCharacter);
  };

  return (
    <>
      <Card 
        className="bg-white border border-border rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer mb-4"
        onClick={() => setShowAttributesPopup(true)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(character.type)}`}>
                {getTypeIcon(character.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{character.name}</h3>
                <Badge variant="secondary" className={`text-xs ${getTypeColor(character.type)} mt-1`}>
                  {character.type.charAt(0).toUpperCase() + character.type.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Attribute Status Indicator */}
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-700">
              {filledAttributes} out of {totalAttributes} attributes filled
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                character.type === 'human' ? 'bg-sky-400' :
                character.type === 'animal' ? 'bg-emerald-400' :
                character.type === 'creature' ? 'bg-violet-400' :
                'bg-purple-400'
              }`}
              style={{ width: `${(filledAttributes / totalAttributes) * 100}%` }}
            ></div>
          </div>
        </div>
      </Card>

      <CharacterAttributesPopup
        character={character}
        isOpen={showAttributesPopup}
        onClose={() => setShowAttributesPopup(false)}
        onSave={handleSaveAttributes}
      />
    </>
  );
};
