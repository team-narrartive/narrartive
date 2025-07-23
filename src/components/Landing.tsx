import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Palette, Users, Play } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Floating assets with exact positioning and animations from Supabase storage
const floatingAssets = [
  {
    name: 'spaceship',
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/spaceship.png`,
    position: { top: '10%', left: '75%' },
    animation: 'animate-float-in-right',
    delay: 'animate-delay-100',
    size: 'w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60'
  },
  {
    name: 'moon',
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/moon.png`,
    position: { top: '5%', left: '5%' },
    animation: 'animate-float-in-top',
    delay: 'animate-delay-200',
    size: 'w-36 h-36 md:w-48 md:h-48 lg:w-56 lg:h-56'
  },
  {
    name: 'dinosaur',
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/dinosaur.png`,
    position: { top: '30%', left: '10%' },
    animation: 'animate-float-in-left',
    delay: 'animate-delay-300',
    size: 'w-44 h-44 md:w-56 md:h-56 lg:w-64 lg:h-64'
  },
  {
    name: 'flowers',
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/flowers.png`,
    position: { top: '60%', left: '15%' },
    animation: 'animate-float-in-bottom-left',
    delay: 'animate-delay-400',
    size: 'w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60'
  },
  {
    name: 'glow-swirl',
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/glow-swirl.png`,
    position: { top: '15%', left: '45%' },
    animation: 'animate-float-in-top',
    delay: 'animate-delay-500',
    size: 'w-36 h-36 md:w-48 md:h-48 lg:w-56 lg:h-56'
  },
  {
    name: 'jupiter-planet',
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/jupiter-planet.png`,
    position: { top: '40%', left: '80%' },
    animation: 'animate-float-in-right',
    delay: 'animate-delay-600',
    size: 'w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60'
  },
  {
    name: 'leaf',
    url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/leaf.png`,
    position: { top: '70%', left: '85%' },
    animation: 'animate-float-in-bottom-right',
    delay: 'animate-delay-700',
    size: 'w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52'
  }
];

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const [colorRevealed, setColorRevealed] = useState(false);
  const [assetsRevealed, setAssetsRevealed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Immediately set grayscale on page load
    document.body.style.background = '#f0f0f0';
    const contentWrapper = document.getElementById('content-wrapper');
    if (contentWrapper) {
      contentWrapper.style.filter = 'grayscale(100%)';
      contentWrapper.style.transition = 'filter 500ms ease-in-out, background-color 500ms ease-in-out';
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          // Trigger the reveal when hero is 20% visible
          setColorRevealed(true);
          setTimeout(() => setAssetsRevealed(true), 100);
          
          // Remove grayscale and apply reveal background
          if (contentWrapper) {
            contentWrapper.style.filter = 'grayscale(0%)';
          }
          document.body.style.background = 'hsl(30, 100%, 95%)';
        }
      },
      { threshold: [0.2] }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
      // Cleanup on unmount
      document.body.style.background = '';
      if (contentWrapper) {
        contentWrapper.style.filter = '';
      }
    };
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "AI Story Analysis",
      description: "Our AI automatically identifies characters and story elements from your text",
      bgColor: colorRevealed ? 'hsl(240, 60%, 95%)' : 'hsl(0, 0%, 95%)', // Lavender
      iconColor: colorRevealed ? 'hsl(240, 60%, 85%)' : 'hsl(0, 0%, 80%)',
      titleColor: colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 20%)',
      borderColor: colorRevealed ? 'hsl(240, 60%, 85%)' : 'hsl(0, 0%, 80%)'
    },
    {
      icon: Palette,
      title: "Visual Generation",
      description: "Transform your characters into stunning visual representations",
      bgColor: colorRevealed ? 'hsl(330, 80%, 95%)' : 'hsl(0, 0%, 95%)', // Pink
      iconColor: colorRevealed ? 'hsl(330, 80%, 85%)' : 'hsl(0, 0%, 80%)',
      titleColor: colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 20%)',
      borderColor: colorRevealed ? 'hsl(330, 80%, 85%)' : 'hsl(0, 0%, 80%)'
    },
    {
      icon: Users,
      title: "Community Sharing",
      description: "Share your stories and discover amazing creations from other users",
      bgColor: colorRevealed ? 'hsl(200, 80%, 95%)' : 'hsl(0, 0%, 95%)', // Sky Blue
      iconColor: colorRevealed ? 'hsl(200, 80%, 85%)' : 'hsl(0, 0%, 80%)',
      titleColor: colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 20%)',
      borderColor: colorRevealed ? 'hsl(200, 80%, 85%)' : 'hsl(0, 0%, 80%)'
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
                    color: colorRevealed ? 'hsl(30, 100%, 50%)' : 'hsl(0, 0%, 0%)',
                    fontWeight: 900
                  }}
                >
                  NarrArtive
                </h1>
                <p 
                  className="text-xs font-medium transition-all duration-300" 
                  style={{ color: colorRevealed ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 40%)' }}
                >
                  Where stories come to life
                </p>
              </div>
            </div>
            
            <Button 
              onClick={onLogin}
              className="font-medium px-6 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 0%)',
                color: 'hsl(0, 0%, 100%)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(270, 50%, 50%)' : 'hsl(0, 0%, 20%)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 0%)';
              }}
            >
              Sign In
            </Button>
          </div>
        </nav>,
        document.body
      )}

      {/* Floating Assets - Only show after reveal */}
      {assetsRevealed && floatingAssets.map((asset, index) => (
        <div
          key={asset.name}
          className={`
            fixed z-10 ${asset.size} ${asset.animation} ${asset.delay}
            opacity-0 transition-transform duration-300 hover:scale-105 cursor-pointer
          `}
          style={{
            top: asset.position.top,
            left: asset.position.left,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img 
            src={asset.url} 
            alt={asset.name}
            className="w-full h-full object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const emojis = ['🚀', '🌙', '🦕', '🌸', '✨', '🪐', '🍃'];
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<div class="text-6xl md:text-8xl lg:text-9xl">${emojis[index] || '✨'}</div>`;
            }}
          />
        </div>
      ))}

      {/* Content wrapper - applies filter/transitions */}
      <div 
        id="content-wrapper"
        style={{ 
          filter: 'grayscale(100%)', // Start in grayscale immediately
          backgroundColor: '#f0f0f0', // Start with neutral gray background
          transition: 'filter 500ms ease-in-out, background-color 500ms ease-in-out',
          minHeight: '100vh'
        }}
      >
        {/* Hero Section - Full Viewport Height */}
        <section 
          ref={heroRef} 
          className="min-h-screen flex items-center justify-center px-6 pt-20"
          style={{ 
            backgroundColor: colorRevealed ? 'hsl(30, 100%, 95%)' : 'hsl(0, 0%, 100%)',
            transition: 'background-color 500ms ease-in-out'
          }}
        >
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-sans leading-tight tracking-tight transition-all duration-500 mb-8">
              <span style={{ 
                color: colorRevealed ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 0%)', 
                fontWeight: 800 
              }}>Transform Your </span>
              <span style={{ 
                color: colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 40%)', 
                fontWeight: 800 
              }}>Stories</span>
              <span style={{ 
                color: colorRevealed ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 0%)', 
                fontWeight: 800 
              }}> Into Visual </span>
              <span style={{ 
                color: colorRevealed ? 'hsl(30, 100%, 50%)' : 'hsl(0, 0%, 40%)', 
                fontWeight: 800 
              }}>Masterpieces</span>
            </h2>
              
            <p 
              className="text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto font-medium transition-all duration-500" 
              style={{ color: colorRevealed ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 40%)' }}
            >
              NarrArtive uses advanced AI to identify characters in your stories and generate stunning visual representations. 
              Bring your imagination to life with the power of artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onGetStarted}
                className="px-8 py-3 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: colorRevealed ? 'hsl(30, 100%, 50%)' : 'hsl(0, 0%, 0%)',
                  color: 'hsl(0, 0%, 100%)',
                  borderRadius: '16px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(30, 100%, 40%)' : 'hsl(0, 0%, 20%)';
                  (e.target as HTMLElement).style.boxShadow = '0 10px 30px -10px hsla(30, 100%, 50%, 0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(30, 100%, 50%)' : 'hsl(0, 0%, 0%)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 20px -4px hsla(217,19%,24%,0.15)';
                }}
              >
                Get Started Now
              </Button>
              
              <Button 
                variant="outline"
                className="px-8 py-3 text-sm font-bold transition-all duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 0%)',
                  color: colorRevealed ? 'hsl(270, 50%, 40%)' : 'hsl(0, 0%, 0%)',
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  borderRadius: '16px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = colorRevealed ? 'hsl(270, 50%, 95%)' : 'hsl(0, 0%, 95%)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'hsl(0, 0%, 100%)';
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
        <section className="px-6 py-24" style={{ backgroundColor: 'hsl(0, 0%, 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-sans font-bold mb-4" style={{ 
                color: 'hsl(0, 0%, 0%)', 
                fontWeight: 800 
              }}>
                Powerful Features for Creative Minds
              </h3>
              <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium" style={{ color: 'hsl(0, 0%, 20%)' }}>
                Everything you need to transform your written stories into visual narratives
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 lg:gap-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group cursor-pointer transition-all duration-300 hover:-translate-y-2"
                >
                 <div 
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-300 min-h-[220px] flex flex-col p-6"
                   style={{ 
                     backgroundColor: feature.bgColor,
                     border: `2px solid ${feature.borderColor}`,
                     borderRadius: '16px'
                   }}
                 >
                   <div 
                     className="w-14 h-14 flex items-center justify-center mb-6 transition-all duration-300"
                     style={{ 
                       backgroundColor: feature.iconColor,
                       borderRadius: '12px'
                     }}
                   >
                     <feature.icon className="w-7 h-7" style={{ color: 'hsl(0, 0%, 100%)' }} />
                   </div>
                   <h4 
                     className="text-xl font-sans font-semibold mb-3 transition-all duration-300" 
                     style={{ color: feature.titleColor }}
                   >
                    {feature.title}
                  </h4>
                  <p 
                    className="text-sm leading-relaxed font-medium flex-1 transition-all duration-300" 
                    style={{ color: colorRevealed ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 40%)' }}
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
            backgroundColor: colorRevealed ? 'hsl(30, 100%, 95%)' : 'hsl(0, 0%, 100%)',
            transition: 'background-color 500ms ease-in-out'
          }}
        >
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold mb-6" style={{ 
              color: 'hsl(0, 0%, 0%)', 
              fontWeight: 800 
            }}>
              Ready to bring your stories to life?
            </h3>
            <p className="text-lg md:text-xl mb-12 font-medium max-w-2xl mx-auto" style={{ color: 'hsl(0, 0%, 20%)' }}>
              Join thousands of creators who are already transforming their narratives with NarrArtive
            </p>
            <div className="flex justify-center" style={{ marginTop: '8px' }}>
              <Button 
                onClick={onGetStarted}
                className="px-10 py-4 text-base font-semibold transition-all duration-200 text-white shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: 'hsl(30, 100%, 50%)',
                  border: '1px solid hsl(30, 100%, 50%)',
                  borderRadius: '16px'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'hsl(30, 100%, 40%)';
                  (e.target as HTMLElement).style.boxShadow = '0 10px 30px -10px hsla(30, 100%, 50%, 0.3)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'hsl(30, 100%, 50%)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 20px -4px hsla(217,19%,24%,0.15)';
                }}
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t" style={{ 
          borderColor: 'hsl(0, 0%, 80%)', 
          backgroundColor: 'hsl(0, 0%, 100%)' 
        }}>
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-sans font-semibold" style={{ color: 'hsl(30, 100%, 50%)' }}>
                NarrArtive
              </span>
            </div>
            <p className="font-medium" style={{ color: 'hsl(0, 0%, 20%)' }}>
              © 2024 NarrArtive. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};