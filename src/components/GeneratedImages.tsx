
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image, Loader2 } from 'lucide-react';

interface GeneratedImagesProps {
  images: string[];
  loading: boolean;
}

export const GeneratedImages: React.FC<GeneratedImagesProps> = ({ images, loading }) => {
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

  if (images.length === 0) {
    return (
      <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/30 p-4 h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-6 text-center bg-white/80 max-w-sm">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">No Images Generated</h3>
            <p className="text-sm text-gray-500">
              Click "Generate Images" to create AI-generated visuals from your story.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/30 h-screen flex flex-col">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-white/20 bg-white/80">
        <div className="flex items-center space-x-2">
          <Image className="w-5 h-5 text-sky-600" />
          <h2 className="font-semibold text-gray-900">Generated Images</h2>
          <span className="text-xs bg-sky-100 text-sky-600 px-2 py-1 rounded-full">
            {images.length}
          </span>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {images.map((imageUrl, index) => (
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
      </ScrollArea>
    </div>
  );
};
