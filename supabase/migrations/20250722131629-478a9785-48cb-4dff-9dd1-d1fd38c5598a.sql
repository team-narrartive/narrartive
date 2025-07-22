-- Fix the minutes_spent calculation specifically
UPDATE public.profiles 
SET minutes_spent = (
  SELECT COUNT(*) * 45
  FROM public.stories 
  WHERE stories.user_id = profiles.id
)
WHERE email = 'maaz.ahmed@cdtm.com';