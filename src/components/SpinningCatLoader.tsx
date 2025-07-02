
import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SpinningCatLoaderProps {
  isVisible: boolean;
  message?: string;
}

export const SpinningCatLoader: React.FC<SpinningCatLoaderProps> = ({ 
  isVisible, 
  message = "Generating your amazing images..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
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
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>This might take a moment...</span>
        </div>
        
        {/* Fun facts that rotate */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <p className="text-xs text-gray-600 italic">
            💡 Fun fact: AI image generation is like teaching a computer to dream in pixels!
          </p>
        </div>
      </Card>
    </div>
  );
};
