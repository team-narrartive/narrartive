
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
      case 'human': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'animal': return 'bg-green-100 text-green-800 border-green-200';
      case 'creature': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'object': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Count filled attributes
  const filledAttributes = Object.keys(character.attributes).filter(key => {
    const value = character.attributes[key];
    return value !== null && value !== undefined && value !== '';
  }).length;

  // Get total possible attributes based on type
  const getTotalAttributes = (type: string) => {
    switch (type) {
      case 'human': return 12; // Based on HUMAN_ATTRIBUTES count
      case 'animal': return 8;  // Based on ANIMAL_ATTRIBUTES count
      case 'creature': return 6; // Based on CREATURE_ATTRIBUTES count
      case 'object': return 6;   // Based on OBJECT_ATTRIBUTES count
      default: return 8;
    }
  };

  const totalAttributes = getTotalAttributes(character.type);

  const handleSaveAttributes = (updatedCharacter: Character) => {
    onUpdate(updatedCharacter);
  };

  return (
    <>
      <Card 
        className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
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
            <span className="font-medium text-blue-600">
              {filledAttributes} out of {totalAttributes} attributes filled
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
