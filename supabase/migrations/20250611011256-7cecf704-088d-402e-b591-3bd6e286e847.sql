
-- Create function to safely increment story likes
CREATE OR REPLACE FUNCTION increment_story_likes(story_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  story_content TEXT,
  main_image TEXT,
  additional_images TEXT[],
  view_count INTEGER,
  like_count INTEGER,
  is_public BOOLEAN,
  category TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.stories 
  SET like_count = COALESCE(like_count, 0) + 1,
      updated_at = now()
  WHERE public.stories.id = story_id;
  
  RETURN QUERY
  SELECT * FROM public.stories 
  WHERE public.stories.id = story_id;
END;
$$;

-- Create function to safely increment story views
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  story_content TEXT,
  main_image TEXT,
  additional_images TEXT[],
  view_count INTEGER,
  like_count INTEGER,
  is_public BOOLEAN,
  category TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.stories 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = now()
  WHERE public.stories.id = story_id;
  
  RETURN QUERY
  SELECT * FROM public.stories 
  WHERE public.stories.id = story_id;
END;
$$;
