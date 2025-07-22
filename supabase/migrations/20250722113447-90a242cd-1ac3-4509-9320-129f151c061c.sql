-- Enable real-time for stories table
ALTER TABLE public.stories REPLICA IDENTITY FULL;

-- Add stories table to realtime publication  
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;

-- Enable real-time for user_story_likes table
ALTER TABLE public.user_story_likes REPLICA IDENTITY FULL;

-- Add user_story_likes table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_story_likes;