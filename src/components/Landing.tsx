import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Palette, Users, Play } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const [colorRevealed, setColorRevealed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Trigger color reveal instantly on any scroll
      setColorRevealed(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Remove body styles to avoid stacking context issues with fixed nav
  useEffect(() => {
    return () => {
      // Cleanup only - no body modifications
      document.body.style.filter = '';
      document.body.style.backgroundColor = '';
      document.body.style.transition = '';
    };
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "AI Story Analysis",
      description: "Our AI automatically identifies characters and story elements from your text",
      bgColor: colorRevealed ? 'hsl(30, 80%, 95%)' : '#f0f0f0',
      iconColor: colorRevealed ? 'hsl(30, 70%, 55%)' : '#333',
      titleColor: colorRevealed ? 'hsl(30, 70%, 55%)' : '#333',
      borderColor: colorRevealed ? 'hsl(30, 70%, 55%)' : '#666'
    },
    {
      icon: Palette,
      title: "Visual Generation",
      description: "Transform your characters into stunning visual representations",
      bgColor: colorRevealed ? 'hsl(200, 80%, 95%)' : '#f0f0f0',
      iconColor: colorRevealed ? 'hsl(200, 70%, 55%)' : '#333',
      titleColor: colorRevealed ? 'hsl(200, 70%, 55%)' : '#333',
      borderColor: colorRevealed ? 'hsl(200, 70%, 55%)' : '#666'
    },
    {
      icon: Users,
      title: "Community Sharing",
      description: "Share your stories and discover amazing creations from other users",
      bgColor: colorRevealed ? 'hsl(270, 60%, 95%)' : '#f0f0f0',
      iconColor: colorRevealed ? 'hsl(270, 50%, 55%)' : '#333',
      titleColor: colorRevealed ? 'hsl(270, 50%, 55%)' : '#333',
      borderColor: colorRevealed ? 'hsl(270, 50%, 55%)' : '#666'
    }
  ];

  return (
    <>
      {/* Navigation - rendered via Portal to bypass body stacking context */}
      {createPortal(
        <nav 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100vw',
            height: 'auto',
            zIndex: 999999,
            backgroundColor: colorRevealed ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: colorRevealed ? '0 2px 8px -2px hsla(217,19%,24%,0.08)' : 'none',
            padding: '1rem 1.5rem',
            transition: 'background-color 300ms ease-in-out, box-shadow 300ms ease-in-out'
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 
                  className="text-2xl font-sans transition-all duration-300" 
                   style={{ 
                    color: colorRevealed ? 'hsl(151, 60%, 45%)' : '#000',
                    fontWeight: 900
                  }}
                >
                  NarrArtive
                </h1>
                <p 
                  className="text-xs font-medium transition-all duration-300" 
                  style={{ color: colorRevealed ? 'hsl(217, 10%, 46%)' : '#666' }}
                >
                  Where stories come to life
                </p>
              </div>
            </div>
            
            <Button 
              onClick={onLogin}
              className="font-medium px-6 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: colorRevealed ? 'hsl(151, 60%, 45%)' : '#000',
                color: '#fff'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(151, 60%, 35%)' : '#333';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(151, 60%, 45%)' : '#000';
              }}
            >
              Login
            </Button>
          </div>
        </nav>,
        document.body
      )}

      {/* Content wrapper - applies filter/transitions instead of body */}
      <div 
        id="content-wrapper"
        style={{ 
          filter: colorRevealed ? 'grayscale(0%) saturate(110%)' : 'grayscale(100%)',
          backgroundColor: colorRevealed ? 'hsl(48, 15%, 94%)' : '#fff',
          transition: 'filter 300ms ease-in-out, background-color 300ms ease-in-out',
          minHeight: '100vh'
        }}
      >
        {/* Hero Section - Full Viewport Height */}
        <section 
          ref={heroRef} 
          className="min-h-screen flex items-center justify-center px-6 pt-20"
          style={{ 
            backgroundColor: colorRevealed ? 'hsl(45, 85%, 90%)' : '#fff',
            transition: 'background-color 300ms ease-in-out'
          }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold mb-8 leading-tight tracking-tight transition-all duration-300">
              <span style={{ color: colorRevealed ? '#000' : '#000' }}>Transform Your </span>
              <span style={{ color: colorRevealed ? '#666' : '#666' }}>Stories</span>
              <span style={{ color: colorRevealed ? '#000' : '#000' }}> Into Visual </span>
              <span style={{ color: colorRevealed ? 'hsl(151, 60%, 45%)' : '#666' }}>Masterpieces</span>
            </h2>
              
            <p 
              className="text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto font-medium transition-all duration-300" 
              style={{ color: colorRevealed ? 'hsl(217, 10%, 46%)' : '#666' }}
            >
              NarrArtive uses advanced AI to identify characters in your stories and generate stunning visual representations. 
              Bring your imagination to life with the power of artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onGetStarted}
                className="px-8 py-3 text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: colorRevealed ? 'hsl(151, 60%, 45%)' : '#000',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(151, 60%, 35%)' : '#333';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(151, 60%, 45%)' : '#000';
                }}
              >
                Start Creating Now
              </Button>
              
              <Button 
                variant="outline"
                className="px-8 py-3 text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: colorRevealed ? 'hsl(151, 60%, 45%)' : '#000',
                  color: colorRevealed ? 'hsl(151, 60%, 45%)' : '#000',
                  backgroundColor: colorRevealed ? 'white' : '#fff'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(151, 55%, 95%)' : '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'white' : '#fff';
                }}
                onClick={() => window.open('https://www.youtube.com/watch?v=ukF8FUwA4w8', '_blank')}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Advertisement
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-sans font-bold text-slate-900 mb-4">
                Powerful Features for Creative Minds
              </h3>
              <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium" style={{ color: 'hsl(217, 10%, 46%)' }}>
                Everything you need to transform your written stories into visual narratives
              </p>
            </div>

            <div className="grid gap-4 md:gap-6 lg:gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group cursor-pointer transition-all duration-300 hover:-translate-y-2"
                >
                 <div 
                  className="w-full rounded-2xl shadow-[0_4px_20px_-4px_hsla(217,19%,24%,0.08)] hover:shadow-[0_10px_30px_-10px_hsla(217,19%,24%,0.15)] transition-all duration-300 min-h-[180px] flex flex-col"
                   style={{ 
                     backgroundColor: feature.bgColor,
                     border: `1px solid ${feature.borderColor}`,
                     padding: '16px'
                   }}
                 >
                   <div 
                     className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                     style={{ backgroundColor: feature.iconColor }}
                   >
                     <feature.icon className="w-6 h-6 text-white" />
                   </div>
                   <h4 
                     className="text-lg font-sans font-semibold mb-2 transition-all duration-300" 
                     style={{ color: feature.titleColor }}
                   >
                    {feature.title}
                  </h4>
                  <p 
                    className="text-sm leading-relaxed font-medium flex-1 transition-all duration-300" 
                    style={{ color: colorRevealed ? 'hsl(217, 10%, 46%)' : '#666' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="px-6 py-24" 
          style={{ 
            backgroundColor: colorRevealed ? 'hsl(45, 85%, 90%)' : '#fff',
            transition: 'background-color 300ms ease-in-out'
          }}
        >
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-slate-900 mb-6">
              Ready to bring your stories to life?
            </h3>
            <p className="text-lg md:text-xl mb-12 font-medium max-w-2xl mx-auto" style={{ color: 'hsl(217, 10%, 46%)' }}>
              Join thousands of creators who are already transforming their narratives with NarrArtive
            </p>
            <div className="flex justify-center" style={{ marginTop: '8px' }}>
              <Button 
                onClick={onGetStarted}
                className="px-10 py-4 text-base font-semibold rounded-2xl transition-all duration-200 text-white shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: 'hsl(151, 60%, 45%)',
                  border: '1px solid hsl(151, 60%, 45%)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'hsl(151, 60%, 35%)';
                  (e.target as HTMLElement).style.boxShadow = '0 10px 30px -10px hsla(151,60%,45%,0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'hsl(151, 60%, 45%)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 20px -4px hsla(217,19%,24%,0.15)';
                }}
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t bg-white" style={{ borderColor: 'hsl(217, 10%, 91%)' }}>
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-sans font-semibold" style={{ color: 'hsl(151, 60%, 45%)' }}>
                NarrArtive
              </span>
            </div>
            <p className="font-medium" style={{ color: 'hsl(217, 10%, 46%)' }}>
              © 2024 NarrArtive. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};
