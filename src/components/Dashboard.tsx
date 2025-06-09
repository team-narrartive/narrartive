
import React from 'react';
import { Layout } from './Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Clock, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  Users, 
  Sparkles,
  ArrowRight 
} from 'lucide-react';

interface DashboardProps {
  onCreateNew: () => void;
  onViewProjects: () => void;
  onViewCommunity: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onCreateNew, 
  onViewProjects, 
  onViewCommunity 
}) => {
  const stats = [
    { icon: Clock, label: 'Minutes Spent', value: '307', color: 'text-purple-600' },
    { icon: BookOpen, label: 'Projects Completed', value: '5', color: 'text-blue-600' },
    { icon: Heart, label: 'Likes Received', value: '23', color: 'text-pink-600' },
    { icon: TrendingUp, label: 'Stories Generated', value: '12', color: 'text-emerald-600' }
  ];

  const recentProjects = [
    {
      title: 'The Enchanted Forest',
      description: 'A magical tale of friendship and adventure...',
      created: '2 days ago',
      images: 4,
      likes: 12
    },
    {
      title: 'Space Odyssey Chronicles',
      description: 'An epic journey through the cosmos...',
      created: '1 week ago',
      images: 6,
      likes: 18
    },
    {
      title: 'Mystery at Moonlight Manor',
      description: 'A thrilling detective story...',
      created: '2 weeks ago',
      images: 3,
      likes: 8
    }
  ];

  return (
    <Layout showSidebar={true} currentView="dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back, Creator! 🎨</h1>
            <p className="text-blue-100 mb-6">Ready to bring another story to life?</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onCreateNew}
                className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Generate New Story
              </Button>
              
              <Button 
                onClick={onViewCommunity}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-3"
              >
                <Users className="w-5 h-5 mr-2" />
                Community Showcase
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={onCreateNew}
                variant="outline" 
                className="w-full justify-start hover:bg-purple-50 hover:border-purple-200"
              >
                <Plus className="w-4 h-4 mr-3" />
                Create New Story
              </Button>
              
              <Button 
                onClick={onViewProjects}
                variant="outline" 
                className="w-full justify-start hover:bg-blue-50 hover:border-blue-200"
              >
                <BookOpen className="w-4 h-4 mr-3" />
                My Projects
              </Button>
              
              <Button 
                onClick={onViewCommunity}
                variant="outline" 
                className="w-full justify-start hover:bg-emerald-50 hover:border-emerald-200"
              >
                <Users className="w-4 h-4 mr-3" />
                Explore Community
              </Button>
            </div>
          </Card>

          {/* Recent Projects */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Recent Projects</h3>
              <Button 
                onClick={onViewProjects}
                variant="link" 
                className="text-purple-600 hover:text-purple-700 p-0"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <h4 className="font-medium text-gray-900 mb-1">{project.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project.created}</span>
                    <div className="flex items-center space-x-3">
                      <span>{project.images} images</span>
                      <span>{project.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
