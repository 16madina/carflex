-- Add TikTok URL column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tiktok_url TEXT;