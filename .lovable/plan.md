

# Amélioration de l'affichage des drapeaux pays

## Problème identifié
Les drapeaux emoji (🇨🇮, 🇸🇳, 🇧🇯) s'affichent comme des codes pays (CI, SN, BJ) sur **Windows** car ce système d'exploitation ne supporte pas les emoji de drapeaux (Regional Indicator Symbols).

## Impact
- **iOS/Android/macOS** : Les drapeaux s'affichent correctement
- **Windows** : Les drapeaux apparaissent comme des codes à deux lettres

## Solutions proposées

### Option 1 : Utiliser des images de drapeaux (Recommandé)
Remplacer les emoji par des images SVG de drapeaux qui fonctionnent sur tous les systèmes.

**Avantages :**
- Fonctionne sur tous les systèmes (Windows, Mac, iOS, Android)
- Rendu visuel cohérent partout
- Meilleur contrôle sur la taille et le style

**Implémentation :**
1. Installer un package d'icônes de drapeaux (`flag-icons` ou `country-flag-icons`)
2. Modifier `CountryContext.tsx` pour utiliser les codes ISO au lieu des emoji
3. Mettre à jour `CountrySelector.tsx` pour afficher les images SVG

### Option 2 : Utiliser une police emoji (Twemoji)
Utiliser la police Twemoji de Twitter qui rend les emoji de drapeaux comme images.

**Avantages :**
- Pas besoin de changer la structure des données
- Rendu cohérent des emoji

**Inconvénients :**
- Ajoute une dépendance externe
- Légère augmentation du temps de chargement

### Option 3 : Laisser tel quel (Si l'app est principalement mobile)
Puisque l'application cible principalement des utilisateurs mobiles en Afrique, les drapeaux s'afficheront correctement sur leurs appareils.

## Recommandation
**Option 1 (images SVG)** est la plus robuste pour une expérience cohérente sur tous les appareils.

## Fichiers à modifier
- `src/components/CountrySelector.tsx` - Affichage des drapeaux
- `src/components/TopBar.tsx` - Drapeau dans le header (si nécessaire)
- `package.json` - Ajouter la dépendance `country-flag-icons`

## Section technique

### Installation
```bash
npm install country-flag-icons
```

### Modification du CountrySelector
```tsx
import { getCountryCode } from 'country-flag-icons';
import Flags from 'country-flag-icons/react/3x2';

// Dans le composant
const FlagComponent = Flags[country.code];
return <FlagComponent className="w-6 h-4 rounded-sm" />;
```

