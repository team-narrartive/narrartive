-- Add missing columns to profiles table for user statistics
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS likes_received integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_views integer DEFAULT 0;

-- Create function to update user statistics when stories are liked
CREATE OR REPLACE FUNCTION public.update_profile_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  story_owner_id UUID;
BEGIN
  -- Get the story owner
  SELECT user_id INTO story_owner_id
  FROM public.stories
  WHERE id = NEW.story_id;
  
  IF FOUND AND story_owner_id IS NOT NULL THEN
    -- Update the profile likes count
    UPDATE public.profiles
    SET likes_received = COALESCE(likes_received, 0) + 1
    WHERE id = story_owner_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to decrease user statistics when stories are unliked
CREATE OR REPLACE FUNCTION public.decrease_profile_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  story_owner_id UUID;
BEGIN
  -- Get the story owner
  SELECT user_id INTO story_owner_id
  FROM public.stories
  WHERE id = OLD.story_id;
  
  IF FOUND AND story_owner_id IS NOT NULL THEN
    -- Update the profile likes count
    UPDATE public.profiles
    SET likes_received = GREATEST(COALESCE(likes_received, 0) - 1, 0)
    WHERE id = story_owner_id;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create triggers for user_story_likes table
DROP TRIGGER IF EXISTS update_profile_likes_on_insert ON public.user_story_likes;
CREATE TRIGGER update_profile_likes_on_insert
  AFTER INSERT ON public.user_story_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_likes();

DROP TRIGGER IF EXISTS update_profile_likes_on_delete ON public.user_story_likes;
CREATE TRIGGER update_profile_likes_on_delete
  AFTER DELETE ON public.user_story_likes
  FOR EACH ROW EXECUTE FUNCTION public.decrease_profile_likes();