
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Type, FileText, Hash } from 'lucide-react';

interface StoryElementsSidebarProps {
  story: string;
  onDragStart: (content: string, type: 'paragraph' | 'sentence') => void;
}

export const StoryElementsSidebar: React.FC<StoryElementsSidebarProps> = ({
  story,
  onDragStart
}) => {
  const [activeTab, setActiveTab] = useState<'paragraphs' | 'sentences'>('paragraphs');

  // Parse story into structured content with better paragraph detection
  const parseStoryContent = (storyText: string) => {
    const lines = storyText.split('\n').filter(line => line.trim());
    const paragraphs: string[] = [];
    const headings: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Detect headings
      const isHeading = trimmed.endsWith(':') || 
                       trimmed === trimmed.toLowerCase() || 
                       /^\d+\./.test(trimmed) ||
                       trimmed.length < 50;
      
      if (isHeading) {
        headings.push(trimmed);
      } else {
        paragraphs.push(trimmed);
      }
    });
    
    return { paragraphs: [...headings, ...paragraphs], headings };
  };

  const { paragraphs } = parseStoryContent(story);
  
  // Split into sentences with better punctuation handling
  const sentences = story
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .map(s => {
      // Add back punctuation if missing
      const lastChar = s[s.length - 1];
      if (!['.', '!', '?'].includes(lastChar)) {
        return s + '.';
      }
      return s;
    });

  const handleDragStart = (e: React.DragEvent, content: string, type: 'paragraph' | 'sentence') => {
    // Set drag data
    e.dataTransfer.setData('text/plain', content);
    e.dataTransfer.setData('application/story-element', type);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    const dragImage = document.createElement('div');
    dragImage.textContent = content.substring(0, 50) + '...';
    dragImage.style.padding = '8px 12px';
    dragImage.style.backgroundColor = type === 'paragraph' ? '#dbeafe' : '#d1fae5';
    dragImage.style.border = `2px solid ${type === 'paragraph' ? '#3b82f6' : '#10b981'}`;
    dragImage.style.borderRadius = '8px';
    dragImage.style.fontSize = '12px';
    dragImage.style.maxWidth = '200px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-100px';
    dragImage.style.zIndex = '1000';
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 100, 20);
    
    // Clean up drag image after drag starts
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
    
    onDragStart(content, type);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Story Elements</h3>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'paragraphs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('paragraphs')}
            className={`flex-1 text-xs font-semibold ${
              activeTab === 'paragraphs' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            <FileText className="w-3 h-3 mr-2" />
            Paragraphs ({paragraphs.length})
          </Button>
          <Button
            variant={activeTab === 'sentences' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('sentences')}
            className={`flex-1 text-xs font-semibold ${
              activeTab === 'sentences' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Type className="w-3 h-3 mr-2" />
            Sentences ({sentences.length})
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {activeTab === 'paragraphs' ? (
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2 bg-gray-100 p-2 rounded">
              <Hash className="w-3 h-3" />
              Drag paragraphs to canvas
            </div>
            {paragraphs.map((paragraph, index) => {
              const isHeading = paragraph.endsWith(':') || 
                               paragraph === paragraph.toLowerCase() || 
                               /^\d+\./.test(paragraph) ||
                               paragraph.length < 50;
              
              return (
                <div
                  key={`paragraph-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, paragraph, 'paragraph')}
                  className={`p-3 rounded-lg border cursor-grab hover:shadow-md transition-all duration-200 group active:cursor-grabbing ${
                    isHeading 
                      ? 'bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isHeading ? 'bg-purple-200' : 'bg-blue-200'
                    }`}>
                      {isHeading ? (
                        <Hash className={`w-3 h-3 ${isHeading ? 'text-purple-700' : 'text-blue-700'}`} />
                      ) : (
                        <FileText className="w-3 h-3 text-blue-700" />
                      )}
                    </div>
                    <p className={`text-sm text-gray-800 line-clamp-4 leading-relaxed ${
                      isHeading ? 'font-bold' : 'font-medium'
                    }`}>
                      {paragraph}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    <div className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded border inline-block">
                      {isHeading ? 'Heading' : 'Paragraph'} • Drag to canvas
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2 bg-gray-100 p-2 rounded">
              <Type className="w-3 h-3" />
              Drag sentences to canvas
            </div>
            {sentences.map((sentence, index) => (
              <div
                key={`sentence-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, sentence, 'sentence')}
                className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-grab hover:bg-green-100 hover:border-green-300 hover:shadow-md transition-all duration-200 group active:cursor-grabbing"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Type className="w-3 h-3 text-green-700" />
                  </div>
                  <p className="text-sm text-gray-800 font-medium line-clamp-3 leading-relaxed">
                    {sentence}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                  <div className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 rounded border inline-block">
                    Sentence • Drag to canvas
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
