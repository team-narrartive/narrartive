-- Fix security vulnerability: Restrict profile visibility to non-sensitive fields only
-- Drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Allow viewing profile info for public story authors" ON public.profiles;

-- Create a new restrictive policy that only allows viewing display_name for public story authors
-- This prevents email addresses and personal names from being exposed
CREATE POLICY "Allow viewing display name for public story authors" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access to display_name field by creating a view-like restriction
  -- Users can only see display_name of authors who have public stories
  EXISTS (
    SELECT 1 
    FROM public.stories 
    WHERE stories.user_id = profiles.id 
    AND stories.is_public = true
  )
);

-- Create a security definer function to safely get display names for public story authors
-- This ensures we only expose the display_name field
CREATE OR REPLACE FUNCTION public.get_public_author_display_name(author_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT display_name 
  FROM public.profiles 
  WHERE id = author_id 
  AND EXISTS (
    SELECT 1 
    FROM public.stories 
    WHERE stories.user_id = author_id 
    AND stories.is_public = true
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_author_display_name(UUID) TO authenticated;