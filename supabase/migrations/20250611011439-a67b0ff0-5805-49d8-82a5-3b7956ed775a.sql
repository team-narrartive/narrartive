
-- Fix the increment_story_likes function to properly qualify column names
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
  SET like_count = COALESCE(public.stories.like_count, 0) + 1,
      updated_at = now()
  WHERE public.stories.id = story_id;
  
  RETURN QUERY
  SELECT public.stories.id,
         public.stories.user_id,
         public.stories.title,
         public.stories.description,
         public.stories.story_content,
         public.stories.main_image,
         public.stories.additional_images,
         public.stories.view_count,
         public.stories.like_count,
         public.stories.is_public,
         public.stories.category,
         public.stories.created_at,
         public.stories.updated_at
  FROM public.stories 
  WHERE public.stories.id = story_id;
END;
$$;

-- Fix the increment_story_views function to properly qualify column names
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
  SET view_count = COALESCE(public.stories.view_count, 0) + 1,
      updated_at = now()
  WHERE public.stories.id = story_id;
  
  RETURN QUERY
  SELECT public.stories.id,
         public.stories.user_id,
         public.stories.title,
         public.stories.description,
         public.stories.story_content,
         public.stories.main_image,
         public.stories.additional_images,
         public.stories.view_count,
         public.stories.like_count,
         public.stories.is_public,
         public.stories.category,
         public.stories.created_at,
         public.stories.updated_at
  FROM public.stories 
  WHERE public.stories.id = story_id;
END;
$$;
