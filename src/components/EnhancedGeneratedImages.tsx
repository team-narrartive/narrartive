
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Image, Loader2, ChevronDown, ChevronRight, Palette } from 'lucide-react';
import { EnhancedCanvasEditor } from './EnhancedCanvasEditor';

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

interface EnhancedGeneratedImagesProps {
  imageVersions: ImageVersion[];
  loading: boolean;
  story: string;
  onOpenCanvas?: () => void;
}

export const EnhancedGeneratedImages: React.FC<EnhancedGeneratedImagesProps> = ({ 
  imageVersions, 
  loading, 
  story,
  onOpenCanvas
}) => {
  const [showPreviousVersions, setShowPreviousVersions] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const currentVersion = imageVersions[imageVersions.length - 1];
  const previousVersions = imageVersions.slice(0, -1);

  const handleOpenCanvas = () => {
    setShowCanvas(true);
    onOpenCanvas?.();
  };

  if (loading) {
    return (
      <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/30 p-4 h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-sky-500" />
            <h3 className="font-semibold text-gray-700 mb-2">Generating Images</h3>
            <p className="text-sm text-gray-600">Creating AI-generated images from your story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (imageVersions.length === 0) {
    return (
      <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/30 p-4 h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-6 text-center bg-white/80 max-w-sm">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">No Images Generated</h3>
            <p className="text-sm text-gray-500">
              Configure your settings and click "Generate Images" to create AI-generated visuals.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/30 h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/20 bg-white/80">
          <div className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-sky-600" />
            <h2 className="font-semibold text-gray-900">Generated Images</h2>
            <span className="text-xs bg-sky-100 text-sky-600 px-2 py-1 rounded-full">
              {currentVersion?.images.length || 0}
            </span>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Previous Versions - Collapsible */}
            {previousVersions.length > 0 && (
              <Collapsible open={showPreviousVersions} onOpenChange={setShowPreviousVersions}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-2 h-auto text-left"
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
                          <img
                            key={imageIndex}
                            src={imageUrl}
                            alt={`Version ${versionIndex + 1} - Image ${imageIndex + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
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
                <h3 className="font-medium text-gray-800">Latest Generation</h3>
                {currentVersion.images.map((imageUrl, index) => (
                  <Card key={index} className="p-2 bg-white/80 backdrop-blur-sm border border-white/20">
                    <img
                      src={imageUrl}
                      alt={`Generated scene ${index + 1}`}
                      className="w-full h-auto rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280">Image failed to load</text></svg>';
                      }}
                    />
                    <p className="text-xs text-gray-600 mt-2 text-center">Scene {index + 1}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Canvas Button */}
        {currentVersion && currentVersion.images.length > 0 && (
          <div className="p-4 border-t border-white/20 bg-white/80">
            <Button
              onClick={handleOpenCanvas}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Palette className="w-4 h-4 mr-2" />
              Open Canvas
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Canvas Editor Modal */}
      {showCanvas && currentVersion && (
        <EnhancedCanvasEditor
          images={currentVersion.images}
          story={story}
          imageVersions={imageVersions}
          onClose={() => setShowCanvas(false)}
        />
      )}
    </>
  );
};
