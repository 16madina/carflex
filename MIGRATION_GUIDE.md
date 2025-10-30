# 📋 GUIDE DE MIGRATION - BUCKET VEHICLE-IMAGES

## Pourquoi créer un nouveau bucket ?

Actuellement, les images de véhicules sont stockées dans le bucket `avatars`, ce qui :
- Mélange les types de données
- Rend difficile la gestion des permissions
- Complique la maintenance

## Étapes de création du bucket

### 1. Créer le bucket dans Supabase Dashboard

```sql
-- Se connecter au Dashboard Supabase
-- Aller dans Storage > Create a new bucket
-- Nom: vehicle-images
-- Public: true (pour afficher les images)
```

### 2. Configurer les policies RLS

```sql
-- Policy pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload vehicle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-images');

-- Policy pour permettre la lecture publique
CREATE POLICY "Public can view vehicle images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vehicle-images');

-- Policy pour permettre la suppression uniquement au propriétaire
CREATE POLICY "Users can delete own vehicle images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Migrer le code

#### Dans SellForm.tsx

**AVANT :**
```typescript
const { error: uploadError } = await supabase.storage
  .from("avatars")
  .upload(fileName, file);
```

**APRÈS :**
```typescript
const { error: uploadError } = await supabase.storage
  .from("vehicle-images")
  .upload(fileName, file);
```

#### Dans RentForm.tsx (même changement)

Rechercher toutes les occurrences de `.from("avatars")` dans les formulaires de véhicules et remplacer par `.from("vehicle-images")`.

### 4. Migration des données existantes (optionnel)

Si vous avez déjà des images de véhicules dans `avatars` :

```typescript
// Script de migration à exécuter UNE SEULE FOIS
async function migrateVehicleImages() {
  // 1. Lister toutes les images de véhicules dans avatars
  const { data: files } = await supabase.storage
    .from('avatars')
    .list();
  
  // 2. Copier vers vehicle-images
  for (const file of files) {
    if (file.name.includes('vehicle_') || /* autre pattern */) {
      const { data } = await supabase.storage
        .from('avatars')
        .download(file.name);
      
      await supabase.storage
        .from('vehicle-images')
        .upload(file.name, data);
    }
  }
  
  // 3. Mettre à jour les URLs dans la base de données
  // (voir section suivante)
}
```

### 5. Mettre à jour les URLs en base

```sql
-- Mettre à jour sale_listings
UPDATE sale_listings
SET images = (
  SELECT jsonb_agg(
    replace(img::text, '/avatars/', '/vehicle-images/')::jsonb
  )
  FROM jsonb_array_elements(images) img
)
WHERE images IS NOT NULL;

-- Mettre à jour rental_listings
UPDATE rental_listings
SET images = (
  SELECT jsonb_agg(
    replace(img::text, '/avatars/', '/vehicle-images/')::jsonb
  )
  FROM jsonb_array_elements(images) img
)
WHERE images IS NOT NULL;
```

## Fichiers à modifier

- ✅ `/workspace/src/pages/SellForm.tsx` (ligne ~125)
- ✅ `/workspace/src/pages/RentForm.tsx` (même zone)
- ✅ Tout autre composant uploadant des images de véhicules

## Test après migration

1. Créer une nouvelle annonce avec images
2. Vérifier que les images s'affichent correctement
3. Vérifier les permissions (lecture publique, suppression propriétaire)
4. Tester sur mobile (Capacitor)

## En cas de problème

Si les images ne s'affichent plus :
1. Vérifier que le bucket est bien PUBLIC
2. Vérifier les policies RLS
3. Vérifier les URLs dans la base de données
4. Vider le cache navigateur

## Note importante

⚠️ **NE PAS** supprimer le bucket `avatars` - il contient toujours les vraies photos de profil !
