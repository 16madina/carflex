
# Correction de l'affichage des drapeaux sur la page d'inscription

## Probleme identifie

Sur la page d'inscription (`Auth.tsx`), les drapeaux de pays sont affiches avec des emoji Unicode (`country.flag`) qui ne s'affichent pas correctement sur Windows. A la place, seuls les codes pays (CI, SN, BJ...) apparaissent.

## Zones concernees

Deux endroits dans le fichier `src/pages/Auth.tsx` utilisent les emoji au lieu du composant SVG:

1. **Selecteur de pays (ligne 509)**: Le dropdown affiche `{country.flag}` (emoji)
2. **Champ telephone (lignes 533-534)**: L'indicatif affiche l'emoji du drapeau du pays selectionne

## Solution

Utiliser le composant `FlagIcon` existant (qui exploite la bibliotheque `country-flag-icons` pour generer des drapeaux SVG) au lieu des emoji. Ce composant fonctionne deja correctement dans `CountrySelector.tsx`.

## Modifications a effectuer

### Fichier: `src/pages/Auth.tsx`

1. **Ajouter l'import du composant FlagIcon** en haut du fichier:
   ```tsx
   import FlagIcon from "@/components/FlagIcon";
   ```

2. **Remplacer l'emoji dans le selecteur de pays** (autour de la ligne 509):
   ```tsx
   // Avant
   <span className="text-lg">{country.flag}</span>
   
   // Apres
   <FlagIcon countryCode={country.code} className="w-5 h-4" />
   ```

3. **Remplacer l'emoji dans le champ telephone** (autour de la ligne 533):
   ```tsx
   // Avant
   <span className="text-lg">
     {WEST_AFRICAN_COUNTRIES.find(c => c.code === signupData.country)?.flag}
   </span>
   
   // Apres
   <FlagIcon countryCode={signupData.country} className="w-5 h-4" />
   ```

## Resultat attendu

Les drapeaux s'afficheront correctement sur toutes les plateformes (Windows, macOS, iOS, Android) car ils seront rendus en SVG plutot qu'en emoji Unicode.
