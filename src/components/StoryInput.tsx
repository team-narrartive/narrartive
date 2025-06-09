
import React, { useState } from 'react';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Sparkles, FileText, Users } from 'lucide-react';

interface StoryInputProps {
  onBack: () => void;
  onGenerateWidgets: (story: string) => void;
}

export const StoryInput: React.FC<StoryInputProps> = ({ onBack, onGenerateWidgets }) => {
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    if (story.trim()) {
      setIsLoading(true);
      // Simulate processing
      setTimeout(() => {
        setIsLoading(false);
        onGenerateWidgets(story);
      }, 2000);
    }
  };

  const exampleStory = `In the mystical realm of Aethermoor, Princess Luna discovered an ancient crystal that pulsed with otherworldly energy. Her loyal companion, a silver wolf named Asher, sensed danger approaching. The evil sorcerer Malachar had been searching for this very artifact for centuries, and now his dark magic grew stronger with each passing moment. Luna knew she had to protect her kingdom, but she would need the help of her childhood friend Marcus, a brave knight with a mysterious past.`;

  return (
    <Layout showSidebar={true} currentView="create">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-purple-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Create New Story</h1>
            <p className="text-gray-600">Step 1 of 3: Enter your story</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Story Input */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Story</h2>
                  <p className="text-sm text-gray-600">Paste or write your story below</p>
                </div>
              </div>
              
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Input Story Here..."
                className="w-full h-96 p-4 border border-gray-200 rounded-lg bg-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  {story.length} characters • {story.split(' ').filter(word => word.length > 0).length} words
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setStory(exampleStory)}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    Try Example
                  </Button>
                  
                  <Button
                    onClick={handleGenerate}
                    disabled={!story.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Widgets
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Tips Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Tips for Better Results</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Include character descriptions in your story</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Mention physical attributes, clothing, and personality traits</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Use character names consistently throughout</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Include animals, creatures, or objects you want visualized</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="text-center">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Gallery</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get inspired by amazing stories created by our community
                </p>
                <Button variant="outline" className="w-full">
                  Browse Examples
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
