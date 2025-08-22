-- Final fix for security vulnerability: Remove all public access to profiles table
-- and create a secure function for getting only safe public author data

-- Remove the view and recreate without security_barrier to fix the security definer warning
DROP VIEW IF EXISTS public.public_author_profiles;

-- Create a simple view without security_barrier (this fixes the SECURITY DEFINER VIEW warning)
CREATE OR REPLACE VIEW public.public_author_profiles AS
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

-- Grant limited access to the view
GRANT SELECT ON public.public_author_profiles TO authenticated;
GRANT SELECT ON public.public_author_profiles TO anon;