-- Add banned status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;

-- Create warnings table for user warnings
CREATE TABLE IF NOT EXISTS public.user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warning_message TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on warnings table
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own warnings
CREATE POLICY "Users can view their own warnings"
ON public.user_warnings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can create warnings
CREATE POLICY "Admins can create warnings"
ON public.user_warnings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Policy: Admins can view all warnings
CREATE POLICY "Admins can view all warnings"
ON public.user_warnings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete warnings
CREATE POLICY "Admins can delete warnings"
ON public.user_warnings
FOR DELETE
USING (has_role(auth.uid(), 'admin'));