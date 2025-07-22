-- Allow users to view basic profile info for authors of public stories
CREATE POLICY "Allow viewing profile info for public story authors"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.user_id = profiles.id 
    AND stories.is_public = true
  )
);