
export interface Project {
  id: string;
  name: string;
  description: string;
  images: string[];
  createdAt: Date;
  userId: string;
  status: 'recent' | 'community';
  storyContent: string;
  likes: number;
  isPublic: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
