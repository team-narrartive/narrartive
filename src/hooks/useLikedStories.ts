
import { useState, useEffect } from 'react';

// Simple client-side storage for liked stories
// In a real app, this would be stored in the database with user relationships
export const useLikedStories = () => {
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load liked stories from localStorage on component mount
    const stored = localStorage.getItem('likedStories');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLikedStories(new Set(parsed));
      } catch (error) {
        console.error('Error loading liked stories:', error);
      }
    }
  }, []);

  const toggleLike = (storyId: string) => {
    setLikedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      
      // Save to localStorage
      localStorage.setItem('likedStories', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const isLiked = (storyId: string) => likedStories.has(storyId);

  return { toggleLike, isLiked };
};
