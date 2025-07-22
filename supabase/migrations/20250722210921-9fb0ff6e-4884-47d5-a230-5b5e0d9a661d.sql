-- Create a public storage bucket for story images
INSERT INTO storage.buckets (id, name, public) VALUES ('story-images', 'story-images', true);

-- Create storage policies for the story-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload story images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-images' AND 
  auth.role() = 'authenticated'
);

-- Allow public read access to all story images
CREATE POLICY "Public read access to story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- Allow users to delete their own story images
CREATE POLICY "Users can delete their own story images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'story-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);