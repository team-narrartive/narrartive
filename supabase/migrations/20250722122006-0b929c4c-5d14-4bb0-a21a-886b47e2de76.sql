-- Re-implement likes from scratch with proper implementation

-- Add like_count column to stories
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create user_story_likes table for tracking who liked what (prevents duplicates)
CREATE TABLE IF NOT EXISTS public.user_story_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Enable RLS on user_story_likes
ALTER TABLE public.user_story_likes ENABLE ROW LEVEL SECURITY;

-- Policies for user_story_likes (users manage their own likes)
CREATE POLICY "Users can view their own likes" 
ON public.user_story_likes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes" 
ON public.user_story_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.user_story_likes FOR DELETE USING (auth.uid() = user_id);

-- Foreign key to stories (cascade delete if story is removed)
ALTER TABLE public.user_story_likes 
ADD CONSTRAINT user_story_likes_story_id_fkey 
FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_story_likes_user_id ON public.user_story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_story_likes_story_id ON public.user_story_likes(story_id);

-- Enable real-time for likes
ALTER TABLE public.user_story_likes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_story_likes;

-- RPC to increment likes (bypasses RLS with SECURITY DEFINER, allows self-likes, only increments if new)
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
  
  -- Only increment if insert happened (FOUND is true)
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

-- RPC to decrement likes (bypasses RLS with SECURITY DEFINER, only decrements if deleted)
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
  -- Delete like record
  DELETE FROM public.user_story_likes 
  WHERE user_id = auth.uid() AND story_id = p_story_id;
  
  -- Only decrement if delete happened (FOUND is true)
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