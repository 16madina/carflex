-- Ajouter une policy pour permettre aux utilisateurs de voir les profils des personnes avec qui ils ont des conversations
CREATE POLICY "Users can view profiles of conversation participants"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT participant1_id FROM conversations WHERE participant2_id = auth.uid()
    UNION
    SELECT participant2_id FROM conversations WHERE participant1_id = auth.uid()
  )
);