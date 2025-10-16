-- Add email verification fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS verification_token_expires timestamp with time zone;

-- Create index for verification token lookup
CREATE INDEX IF NOT EXISTS idx_profiles_verification_token ON public.profiles(verification_token);

-- Update existing users to be verified (optional - comment out if you want all users to verify)
-- UPDATE public.profiles SET email_verified = true WHERE email_verified IS NULL;