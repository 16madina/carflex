-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Anyone can upload avatars during signup" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow anyone to upload avatars (for signup)
CREATE POLICY "Anyone can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars');

-- Allow users to delete their own avatar  
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars');