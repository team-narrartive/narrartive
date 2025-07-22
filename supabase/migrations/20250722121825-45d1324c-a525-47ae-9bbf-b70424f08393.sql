-- Remove all like functionality from the database

-- Drop RPC functions
DROP FUNCTION IF EXISTS public.increment_story_likes(UUID);
DROP FUNCTION IF EXISTS public.decrement_story_likes(UUID);

-- Remove like_count column from stories
ALTER TABLE public.stories DROP COLUMN IF EXISTS like_count;

-- Drop user_story_likes table (this will also drop associated indexes and policies)
DROP TABLE IF EXISTS public.user_story_likes;

-- Remove any like-related triggers or functions for profiles
DROP FUNCTION IF EXISTS public.update_likes_statistics();

-- Remove likes_received column from profiles if it exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS likes_received;