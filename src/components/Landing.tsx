import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Palette, Users, Play } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div 
      className={`min-h-screen transition-all duration-300 ease-in-out ${
        scrolled ? 'bg-[hsl(45,93%,95%)]' : 'bg-[hsl(151,55%,95%)]'
      }`}
    >
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300 ease-in-out ${
          scrolled 
            ? 'bg-white shadow-[0_2px_8px_-2px_hsla(217,19%,24%,0.08)]' 
            : 'bg-transparent'
        }`}
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
              <h1 className="text-2xl font-sans font-semibold" style={{ color: 'hsl(151, 55%, 41%)' }}>
                NarrArtive
              </h1>
              <p className="text-xs font-medium" style={{ color: 'hsl(217, 10%, 46%)' }}>
                Where stories come to life
              </p>
            </div>
          </div>
          
          <Button 
            onClick={onLogin}
            className="font-medium px-6 py-2.5 rounded-xl transition-all duration-200 text-white hover:shadow-lg"
            style={{ 
              backgroundColor: 'hsl(151, 55%, 41%)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'hsl(151, 55%, 31%)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'hsl(151, 55%, 41%)';
            }}
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section - Full Viewport Height */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold mb-8 leading-tight tracking-tight text-slate-900">
            Transform Your{' '}
            <span style={{ color: 'hsl(151, 55%, 41%)' }}>Stories</span>
            {' '}Into Visual{' '}
            <span style={{ color: 'hsl(45, 93%, 47%)' }}>Masterpieces</span>
          </h2>
            
          <p className="text-lg md:text-xl mb-12 leading-relaxed max-w-3xl mx-auto font-medium" style={{ color: 'hsl(217, 10%, 46%)' }}>
            NarrArtive uses advanced AI to identify characters in your stories and generate stunning visual representations. 
            Bring your imagination to life with the power of artificial intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onGetStarted}
              className="px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-200 text-black shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: 'hsl(45, 93%, 47%)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'hsl(45, 93%, 37%)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'hsl(45, 93%, 47%)';
              }}
            >
              Start Creating Now
            </Button>
            
            <Button 
              variant="outline"
              className="px-8 py-4 text-lg font-medium rounded-2xl transition-all duration-200 bg-white hover:shadow-lg"
              style={{ 
                borderColor: 'hsl(151, 55%, 41%)',
                color: 'hsl(151, 55%, 41%)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'hsl(151, 55%, 95%)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'white';
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
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-sans font-bold text-slate-900 mb-4">
              Powerful Features for Creative Minds
            </h3>
            <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium" style={{ color: 'hsl(217, 10%, 46%)' }}>
              Everything you need to transform your written stories into visual narratives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                <div 
                  className="w-full h-48 bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_hsla(217,19%,24%,0.08)] hover:shadow-[0_10px_30px_-10px_hsla(217,19%,24%,0.15)] transition-all duration-300"
                  style={{ border: '1px solid hsl(151, 55%, 41%)' }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'hsl(151, 55%, 41%)' }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-sans font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm leading-relaxed font-medium" style={{ color: 'hsl(217, 10%, 46%)' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20" style={{ backgroundColor: 'hsl(45, 93%, 95%)' }}>
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-slate-900 mb-6">
            Ready to bring your stories to life?
          </h3>
          <p className="text-lg md:text-xl mb-12 font-medium max-w-2xl mx-auto" style={{ color: 'hsl(217, 10%, 46%)' }}>
            Join thousands of creators who are already transforming their narratives with NarrArtive
          </p>
          <Button 
            onClick={onGetStarted}
            className="px-12 py-6 text-xl font-semibold rounded-2xl transition-all duration-200 text-white shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: 'hsl(151, 55%, 41%)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'hsl(151, 55%, 31%)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'hsl(151, 55%, 41%)';
            }}
          >
            Start Your Journey
          </Button>
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
            <span className="text-xl font-sans font-semibold" style={{ color: 'hsl(151, 55%, 41%)' }}>
              NarrArtive
            </span>
          </div>
          <p className="font-medium" style={{ color: 'hsl(217, 10%, 46%)' }}>
            © 2024 NarrArtive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};