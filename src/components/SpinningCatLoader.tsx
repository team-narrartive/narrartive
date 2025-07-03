
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, X, Volume2 } from 'lucide-react';

interface SpinningCatLoaderProps {
  isVisible: boolean;
  message?: string;
}

export const SpinningCatLoader: React.FC<SpinningCatLoaderProps> = ({ 
  isVisible, 
  message = "Generating your amazing images..." 
}) => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show video popup when loading starts
      setShowVideo(true);
    } else {
      // Hide video popup when loading ends
      setShowVideo(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* YouTube Video Popup */}
      {showVideo && (
        <div className="fixed top-4 right-4 z-60 bg-black rounded-lg overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between bg-gray-900 px-3 py-2">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Cat Vibes 🎵</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVideo(false)}
              className="text-white hover:bg-gray-700 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <iframe
            width="320"
            height="180"
            src="https://www.youtube.com/embed/8eZXq2k8UhM?autoplay=1&loop=1&playlist=8eZXq2k8UhM"
            title="Cat Music for Image Generation"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="block"
          />
        </div>
      )}

      {/* Main Loading Card */}
      <Card className="p-8 bg-white/95 backdrop-blur-sm border border-white/20 text-center max-w-md mx-4">
        {/* Cat animation container */}
        <div className="relative mb-6">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            {/* Spinning cat emoji with multiple layers for enhanced effect */}
            <div className="absolute inset-0 animate-spin text-6xl flex items-center justify-center">
              🐱
            </div>
            <div className="absolute inset-0 animate-spin text-4xl flex items-center justify-center opacity-50" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
              ✨
            </div>
            <div className="absolute inset-0 animate-spin text-2xl flex items-center justify-center opacity-30" style={{ animationDuration: '4s' }}>
              💫
            </div>
          </div>
          
          {/* Pulsing background circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-pulse -z-10"></div>
        </div>

        {/* Loading text */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Hold tight! 🎨
        </h3>
        
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>This might take a moment...</span>
        </div>

        {/* Show/Hide Video Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVideo(!showVideo)}
        >
          {showVideo ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Hide Music
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play Cat Music 🎵
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};
