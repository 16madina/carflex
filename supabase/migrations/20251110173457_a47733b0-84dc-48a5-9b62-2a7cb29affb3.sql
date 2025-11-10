
-- Supprimer l'ancienne politique trop restrictive
DROP POLICY IF EXISTS "Public can view sellers basic info without contact" ON public.profiles;

-- Créer une nouvelle politique permettant la visualisation publique des profils de vendeurs/agents/concessionnaires
-- même sans annonces actives (utile pour les nouveaux utilisateurs et les profils publics)
CREATE POLICY "Public can view sellers profiles"
ON public.profiles
FOR SELECT
TO public
USING (
  user_type IN ('seller', 'dealer', 'agent')
);
