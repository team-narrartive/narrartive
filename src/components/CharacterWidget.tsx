
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Edit2, Check, X, User, Zap } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

  const startEditing = (key: string, currentValue: any) => {
    setEditingAttribute(key);
    // Convert value to string for editing, handling different types
    if (typeof currentValue === 'string') {
      setEditValue(currentValue);
    } else if (currentValue !== null && currentValue !== undefined) {
      setEditValue(String(currentValue));
    } else {
      setEditValue('');
    }
  };

  const saveEdit = () => {
    if (editingAttribute) {
      const updatedCharacter = {
        ...character,
        attributes: {
          ...character.attributes,
          [editingAttribute]: editValue
        }
      };
      onUpdate(updatedCharacter);
    }
    setEditingAttribute(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingAttribute(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Safe filtering of attributes - handle different value types properly
  const validAttributes = Object.entries(character.attributes).filter(([key, value]) => {
    // Check if value exists and is not empty
    if (value === null || value === undefined) {
      return false;
    }
    
    // Handle string values
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    // Handle objects
    if (typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    
    // Handle numbers, booleans, etc.
    return true;
  });

  const formatAttributeValue = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    } else if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-200">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-white/40 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
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
                      {validAttributes.length} attributes
                    </span>
                  </div>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {character.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {character.description}
              </p>
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-white/20 bg-white/20">
            <div className="space-y-3 mt-3">
              {validAttributes.length > 0 ? (
                validAttributes.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-white/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                      {editingAttribute === key ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 h-8 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveEdit}
                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 break-words">
                          {formatAttributeValue(value)}
                        </div>
                      )}
                    </div>
                    {editingAttribute !== key && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(key, value)}
                        className="ml-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No attributes found for this character.</p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
