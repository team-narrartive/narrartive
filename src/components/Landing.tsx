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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted relative">
      {/* Hero Section - Full Viewport Height */}
      <section className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-6 bg-background">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-display text-foreground tracking-tight">
                  NarrArtive
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Where stories come to life</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={onLogin} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Login
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-display text-foreground mb-6 leading-tight tracking-tight">
              Transform Your 
              <span className="text-primary"> Stories </span>
              Into Visual 
              <span className="text-accent"> Masterpieces</span>
            </h2>
              
            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              NarrArtive uses advanced AI to identify characters in your stories and generate stunning visual representations. 
              Bring your imagination to life with the power of artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onGetStarted}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg font-semibold shadow-lg rounded-lg transition-colors"
              >
                Start Creating Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline"
                className="border-2 border-input text-foreground hover:bg-accent hover:text-accent-foreground px-8 py-3 text-lg font-medium rounded-lg transition-colors"
                onClick={() => window.open('https://www.youtube.com/watch?v=ukF8FUwA4w8', '_blank')}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Advertisement
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              Powerful Features for Creative Minds
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to transform your written stories into visual narratives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  index === 0 ? 'bg-primary/10 text-primary' : 
                  index === 1 ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary-foreground'
                }`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-display text-card-foreground mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-display text-foreground mb-6">
            Ready to bring your stories to life?
          </h3>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Join thousands of creators who are already transforming their narratives with NarrArtive
          </p>
          <Button 
            onClick={onGetStarted}
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-lg font-semibold shadow-lg rounded-lg transition-colors"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                alt="NarrArtive Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-xl font-display text-foreground">
              NarrArtive
            </span>
          </div>
          <p className="text-muted-foreground">© 2024 NarrArtive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};