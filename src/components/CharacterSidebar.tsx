
import React from 'react';
import { CharacterWidget } from './CharacterWidget';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Loader2 } from 'lucide-react';

interface Character {
  name: string;
  type: 'human' | 'animal' | 'creature' | 'object';
  description?: string;
  attributes: Record<string, any>;
}

interface CharacterSidebarProps {
  characters: Character[];
  loading: boolean;
  onCharacterUpdate: (index: number, updatedCharacter: Character) => void;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({ 
  characters, 
  loading, 
  onCharacterUpdate 
}) => {
  if (loading) {
    return (
      <div className="w-80 border-r border-gray-300 bg-white/80 backdrop-blur-sm p-4 h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-500" />
            <p className="text-sm text-gray-600">Analyzing characters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="w-80 border-r border-gray-300 bg-white/80 backdrop-blur-sm p-4 h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center" style={{ marginTop: '-20%' }}>
          <div className="p-6 text-center bg-white/90 max-w-sm rounded-lg shadow-sm border border-gray-200">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">No Characters Found</h3>
            <p className="text-sm text-gray-500">
              Click "Generate Widgets" to analyze your story and extract characters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-300 bg-white/80 backdrop-blur-sm h-screen flex flex-col">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-sky-600" />
          <h2 className="font-semibold text-gray-900">Story Characters</h2>
          <span className="text-xs bg-sky-100 text-sky-600 px-2 py-1 rounded-full">
            {characters.length}
          </span>
        </div>
      </div>
      
      {/* Scrollable Content - Uses full remaining height */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {characters.map((character, index) => (
            <CharacterWidget
              key={`${character.name}-${index}`}
              character={character}
              onUpdate={(updatedCharacter) => onCharacterUpdate(index, updatedCharacter)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
