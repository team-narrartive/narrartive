-- Add statistics columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS minutes_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stories_generated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes_received INTEGER DEFAULT 0;

-- Create a function to update user statistics
CREATE OR REPLACE FUNCTION public.calculate_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- For story insertion, update stories count
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET stories_generated = stories_generated + 1,
        minutes_spent = minutes_spent + 45  -- Assuming 45 minutes per story
    WHERE id = NEW.user_id;
  
  -- For story deletion, decrease stories count
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET stories_generated = GREATEST(stories_generated - 1, 0),
        minutes_spent = GREATEST(minutes_spent - 45, 0)  -- Subtract 45 minutes
    WHERE id = OLD.user_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update likes statistics
CREATE OR REPLACE FUNCTION public.update_likes_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- For like increment
  IF TG_OP = 'UPDATE' AND NEW.like_count > OLD.like_count THEN
    UPDATE public.profiles
    SET likes_received = likes_received + 1
    WHERE id = NEW.user_id;
  
  -- For like decrement
  ELSIF TG_OP = 'UPDATE' AND NEW.like_count < OLD.like_count THEN
    UPDATE public.profiles
    SET likes_received = GREATEST(likes_received - 1, 0)
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for statistics management
DROP TRIGGER IF EXISTS story_statistics_trigger ON public.stories;
CREATE TRIGGER story_statistics_trigger
AFTER INSERT OR DELETE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.calculate_user_statistics();

DROP TRIGGER IF EXISTS likes_statistics_trigger ON public.stories;
CREATE TRIGGER likes_statistics_trigger
AFTER UPDATE OF like_count ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.update_likes_statistics();