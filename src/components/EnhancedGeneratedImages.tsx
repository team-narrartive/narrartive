
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Download, Palette, Calendar, Settings, Loader2 } from 'lucide-react';
import { EnhancedCanvasEditor } from './EnhancedCanvasEditor';

interface ImageGenerationSettings {
  numImages: number;
  quality: 'low' | 'medium' | 'high';
  style: 'realistic' | 'artistic' | 'cartoon';
  instructions?: string;
}

interface ImageVersion {
  id: string;
  images: string[];
  created_at: string;
  settings: ImageGenerationSettings;
}

interface EnhancedGeneratedImagesProps {
  imageVersions: ImageVersion[];
  loading: boolean;
  story: string;
}

export const EnhancedGeneratedImages: React.FC<EnhancedGeneratedImagesProps> = ({ 
  imageVersions, 
  loading,
  story 
}) => {
  const [showCanvas, setShowCanvas] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">No Images Generated</h3>
            <p className="text-sm text-gray-500">
              Click "Generate Images" to create AI-generated visuals from your story.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const handleOpenCanvas = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowCanvas(true);
  };

  const handleCloseCanvas = () => {
    setShowCanvas(false);
    setSelectedImageUrl(null);
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `story-scene-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'realistic': return '📷';
      case 'artistic': return '🎨';
      case 'cartoon': return '🎭';
      default: return '🖼️';
    }
  };

  const latestVersion = imageVersions[imageVersions.length - 1];

  if (showCanvas && selectedImageUrl) {
    return (
      <EnhancedCanvasEditor
        images={[selectedImageUrl]}
        story={story}
        imageVersions={imageVersions}
        onClose={handleCloseCanvas}
      />
    );
  }

  return (
    <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-white/30 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-white/80">
        <div className="flex items-center space-x-2 mb-3">
          <ImageIcon className="w-5 h-5 text-sky-600" />
          <h2 className="font-semibold text-gray-900">Generated Images</h2>
          <Badge variant="secondary" className="bg-sky-100 text-sky-600">
            {latestVersion?.images.length || 0}
          </Badge>
        </div>
        
        {/* Open Canvas Button */}
        {latestVersion && latestVersion.images.length > 0 && (
          <Button
            onClick={() => handleOpenCanvas(latestVersion.images[0])}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Palette className="w-4 h-4 mr-2" />
            Open Canvas
          </Button>
        )}
      </div>
      
      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Latest Generation */}
          <div>
            <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Latest Generation
            </h3>
            
            {latestVersion && (
              <div className="space-y-3">
                {/* Generation Info */}
                <Card className="p-3 bg-white/80 border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(latestVersion.created_at)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Quality:</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1 py-0 ${getQualityColor(latestVersion.settings.quality)}`}
                      >
                        {latestVersion.settings.quality}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Style:</span>
                      <span className="text-xs">
                        {getStyleIcon(latestVersion.settings.style)} {latestVersion.settings.style}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Latest Images */}
                <div className="space-y-3">
                  {latestVersion.images.map((imageUrl, index) => (
                    <Card key={index} className="p-2 bg-white/80 backdrop-blur-sm border border-white/20 group hover:shadow-lg transition-all duration-300">
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={`Generated scene ${index + 1}`}
                          className="w-full h-auto rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => handleOpenCanvas(imageUrl)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%236b7280">Image failed to load</text></svg>';
                          }}
                        />
                        
                        {/* Overlay with download button */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(imageUrl, index);
                            }}
                            className="bg-white/90 text-gray-800 hover:bg-white"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-600">Scene {index + 1}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Previous Generations */}
          {imageVersions.length > 1 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Previous Generations</h3>
              <div className="space-y-4">
                {imageVersions.slice(0, -1).reverse().map((version, versionIndex) => (
                  <Card key={version.id} className="p-3 bg-white/60 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(version.created_at)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {version.images.length} images
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {version.images.slice(0, 4).map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Previous scene ${index + 1}`}
                            className="w-full h-16 object-cover rounded cursor-pointer hover:scale-105 transition-transform duration-200"
                            onClick={() => handleOpenCanvas(imageUrl)}
                          />
                          
                          {/* Overlay with download button for small images */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(imageUrl, index);
                              }}
                              className="bg-white/90 text-gray-800 hover:bg-white p-1 h-auto"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
