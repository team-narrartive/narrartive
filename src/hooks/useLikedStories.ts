
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

// Improved client-side storage for liked stories with user-specific keys
export const useLikedStories = () => {
  const { user } = useAuth();
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Create user-specific key for localStorage
  const getStorageKey = useCallback(() => {
    return user ? `likedStories_${user.id}` : 'likedStories_anonymous';
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setLikedStories(new Set());
      setIsLoading(false);
      return;
    }

    // Load liked stories from localStorage for this specific user
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLikedStories(new Set(parsed));
      } catch (error) {
        console.error('Error loading liked stories:', error);
        setLikedStories(new Set());
      }
    } else {
      setLikedStories(new Set());
    }
    setIsLoading(false);
  }, [user?.id, getStorageKey]);

  const toggleLike = useCallback((storyId: string) => {
    if (!user) return;

    setLikedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      
      // Save to localStorage with user-specific key
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.error('Error saving liked stories:', error);
      }
      
      return newSet;
    });
  }, [user, getStorageKey]);

  const isLiked = useCallback((storyId: string) => {
    return likedStories.has(storyId);
  }, [likedStories]);

  return { toggleLike, isLiked, isLoading };
};
