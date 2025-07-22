import React, { useState } from 'react';
import { Layout } from './Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Star, Send, ThumbsUp, Bug, Lightbulb } from 'lucide-react';
interface FeedbackProps {
  onBack: () => void;
}
export const Feedback: React.FC<FeedbackProps> = ({
  onBack
}) => {
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general');
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmitFeedback = async () => {
    if (!subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const feedbackData = {
        type: feedbackType,
        rating,
        subject,
        message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      console.log('Submitting feedback:', feedbackData);
      const {
        data,
        error
      } = await supabase.functions.invoke('send-feedback', {
        body: feedbackData
      });
      if (error) {
        throw error;
      }
      console.log('Feedback submitted successfully:', data);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly."
      });

      // Reset form
      setSubject('');
      setMessage('');
      setRating(0);
      setFeedbackType('general');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const feedbackTypes = [{
    id: 'general',
    label: 'General Feedback',
    icon: ThumbsUp,
    color: 'text-cyan-600'
  }, {
    id: 'bug',
    label: 'Bug Report',
    icon: Bug,
    color: 'text-red-600'
  }, {
    id: 'feature',
    label: 'Feature Request',
    icon: Lightbulb,
    color: 'text-emerald-600'
  }];
  return <Layout showSidebar={true} currentView="feedback">
      <div className="space-y-8">
        <div className="flex items-center justify-start gap-4">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
            <p className="text-gray-600 mt-2">Help us improve NarrArtive with your thoughts and suggestions</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-100 to-sky-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Share Your Feedback</h3>
                  <p className="text-sm text-gray-600">Your input helps us create a better experience</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Feedback Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Feedback Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {feedbackTypes.map(type => <button key={type.id} onClick={() => setFeedbackType(type.id as any)} className={`p-3 rounded-lg border text-center transition-all ${feedbackType === type.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <type.icon className={`w-5 h-5 mx-auto mb-1 ${type.color}`} />
                        <p className="text-xs font-medium">{type.label}</p>
                      </button>)}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Overall Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setRating(star)} className="p-1">
                        <Star className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      </button>)}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of your feedback" />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us more about your experience, suggestions, or issues you've encountered..." rows={6} />
                </div>

                <Button onClick={handleSubmitFeedback} disabled={!subject || !message || isSubmitting} className="w-full bg-gradient-to-r from-cyan-600 to-sky-600 text-white hover:from-cyan-700 hover:to-sky-700">
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Stats / Info */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
              <h4 className="font-semibold text-gray-900 mb-4">Why Your Feedback Matters</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <p>🎨 Help us improve story generation</p>
                <p>🚀 Request new features you'd love to see</p>
                <p>🐛 Report bugs to make the app better</p>
                <p>💡 Share ideas for community features</p>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
              <h4 className="font-semibold text-gray-900 mb-4">Recent Updates</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Enhanced image generation</p>
                    <p className="text-gray-600">Improved AI model for better character visualization</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">New dashboard layout</p>
                    <p className="text-gray-600">More intuitive navigation and project management</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>;
};