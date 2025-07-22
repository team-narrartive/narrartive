-- Drop and recreate like functions to fix return type and eliminate ambiguity

DROP FUNCTION public.increment_story_likes(UUID);
DROP FUNCTION public.decrement_story_likes(UUID);

CREATE OR REPLACE FUNCTION public.increment_story_likes(p_story_id UUID)
RETURNS SETOF public.stories
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
    WHERE id = p_story_id;
  END IF;
  
  -- Return updated story
  RETURN QUERY SELECT * FROM public.stories WHERE id = p_story_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_story_likes(p_story_id UUID)
RETURNS SETOF public.stories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete like record
  DELETE FROM public.user_story_likes 
  WHERE user_id = auth.uid() AND story_id = p_story_id;
  
  -- Only decrement if delete happened
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0),
        updated_at = now()
    WHERE id = p_story_id;
  END IF;
  
  -- Return updated story
  RETURN QUERY SELECT * FROM public.stories WHERE id = p_story_id;
END;
$$;