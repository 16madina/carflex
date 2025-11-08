-- Table pour les signalements de contenu
CREATE TABLE IF NOT EXISTS public.reported_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('sale_listing', 'rental_listing', 'user', 'message')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'scam', 'spam', 'harassment', 'fake', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reported_content_status ON public.reported_content(status);
CREATE INDEX IF NOT EXISTS idx_reported_content_reporter ON public.reported_content(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reported_content_created ON public.reported_content(created_at DESC);

-- Table pour les utilisateurs bloqués
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- Enable RLS
ALTER TABLE public.reported_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour reported_content
CREATE POLICY "Users can create reports"
  ON public.reported_content
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.reported_content
  FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reported_content
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reports"
  ON public.reported_content
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reports"
  ON public.reported_content
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies pour blocked_users
CREATE POLICY "Users can create blocks"
  ON public.blocked_users
  FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks"
  ON public.blocked_users
  FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their blocks"
  ON public.blocked_users
  FOR DELETE
  USING (auth.uid() = blocker_id);

-- Fonction pour vérifier si un utilisateur est bloqué
CREATE OR REPLACE FUNCTION public.is_user_blocked(check_blocker_id UUID, check_blocked_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = check_blocker_id AND blocked_id = check_blocked_id
  )
$$;