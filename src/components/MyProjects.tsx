
import React from 'react';
import { Layout } from './Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Heart, 
  Edit3, 
  Trash2, 
  Download,
  Share2,
  Clock,
  Images
} from 'lucide-react';
import { getProjectsByStatus } from '../data/projectsStore';

interface MyProjectsProps {
  onBack: () => void;
  onCreateNew: () => void;
}

export const MyProjects: React.FC<MyProjectsProps> = ({ onBack, onCreateNew }) => {
  const userProjects = getProjectsByStatus('recent', 'user1'); // Current user's projects

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleEditProject = (projectId: string) => {
    console.log('Edit project:', projectId);
    // This would navigate to the editing interface
  };

  const handleDeleteProject = (projectId: string) => {
    console.log('Delete project:', projectId);
    // This would show a confirmation dialog and delete the project
  };

  return (
    <Layout showSidebar={true} currentView="projects">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Manage and organize your story creations</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={onCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Projects Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userProjects.length}</p>
              <p className="text-sm text-gray-600">Total Projects</p>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userProjects.reduce((acc, p) => acc + p.images.length, 0)}</p>
              <p className="text-sm text-gray-600">Images Generated</p>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userProjects.reduce((acc, p) => acc + p.likes, 0)}</p>
              <p className="text-sm text-gray-600">Total Likes</p>
            </div>
          </Card>
          <Card className="p-4 bg-white/80 backdrop-blur-sm border border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userProjects.filter(p => p.isPublic).length}</p>
              <p className="text-sm text-gray-600">Public Projects</p>
            </div>
          </Card>
        </div>

        {/* Projects Grid */}
        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
                {/* Project Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={project.images[0]} 
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/80 text-gray-900">
                      <Images className="w-3 h-3 mr-1" />
                      {project.images.length}
                    </Badge>
                  </div>
                  {project.isPublic && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-500/80 text-white">Public</Badge>
                    </div>
                  )}
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  {/* Project Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{project.likes}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditProject(project.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-white/80 backdrop-blur-sm border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">Start creating your first story and bring it to life with AI-generated images!</p>
            <Button onClick={onCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
};
