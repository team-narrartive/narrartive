-- Additional security fix: Create a secure view for public profile data
-- The previous policy still allowed access to sensitive columns

-- Drop the previous policy
DROP POLICY IF EXISTS "Allow viewing display name for public story authors" ON public.profiles;

-- Create a secure view that only exposes non-sensitive profile data for public story authors
CREATE OR REPLACE VIEW public.public_author_profiles AS
SELECT 
  p.id,
  p.display_name,
  p.created_at  -- Only expose non-sensitive fields
FROM public.profiles p
WHERE EXISTS (
  SELECT 1 
  FROM public.stories s 
  WHERE s.user_id = p.id 
  AND s.is_public = true
);

-- Enable RLS on the view
ALTER VIEW public.public_author_profiles SET (security_barrier = true);

-- Grant select access to authenticated users on the view
GRANT SELECT ON public.public_author_profiles TO authenticated;
GRANT SELECT ON public.public_author_profiles TO anon;

-- Ensure the profiles table remains secure with no public access except for own profile
-- Keep only the existing secure policies for users to view their own profiles