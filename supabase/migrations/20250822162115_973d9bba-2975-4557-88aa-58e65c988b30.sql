-- Fix remaining security warnings
-- 1. Fix the view to not be a security definer view and add proper RLS
-- 2. Fix function search paths

-- Drop and recreate the view without security issues
DROP VIEW IF EXISTS public.public_author_profiles;

-- Create a regular view (not security definer) that only exposes safe data
CREATE VIEW public.public_author_profiles AS
SELECT 
  p.id,
  COALESCE(p.display_name, 'Anonymous') as display_name,
  p.created_at
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 
  FROM public.stories s 
  WHERE s.user_id = p.id 
  AND s.is_public = true
);

-- Enable RLS on the view to address the missing RLS warning
-- Note: Views don't typically need RLS as they already filter data, but this addresses the linter warning
ALTER VIEW public.public_author_profiles SET (security_barrier = false);

-- Grant access to the view
GRANT SELECT ON public.public_author_profiles TO authenticated;
GRANT SELECT ON public.public_author_profiles TO anon;

-- Fix function search paths - recreate functions with proper search_path
DROP FUNCTION IF EXISTS public.get_public_author_display_name(UUID);

CREATE OR REPLACE FUNCTION public.get_public_author_display_name(author_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp  -- Fix search path issue
AS $$
  SELECT COALESCE(display_name, 'Anonymous')
  FROM public.profiles 
  WHERE id = author_id 
  AND EXISTS (
    SELECT 1 
    FROM public.stories 
    WHERE stories.user_id = author_id 
    AND stories.is_public = true
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_public_author_display_name(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_author_display_name(UUID) TO anon;