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
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/8 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-success/8 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-brand/8 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h1 className="text-3xl font-display text-brand">
                  NarrArtive
                </h1>
                <p className="text-sm text-muted-foreground font-medium">Where stories come to life</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onLogin} className="text-foreground hover:text-brand font-medium">
                Log In
              </Button>
              <Button onClick={onGetStarted} className="btn-premium">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-display text-foreground mb-8 leading-tight">
              Transform Your 
              <span className="text-primary"> Stories </span>
              Into Visual 
              <span className="text-success"> Masterpieces</span>
            </h2>
              
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
              NarrArtive uses advanced AI to identify characters in your stories and generate stunning visual representations. 
              Bring your imagination to life with the power of artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Button 
                onClick={onGetStarted}
                className="bg-brand text-brand-foreground hover:bg-brand-dark px-12 py-6 text-xl font-semibold shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105 rounded-2xl"
              >
                Start Creating Now
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              
              <Button 
                variant="outline"
                className="border-2 border-brand/30 text-brand hover:bg-brand/10 px-12 py-6 text-xl font-medium rounded-2xl"
                onClick={() => window.open('https://www.youtube.com/watch?v=ukF8FUwA4w8', '_blank')}
              >
                <Play className="w-6 h-6 mr-3" />
                Watch Demo
              </Button>
            </div>

            {/* Demo Preview */}
            <div className="relative max-w-6xl mx-auto">
              <div className="card-premium p-8 lg:p-12">
                <div 
                  className="aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden gradient-hero border border-brand/10"
                >
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-card">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-brand font-display text-2xl mb-2">Premium Experience</h3>
                    <p className="text-muted-foreground font-medium">Transform stories into visual masterpieces</p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-5xl md:text-6xl font-display text-foreground mb-6">
                Powerful Features for Creative Minds
              </h3>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
                Everything you need to transform your written stories into visual narratives
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="card-premium p-10 group cursor-pointer transform hover:scale-105"
                >
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-card group-hover:shadow-elegant transition-all duration-300 ${
                    index === 0 ? 'gradient-primary' : 
                    index === 1 ? 'gradient-success' : 'gradient-brand'
                  }`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl lg:text-3xl font-display text-foreground mb-4">{feature.title}</h4>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-5xl md:text-6xl lg:text-7xl font-display text-foreground mb-8">
              Ready to bring your stories to life?
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground mb-16 font-medium max-w-3xl mx-auto">
              Join thousands of creators who are already transforming their narratives with NarrArtive
            </p>
            <Button 
              onClick={onGetStarted}
              className="bg-brand text-brand-foreground hover:bg-brand-dark px-16 py-8 text-2xl font-semibold shadow-card hover:shadow-elegant transition-all duration-300 transform hover:scale-105 rounded-3xl"
            >
              Start Your Journey
              <ArrowRight className="w-8 h-8 ml-4" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-16 border-t border-border/50 bg-white/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-6 h-6"
                />
              </div>
              <span className="text-2xl font-display text-brand">
                NarrArtive
              </span>
            </div>
            <p className="text-muted-foreground font-medium">© 2024 NarrArtive. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};