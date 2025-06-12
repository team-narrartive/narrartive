
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Palette, Users, ArrowRight, Play } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const features = [
    {
      icon: BookOpen,
      title: "AI Story Analysis",
      description: "Our AI automatically identifies characters and story elements from your text"
    },
    {
      icon: Palette,
      title: "Visual Generation",
      description: "Transform your characters into stunning visual representations"
    },
    {
      icon: Users,
      title: "Community Sharing",
      description: "Share your stories and discover amazing creations from other users"
    }
  ];

  return (
    <div className="min-h-screen gradient-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                alt="NarrArtive Logo" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  NarrArtive
                </h1>
                <p className="text-xs text-gray-600">Where stories come to life</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onLogin} className="text-gray-600 hover:text-primary">
                Log In
              </Button>
              <Button onClick={onGetStarted} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your 
                <span className="text-primary"> Stories </span>
                Into Visual 
                <span className="text-accent"> Masterpieces</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
                NarrArtive uses advanced AI to identify characters in your stories and generate stunning visual representations. 
                Bring your imagination to life with the power of artificial intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Button 
                  onClick={onGetStarted}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Creating Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-2 border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg"
                  onClick={() => window.open('https://www.youtube.com/watch?v=ukF8FUwA4w8', '_blank')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Demo Image Placeholder */}
              <div className="relative max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                  <div 
                    className="aspect-video rounded-xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundImage: `url('/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png')`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundColor: 'rgba(125, 211, 252, 0.1)'
                    }}
                  >
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]"></div>
                    <div className="text-center relative z-10">
                      <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 drop-shadow-lg" />
                      <p className="text-primary font-bold text-lg drop-shadow-md">Interactive Demo Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for Creative Minds
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to transform your written stories into visual narratives
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20"
                >
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-5xl font-bold text-gray-900 mb-6">
              Ready to bring your stories to life?
            </h3>
            <p className="text-xl text-gray-600 mb-12">
              Join thousands of creators who are already transforming their narratives with NarrArtive
            </p>
            <Button 
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-gray-200">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                alt="NarrArtive Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-primary">
                NarrArtive
              </span>
            </div>
            <p className="text-gray-500">© 2024 NarrArtive. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
