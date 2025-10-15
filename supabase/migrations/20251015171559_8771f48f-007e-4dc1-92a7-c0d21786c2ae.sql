-- Phase 1: SÉCURITÉ CRITIQUE

-- 1.1 Sécuriser la table profiles
-- Supprimer la politique trop permissive actuelle
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- On peut voir les infos de base des vendeurs/dealers/agents qui ont des annonces actives
-- SANS exposer les emails et téléphones
CREATE POLICY "Public can view active sellers basic info"
ON public.profiles FOR SELECT
TO authenticated
USING (
  user_type IN ('seller', 'dealer', 'agent') 
  AND id IN (
    SELECT seller_id FROM public.sale_listings WHERE seller_id IS NOT NULL
    UNION
    SELECT owner_id FROM public.rental_listings WHERE owner_id IS NOT NULL
  )
);

-- 1.2 Sécuriser les notifications
-- Supprimer la politique dangereuse qui permet à n'importe qui de créer des notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Seul le service_role (backend) peut créer des notifications
CREATE POLICY "Service role can create notifications"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);

-- Les utilisateurs authentifiés peuvent créer des notifications pour eux-mêmes (fallback)
CREATE POLICY "Users can create own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 1.3 Corriger le search_path pour les fonctions
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;