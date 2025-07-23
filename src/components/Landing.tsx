import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Palette, Users, Play } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Floating assets using your exact Supabase bucket structure - optimized positions for perfect framing
const floatingAssets = [
  {
    name: 'moon',
    url: 'https://yzmladsjrirvzzmaendi.supabase.co/storage/v1/object/public/assets/moon.png',
    position: { 
      top: '8%', 
      left: 'clamp(0%, 2%, 4%)'     // 0% mobile, 2% medium, 4% large - pulled back for safe distance from "Transform"
    },
    animation: 'animate-float-in-top',
    delay: 'animate-delay-200',
    size: 'clamp(170px, 13vw, 250px)'
  },
  {
    name: 'space_ship',
    url: 'https://yzmladsjrirvzzmaendi.supabase.co/storage/v1/object/public/assets/space_ship.png',
    position: { 
      top: '18%', 
      left: 'clamp(72%, 78%, 84%)'  // 72% mobile, 78% medium, 84% large - moved down and right to avoid "Visual" overlap
    },
    animation: 'animate-float-in-right',
    delay: 'animate-delay-100',
    size: 'clamp(190px, 15vw, 270px)'
  },
  {
    name: 'dinasour',
    url: 'https://yzmladsjrirvzzmaendi.supabase.co/storage/v1/object/public/assets/dinasour.png',
    position: { 
      top: '24%', 
      left: 'clamp(3%, 6%, 9%)'    // 3% mobile, 6% medium, 9% large - moved up to align with description text
    },
    animation: 'animate-float-in-left',
    delay: 'animate-delay-300',
    size: 'clamp(230px, 17vw, 310px)'
  },
  {
    name: 'flowers',
    url: 'https://yzmladsjrirvzzmaendi.supabase.co/storage/v1/object/public/assets/flowers.png',
    position: { 
      top: '48%', 
      left: 'clamp(5%, 8%, 11%)'   // 5% mobile, 8% medium, 11% large - positioned near AI card with safe distance
    },
    animation: 'animate-float-in-bottom-left',
    delay: 'animate-delay-400',
    size: 'clamp(175px, 13vw, 255px)'
  },
  {
    name: 'jupiter',
    url: 'https://yzmladsjrirvzzmaendi.supabase.co/storage/v1/object/public/assets/jupiter.png',
    position: { 
      top: '38%', 
      left: 'clamp(74%, 80%, 86%)'  // 74% mobile, 80% medium, 86% large - nudged up near "Creative Minds" with overflow prevention
    },
    animation: 'animate-float-in-right',
    delay: 'animate-delay-600',
    size: 'clamp(170px, 13vw, 250px)'
  },
  {
    name: 'leaf_green',
    url: 'https://yzmladsjrirvzzmaendi.supabase.co/storage/v1/object/public/assets/leaf_green.png',
    position: { 
      top: '58%', 
      left: 'clamp(82%, 88%, 94%)'  // 82% mobile, 88% medium, 94% large - "emerging from right edge" effect near Community card
    },
    animation: 'animate-float-in-bottom-right',
    delay: 'animate-delay-700',
    size: 'clamp(155px, 12vw, 235px)'
  }
];

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const [colorRevealed, setColorRevealed] = useState(false);
  const [assetsRevealed, setAssetsRevealed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Force grayscale immediately on mount
    document.body.style.background = '#f0f0f0';
    
    // Apply grayscale to the entire page immediately, not just content wrapper
    document.documentElement.style.filter = 'grayscale(100%)';
    document.documentElement.style.transition = 'filter 500ms ease-in-out';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          // Trigger the reveal when hero is 60% visible
          setColorRevealed(true);
          setTimeout(() => setAssetsRevealed(true), 300);
          
          // Remove grayscale from entire page
          document.documentElement.style.filter = 'grayscale(0%)';
          document.body.style.background = 'hsl(30, 100%, 95%)';
        }
      },
      { threshold: [0.6] }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
      // Cleanup on unmount
      document.body.style.background = '';
      document.documentElement.style.filter = '';
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

      {/* Content wrapper */}
      <div 
        id="content-wrapper"
        className="relative"
        style={{ 
          backgroundColor: colorRevealed ? 'hsl(30, 100%, 95%)' : '#f0f0f0',
          transition: 'background-color 500ms ease-in-out',
          minHeight: '100vh'
        }}
      >
        {/* Floating Assets - Only show after reveal with custom sizing per asset */}
        {assetsRevealed && floatingAssets.map((asset, index) => (
          <div
            key={asset.name}
            className={`
              absolute z-10 ${asset.animation} ${asset.delay}
              opacity-0 transition-transform duration-300 hover:scale-105 cursor-pointer
            `}
            style={{
              top: asset.position.top,
              left: asset.position.left,
              transform: 'translate(-50%, -50%)',
              width: asset.size,
              height: asset.size
            }}
          >
            <img 
              src={asset.url} 
              alt={asset.name}
              className="w-full h-full object-contain drop-shadow-lg transform rotate-12 translate-y-1"
              onError={(e) => {
                // Fallback to emoji if image fails to load
                const emojis = ['🌙', '🚀', '🦕', '🌸', '🪐', '🍃'];
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class="text-6xl md:text-8xl lg:text-9xl">${emojis[index] || '✨'}</div>`;
              }}
            />
          </div>
        ))}

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