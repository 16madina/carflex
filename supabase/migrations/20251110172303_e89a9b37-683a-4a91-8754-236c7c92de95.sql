
-- Ajouter une policy pour permettre à tout le monde de voir le statut d'abonnement Pro des utilisateurs
-- Cela permet d'afficher le badge PRO sur les profils publics
CREATE POLICY "Public can view if user is subscribed (Pro badge)" 
ON public.user_subscriptions 
FOR SELECT 
USING (
  status = 'active' 
  AND current_period_end >= now()
);
