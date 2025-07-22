-- Fix ambiguous column reference in like functions

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
  -- Insert like record (do nothing on conflict) - properly qualify user_id
  INSERT INTO public.user_story_likes (user_id, story_id)
  VALUES (auth.uid(), p_story_id)
  ON CONFLICT (user_id, story_id) DO NOTHING;
  
  -- Only increment if insert happened (FOUND is true)
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = COALESCE(public.stories.like_count, 0) + 1,
        updated_at = now()
    WHERE public.stories.id = p_story_id;
  END IF;
  
  -- Return updated story - properly qualify all columns
  RETURN QUERY
  SELECT 
    public.stories.id,
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
  WHERE public.stories.id = p_story_id;
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
  -- Delete like record - properly qualify user_id columns
  DELETE FROM public.user_story_likes 
  WHERE public.user_story_likes.user_id = auth.uid() 
  AND public.user_story_likes.story_id = p_story_id;
  
  -- Only decrement if delete happened (FOUND is true)
  IF FOUND THEN
    UPDATE public.stories 
    SET like_count = GREATEST(COALESCE(public.stories.like_count, 0) - 1, 0),
        updated_at = now()
    WHERE public.stories.id = p_story_id;
  END IF;
  
  -- Return updated story - properly qualify all columns
  RETURN QUERY
  SELECT 
    public.stories.id,
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
  WHERE public.stories.id = p_story_id;
END;
$$;