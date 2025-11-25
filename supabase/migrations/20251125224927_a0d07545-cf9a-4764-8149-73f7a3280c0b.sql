-- Ajouter les colonnes pour la période de grâce de 30 jours
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Créer un index pour optimiser la recherche des comptes à supprimer
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_scheduled 
ON public.profiles(deletion_scheduled_at) 
WHERE deletion_scheduled_at IS NOT NULL AND deleted_at IS NULL;

-- Fonction pour supprimer définitivement les comptes expirés
CREATE OR REPLACE FUNCTION delete_expired_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expired_user RECORD;
BEGIN
  FOR expired_user IN 
    SELECT id 
    FROM profiles 
    WHERE deletion_scheduled_at IS NOT NULL 
    AND deleted_at IS NULL
    AND deletion_scheduled_at < NOW()
  LOOP
    -- Supprimer l'utilisateur via auth.admin
    PERFORM auth.admin.delete_user(expired_user.id::uuid);
    
    -- Marquer comme supprimé dans profiles (au cas où)
    UPDATE profiles 
    SET deleted_at = NOW() 
    WHERE id = expired_user.id;
    
    RAISE NOTICE 'Compte supprimé définitivement: %', expired_user.id;
  END LOOP;
END;
$$;