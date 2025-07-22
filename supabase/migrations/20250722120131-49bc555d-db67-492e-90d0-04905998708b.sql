-- Recreate increment_story_likes: allow self-likes, only increment if actually liked, bypass RLS with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.increment_story_likes(story_id UUID)
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
AS $$
BEGIN
  -- Insert like record (do nothing on conflict)
  INSERT INTO public.user_story_likes (user_id, story_id)
  VALUES (auth.uid(), story_id)
  ON CONFLICT (user_id, story_id) DO NOTHING;
  
  -- Only increment if the insert actually happened (FOUND is true)
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = COALESCE(like_count, 0) + 1,
        updated_at = now()
    WHERE public.stories.id = story_id;
  END IF;
  
  -- Always return the current story state
  RETURN QUERY
  SELECT * FROM public.stories 
  WHERE public.stories.id = story_id;
END;
$$;

-- Recreate decrement_story_likes: only decrement if actually unliked, bypass RLS with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.decrement_story_likes(story_id UUID)
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
AS $$
BEGIN
  -- Delete like record (only if it exists and belongs to caller)
  DELETE FROM public.user_story_likes 
  WHERE user_id = auth.uid() 
  AND story_id = decrement_story_likes.story_id;
  
  -- Only decrement if the delete actually happened (FOUND is true)
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0),
        updated_at = now()
    WHERE public.stories.id = story_id;
  END IF;
  
  -- Always return the current story state
  RETURN QUERY
  SELECT * FROM public.stories 
  WHERE public.stories.id = story_id;
END;
$$;