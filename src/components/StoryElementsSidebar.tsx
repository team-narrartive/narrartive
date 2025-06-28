
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Type, FileText } from 'lucide-react';

interface StoryElementsSidebarProps {
  story: string;
  onDragStart: (content: string, type: 'paragraph' | 'sentence') => void;
}

export const StoryElementsSidebar: React.FC<StoryElementsSidebarProps> = ({
  story,
  onDragStart
}) => {
  const [activeTab, setActiveTab] = useState<'paragraphs' | 'sentences'>('paragraphs');

  // Split story into paragraphs and sentences
  const paragraphs = story.split('\n\n').filter(p => p.trim().length > 0);
  const sentences = story.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim() + '.');

  const handleDragStart = (e: React.DragEvent, content: string, type: 'paragraph' | 'sentence') => {
    e.dataTransfer.setData('text/plain', content);
    e.dataTransfer.setData('application/story-element', type);
    onDragStart(content, type);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Elements</h3>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'paragraphs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('paragraphs')}
            className={`flex-1 text-xs ${
              activeTab === 'paragraphs' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            <FileText className="w-3 h-3 mr-2" />
            Paragraphs
          </Button>
          <Button
            variant={activeTab === 'sentences' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('sentences')}
            className={`flex-1 text-xs ${
              activeTab === 'sentences' 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            <Type className="w-3 h-3 mr-2" />
            Sentences
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {activeTab === 'paragraphs' ? (
          <div className="space-y-3">
            {paragraphs.map((paragraph, index) => (
              <div
                key={`paragraph-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, paragraph, 'paragraph')}
                className="p-3 bg-gray-50 rounded-lg border cursor-move hover:bg-gray-100 hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                    {paragraph}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                  <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border inline-block">
                    Drag to canvas
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sentences.map((sentence, index) => (
              <div
                key={`sentence-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, sentence, 'sentence')}
                className="p-3 bg-gray-50 rounded-lg border cursor-move hover:bg-gray-100 hover:border-green-300 transition-all duration-200 group"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Type className="w-3 h-3 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    {sentence}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                  <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border inline-block">
                    Drag to canvas
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
