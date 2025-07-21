
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Image } from 'lucide-react';

interface ImageVersion {
  id: string;
  images: string[];
  created_at: string;
  settings: {
    numImages: number;
    quality: string;
    style: string;
  };
}

interface CanvasImageLibraryProps {
  imageVersions: ImageVersion[];
  onImageDragStart: (imageUrl: string) => void;
  showPreviousVersions: boolean;
  onTogglePreviousVersions: (show: boolean) => void;
}

export const CanvasImageLibrary: React.FC<CanvasImageLibraryProps> = ({
  imageVersions,
  onImageDragStart,
  showPreviousVersions,
  onTogglePreviousVersions
}) => {
  const currentVersion = imageVersions[imageVersions.length - 1];
  const previousVersions = imageVersions.slice(0, -1);

  const handleDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
    onImageDragStart(imageUrl);
  };

  if (imageVersions.length === 0) {
    return (
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/30 h-full flex flex-col">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-700">Image Library</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm text-center px-4">
            No images available for this canvas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/30 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-sky-600" />
          <h3 className="font-semibold text-gray-900">Image Library</h3>
          <span className="text-xs bg-sky-100 text-sky-600 px-2 py-1 rounded-full">
            {currentVersion?.images.length || 0}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Drag images to canvas</p>
      </div>
      
      {/* Scrollable Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Previous Versions - Collapsible */}
          {previousVersions.length > 0 && (
            <Collapsible open={showPreviousVersions} onOpenChange={onTogglePreviousVersions}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-2 h-auto text-left focus:outline-none focus:ring-0 focus-visible:ring-0"
                >
                  <span className="font-medium text-gray-700">
                    Previous Versions ({previousVersions.length})
                  </span>
                  {showPreviousVersions ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2">
                {previousVersions.map((version, versionIndex) => (
                  <Card key={version.id} className="p-3 bg-white/60 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">
                      Version {versionIndex + 1} • {version.settings.quality} quality • {version.settings.style}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {version.images.map((imageUrl, imageIndex) => (
                        <div
                          key={imageIndex}
                          draggable
                          onDragStart={(e) => handleDragStart(e, imageUrl)}
                          className="cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={imageUrl}
                            alt={`Version ${versionIndex + 1} - Image ${imageIndex + 1}`}
                            className="w-full h-20 object-cover rounded border pointer-events-none"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Current Version */}
          {currentVersion && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Latest Generation</h4>
              {currentVersion.images.map((imageUrl, index) => (
                <Card key={index} className="p-2 bg-white/80 backdrop-blur-sm border border-white/20">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, imageUrl)}
                    className="cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={imageUrl}
                      alt={`Generated scene ${index + 1}`}
                      className="w-full h-auto rounded-lg object-cover pointer-events-none"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">Scene {index + 1}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
