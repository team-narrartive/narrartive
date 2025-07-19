-- Fix incorrect statistics by recalculating them based on actual data
UPDATE public.profiles 
SET stories_generated = (
  SELECT COUNT(*) 
  FROM public.stories 
  WHERE stories.user_id = profiles.id
)
WHERE id IN (
  SELECT p.id 
  FROM public.profiles p
  LEFT JOIN (
    SELECT user_id, COUNT(*) as actual_count 
    FROM public.stories 
    GROUP BY user_id
  ) s ON p.id = s.user_id
  WHERE COALESCE(p.stories_generated, 0) != COALESCE(s.actual_count, 0)
);

-- Also recalculate minutes_spent (45 minutes per story)
UPDATE public.profiles 
SET minutes_spent = (
  SELECT COUNT(*) * 45
  FROM public.stories 
  WHERE stories.user_id = profiles.id
)
WHERE id IN (
  SELECT p.id 
  FROM public.profiles p
  LEFT JOIN (
    SELECT user_id, COUNT(*) as actual_count 
    FROM public.stories 
    GROUP BY user_id
  ) s ON p.id = s.user_id
  WHERE COALESCE(p.stories_generated, 0) != COALESCE(s.actual_count, 0)
);

-- Create proper triggers to ensure statistics stay in sync
DROP TRIGGER IF EXISTS update_user_stats_on_story_insert ON public.stories;
DROP TRIGGER IF EXISTS update_user_stats_on_story_delete ON public.stories;

CREATE OR REPLACE FUNCTION public.update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment story count and add 45 minutes
    UPDATE public.profiles
    SET stories_generated = stories_generated + 1,
        minutes_spent = minutes_spent + 45
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement story count and subtract 45 minutes
    UPDATE public.profiles
    SET stories_generated = GREATEST(stories_generated - 1, 0),
        minutes_spent = GREATEST(minutes_spent - 45, 0)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for both insert and delete
CREATE TRIGGER update_user_stats_on_story_insert
  AFTER INSERT ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_statistics();

CREATE TRIGGER update_user_stats_on_story_delete
  AFTER DELETE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_statistics();