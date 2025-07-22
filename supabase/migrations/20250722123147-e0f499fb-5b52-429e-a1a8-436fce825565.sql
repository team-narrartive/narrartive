-- Fix ambiguous column references in like functions

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
AS $$
BEGIN
  -- Insert like record (do nothing on conflict, qualified columns)
  INSERT INTO public.user_story_likes (user_id, story_id)
  VALUES (auth.uid(), p_story_id)
  ON CONFLICT (public.user_story_likes.user_id, public.user_story_likes.story_id) DO NOTHING;
  
  -- Only increment if insert happened
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = COALESCE(like_count, 0) + 1,
        updated_at = now()
    WHERE public.stories.id = p_story_id;
  END IF;
  
  -- Return updated story (qualified)
  RETURN QUERY SELECT * FROM public.stories WHERE public.stories.id = p_story_id;
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
AS $$
BEGIN
  -- Delete like record (qualified columns)
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
  
  -- Return updated story (qualified)
  RETURN QUERY SELECT * FROM public.stories WHERE public.stories.id = p_story_id;
END;
$$;