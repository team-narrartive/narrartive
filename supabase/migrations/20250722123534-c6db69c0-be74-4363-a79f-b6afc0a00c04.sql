-- Final fix for ambiguous column references - use explicit column list instead of SELECT *

CREATE OR REPLACE FUNCTION public.increment_story_likes(p_story_id UUID)
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert like record (do nothing on conflict)
  INSERT INTO public.user_story_likes (user_id, story_id)
  VALUES (auth.uid(), p_story_id)
  ON CONFLICT (user_id, story_id) DO NOTHING;
  
  -- Only increment if insert happened
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = COALESCE(like_count, 0) + 1,
        updated_at = now()
    WHERE public.stories.id = p_story_id;
  END IF;
  
  -- Return updated story with explicit column list to avoid ambiguity
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.title,
    s.description,
    s.story_content,
    s.main_image,
    s.additional_images,
    s.view_count,
    s.like_count,
    s.is_public,
    s.category,
    s.created_at,
    s.updated_at
  FROM public.stories s
  WHERE s.id = p_story_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_story_likes(p_story_id UUID)
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete like record (qualified columns to avoid ambiguity)
  DELETE FROM public.user_story_likes 
  WHERE public.user_story_likes.user_id = auth.uid() 
    AND public.user_story_likes.story_id = p_story_id;
  
  -- Only decrement if delete happened
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0),
        updated_at = now()
    WHERE public.stories.id = p_story_id;
  END IF;
  
  -- Return updated story with explicit column list to avoid ambiguity
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.title,
    s.description,
    s.story_content,
    s.main_image,
    s.additional_images,
    s.view_count,
    s.like_count,
    s.is_public,
    s.category,
    s.created_at,
    s.updated_at
  FROM public.stories s
  WHERE s.id = p_story_id;
END;
$$;