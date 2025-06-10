
import { Project } from '../types/project';

// Sample projects with real data to populate the dashboard
export const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'The Enchanted Forest',
    description: 'A magical tale of friendship and adventure through mystical woodlands where talking animals guide lost children home.',
    images: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
      'https://images.unsplash.com/photo-1574263867128-fbcd88e19e4a?w=400',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400'
    ],
    createdAt: new Date('2024-06-08'),
    userId: 'user1',
    status: 'recent',
    storyContent: 'In the heart of an ancient forest, where sunbeams danced through emerald leaves and flowers sang in harmony with the wind, lived a community of magical creatures who had sworn to protect lost souls. When young Emma stumbled into their realm, she discovered that sometimes getting lost is the only way to find what you truly need.',
    likes: 12,
    isPublic: false
  },
  {
    id: '2',
    name: 'Space Odyssey Chronicles',
    description: 'An epic journey through the cosmos where brave explorers discover ancient civilizations and cosmic mysteries.',
    images: [
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
      'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400',
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400'
    ],
    createdAt: new Date('2024-06-03'),
    userId: 'user1',
    status: 'recent',
    storyContent: 'Captain Sarah Chen had always dreamed of touching the stars, but nothing could have prepared her for what lay beyond the Andromeda Gateway. As her ship emerged from hyperspace, she gazed upon the impossible: a living galaxy where planets breathed and stars communicated through ancient songs that echoed across the void.',
    likes: 18,
    isPublic: false
  },
  {
    id: '3',
    name: 'Mystery at Moonlight Manor',
    description: 'A thrilling detective story set in a Victorian mansion where secrets lurk in every shadow.',
    images: [
      'https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=400',
      'https://images.unsplash.com/photo-1564540729301-8de16b0d012b?w=400',
      'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=400'
    ],
    createdAt: new Date('2024-05-27'),
    userId: 'user1',
    status: 'recent',
    storyContent: 'Detective Eleanor Whitmore had solved countless cases, but Moonlight Manor presented a puzzle unlike any other. As thunder crashed outside the Gothic windows, she realized that the mansion itself was both witness and accomplice to a crime that spanned generations.',
    likes: 8,
    isPublic: false
  },
  {
    id: '4',
    name: 'The Last Dragon Keeper',
    description: 'A fantasy epic about the final guardian of an ancient dragon sanctuary and the prophecy that will determine the fate of two worlds.',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      'https://images.unsplash.com/photo-1568667256549-094345857637?w=400',
      'https://images.unsplash.com/photo-1526667997957-cf78cdc17261?w=400'
    ],
    createdAt: new Date('2024-06-05'),
    userId: 'user2',
    status: 'community',
    storyContent: 'Kael had spent his entire life believing he was the last of his kind, until the day an injured dragon crashed into his hidden sanctuary. As he nursed the magnificent creature back to health, he discovered that the ancient prophecies spoke not of ending, but of a new beginning that would require the greatest sacrifice of all.',
    likes: 24,
    isPublic: true
  },
  {
    id: '5',
    name: 'Urban Legends Awakened',
    description: 'Modern fantasy where city myths come to life and a young photographer must capture the truth hidden in plain sight.',
    images: [
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400'
    ],
    createdAt: new Date('2024-06-01'),
    userId: 'user3',
    status: 'community',
    storyContent: 'Maya thought she was just documenting street art when her camera started capturing things that shouldn\'t exist. Shadows with their own agenda, reflections that moved independently, and graffiti that changed when no one was looking. In a city where millions of stories intersect, she discovered that some tales refuse to remain fiction.',
    likes: 15,
    isPublic: true
  },
  {
    id: '6',
    name: 'The Time Gardener',
    description: 'A heartwarming tale of an elderly woman who discovers she can grow memories in her garden and must choose which moments to preserve.',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
      'https://images.unsplash.com/photo-1592500270046-4e0c54a6b3d8?w=400',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
      'https://images.unsplash.com/photo-1563993831-b7e1b1cb9b79?w=400'
    ],
    createdAt: new Date('2024-05-29'),
    userId: 'user4',
    status: 'community',
    storyContent: 'When Rose inherited her grandmother\'s cottage, she thought the overgrown garden was just another chore. But as she cleared away decades of neglect, she discovered that each flower bed held memories of the past, and tending to them brought forgotten moments blooming back to life. Now she faced an impossible choice: which memories deserved to flourish, and which should be allowed to fade?',
    likes: 31,
    isPublic: true
  }
];

// Functions to interact with the project data
export const getProjectsByStatus = (status: 'recent' | 'community', userId?: string): Project[] => {
  if (status === 'recent' && userId) {
    return sampleProjects.filter(project => project.status === 'recent' && project.userId === userId);
  }
  return sampleProjects.filter(project => project.status === status);
};

export const getProjectById = (id: string): Project | undefined => {
  return sampleProjects.find(project => project.id === id);
};

export const getAllProjects = (): Project[] => {
  return sampleProjects;
};

export const addProject = (project: Omit<Project, 'id'>): Project => {
  const newProject: Project = {
    ...project,
    id: Date.now().toString()
  };
  sampleProjects.push(newProject);
  return newProject;
};
