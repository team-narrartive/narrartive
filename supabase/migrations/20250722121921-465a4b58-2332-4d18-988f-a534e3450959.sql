-- Remove all like functionality with CASCADE to handle dependencies

-- Drop triggers first
DROP TRIGGER IF EXISTS likes_statistics_trigger ON public.stories;

-- Drop RPC functions
DROP FUNCTION IF EXISTS public.increment_story_likes(UUID);
DROP FUNCTION IF EXISTS public.decrement_story_likes(UUID);

-- Drop related functions and triggers
DROP FUNCTION IF EXISTS public.update_likes_statistics() CASCADE;

-- Remove like_count column from stories (this will also drop dependent triggers)
ALTER TABLE public.stories DROP COLUMN IF EXISTS like_count CASCADE;

-- Drop user_story_likes table (this will also drop associated indexes and policies)
DROP TABLE IF EXISTS public.user_story_likes CASCADE;

-- Remove likes_received column from profiles if it exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS likes_received CASCADE;