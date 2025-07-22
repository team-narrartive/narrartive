-- Fix data inconsistency by syncing profile statistics with actual story data
UPDATE public.profiles 
SET 
  stories_generated = (
    SELECT COUNT(*) 
    FROM public.stories 
    WHERE stories.user_id = profiles.id
  ),
  likes_received = (
    SELECT COALESCE(SUM(like_count), 0)
    FROM public.stories 
    WHERE stories.user_id = profiles.id
  ),
  total_views = (
    SELECT COALESCE(SUM(view_count), 0)
    FROM public.stories 
    WHERE stories.user_id = profiles.id
  );

-- Drop all existing triggers first
DROP TRIGGER IF EXISTS update_profile_likes_on_insert ON public.user_story_likes;
DROP TRIGGER IF EXISTS update_profile_likes_on_delete ON public.user_story_likes;
DROP TRIGGER IF EXISTS update_user_statistics_on_stories ON public.stories;
DROP TRIGGER IF EXISTS update_user_stats_on_story_insert ON public.stories;
DROP TRIGGER IF EXISTS update_user_stats_on_story_delete ON public.stories;
DROP TRIGGER IF EXISTS sync_user_statistics_trigger ON public.stories;
DROP TRIGGER IF EXISTS sync_user_likes_trigger ON public.user_story_likes;

-- Now drop functions
DROP FUNCTION IF EXISTS public.update_profile_likes();
DROP FUNCTION IF EXISTS public.decrease_profile_likes();
DROP FUNCTION IF EXISTS public.update_user_statistics();
DROP FUNCTION IF EXISTS public.calculate_user_statistics();
DROP FUNCTION IF EXISTS public.sync_user_statistics();
DROP FUNCTION IF EXISTS public.sync_user_likes();

-- Create function to sync user statistics when stories change
CREATE OR REPLACE FUNCTION public.sync_user_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Determine which user_id to update
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;
  
  -- Update profile statistics based on actual story data
  UPDATE public.profiles
  SET 
    stories_generated = (
      SELECT COUNT(*) 
      FROM public.stories 
      WHERE stories.user_id = target_user_id
    ),
    total_views = (
      SELECT COALESCE(SUM(view_count), 0)
      FROM public.stories 
      WHERE stories.user_id = target_user_id
    ),
    minutes_spent = (
      SELECT COUNT(*) * 45
      FROM public.stories 
      WHERE stories.user_id = target_user_id
    )
  WHERE id = target_user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create function to sync likes when user_story_likes changes
CREATE OR REPLACE FUNCTION public.sync_user_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  story_owner_id UUID;
BEGIN
  -- Get the story owner
  IF TG_OP = 'DELETE' THEN
    SELECT user_id INTO story_owner_id FROM public.stories WHERE id = OLD.story_id;
  ELSE
    SELECT user_id INTO story_owner_id FROM public.stories WHERE id = NEW.story_id;
  END IF;
  
  -- Update likes_received based on actual like data
  IF story_owner_id IS NOT NULL THEN
    UPDATE public.profiles
    SET likes_received = (
      SELECT COALESCE(SUM(like_count), 0)
      FROM public.stories 
      WHERE stories.user_id = story_owner_id
    )
    WHERE id = story_owner_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER sync_user_statistics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_statistics();

CREATE TRIGGER sync_user_likes_trigger
  AFTER INSERT OR DELETE ON public.user_story_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_likes();