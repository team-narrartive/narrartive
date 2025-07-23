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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-orange-50 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '6s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-14 h-14"
                />
              </div>
              <div>
                <h1 className="text-3xl font-display text-slate-900 tracking-tight">
                  NarrArtive
                </h1>
                <p className="text-sm text-slate-600 font-medium">Where stories come to life</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={onLogin} 
                className="text-slate-700 hover:text-slate-900 hover:bg-white/60 font-medium px-6 py-2.5 rounded-xl"
              >
                Log In
              </Button>
              <Button 
                onClick={onGetStarted} 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700 font-medium px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto text-center">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-display text-slate-900 mb-8 leading-tight tracking-tight">
                Transform Your 
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Stories </span>
                Into Visual 
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> Masterpieces</span>
              </h2>
                
              <p className="text-xl md:text-2xl text-slate-600 mb-16 leading-relaxed max-w-4xl mx-auto font-medium">
                NarrArtive uses advanced AI to identify characters in your stories and generate stunning visual representations. 
                Bring your imagination to life with the power of artificial intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
                <Button 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 text-white hover:from-blue-700 hover:via-emerald-700 hover:to-teal-700 px-12 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl"
                >
                  Start Creating Now
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-2 border-gradient-to-r border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 hover:border-emerald-400 px-12 py-6 text-xl font-medium rounded-2xl transition-all duration-200"
                  onClick={() => window.open('https://www.youtube.com/watch?v=ukF8FUwA4w8', '_blank')}
                >
                  <Play className="w-6 h-6 mr-3" />
                  Watch Demo
                </Button>
              </div>

              {/* Demo Preview */}
              <div className="relative max-w-5xl mx-auto">
                <div className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl border border-white/50">
                  <div 
                    className="aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-100 via-emerald-50 to-orange-100"
                  >
                    <div className="text-center relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-emerald-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent font-display text-2xl mb-2">Premium Experience</h3>
                      <p className="text-slate-600 font-medium">Transform stories into visual masterpieces</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-gradient-to-br from-white/80 via-blue-50/40 to-emerald-50/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-5xl md:text-6xl font-display bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
                Powerful Features for Creative Minds
              </h3>
              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium">
                Everything you need to transform your written stories into visual narratives
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  <div className={`rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 ${
                    index === 0 ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-blue-500' : 
                    index === 1 ? 'bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500' : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600'
                  }`}>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-2xl lg:text-3xl font-display text-white mb-4">{feature.title}</h4>
                    <p className="text-lg text-white/90 leading-relaxed font-medium">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-emerald-600/20 animate-pulse"></div>
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h3 className="text-5xl md:text-6xl lg:text-7xl font-display text-white mb-8">
              Ready to bring your stories to life?
            </h3>
            <p className="text-xl md:text-2xl text-blue-100 mb-16 font-medium max-w-3xl mx-auto">
              Join thousands of creators who are already transforming their narratives with NarrArtive
            </p>
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-900 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 px-16 py-8 text-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-3xl"
            >
              Start Your Journey
              <ArrowRight className="w-8 h-8 ml-4" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-16 border-t border-slate-200/50 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5ad0184b-23a4-4c18-a55d-19eb10875bb1.png" 
                  alt="NarrArtive Logo" 
                  className="w-10 h-10"
                />
              </div>
              <span className="text-2xl font-display bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                NarrArtive
              </span>
            </div>
            <p className="text-slate-600 font-medium">© 2024 NarrArtive. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};