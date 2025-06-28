
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Zap, Settings, Eye } from 'lucide-react';
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

  // Count all attributes (both predefined and custom)
  const attributeCount = Object.keys(character.attributes).filter(key => {
    const value = character.attributes[key];
    return value !== null && value !== undefined && value !== '';
  }).length;

  const handleSaveAttributes = (updatedCharacter: Character) => {
    onUpdate(updatedCharacter);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(character.type)}`}>
                {getTypeIcon(character.type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{character.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className={`text-xs ${getTypeColor(character.type)}`}>
                    {character.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {attributeCount} attributes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {character.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {character.description}
            </p>
          )}

          {/* Quick attribute preview */}
          {attributeCount > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {Object.entries(character.attributes)
                  .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                {attributeCount > 3 && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{attributeCount - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAttributesPopup(true)}
              className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Settings className="w-3 h-3 mr-2" />
              {attributeCount > 0 ? 'Edit Attributes' : 'Add Attributes'}
            </Button>
            {attributeCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAttributesPopup(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Eye className="w-3 h-3" />
              </Button>
            )}
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
