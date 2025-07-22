-- Add missing display_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add foreign key relationship between stories.user_id and profiles.id
ALTER TABLE public.stories 
ADD CONSTRAINT fk_stories_user_id 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;