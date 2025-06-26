
-- Add new columns to the stories table to support multiple image versions and better organization
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS image_versions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS generation_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS canvas_data JSONB DEFAULT NULL;

-- Update the existing stories to have proper structure
UPDATE public.stories 
SET image_versions = CASE 
  WHEN additional_images IS NOT NULL AND array_length(additional_images, 1) > 0 THEN
    jsonb_build_array(
      jsonb_build_object(
        'id', gen_random_uuid()::text,
        'images', to_jsonb(additional_images),
        'created_at', created_at,
        'settings', '{}'::jsonb
      )
    )
  ELSE '[]'::jsonb
END
WHERE image_versions = '[]'::jsonb;

-- Note: RLS policies already exist from previous migrations, so we don't need to recreate them
