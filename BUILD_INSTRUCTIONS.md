# 📱 Instructions de Build pour iOS et Android

## 🚀 Étapes de Préparation

### 1. Exporter vers GitHub
1. Cliquez sur le bouton **"Export to Github"** dans Lovable
2. Une fois exporté, clonez votre repository :
   ```bash
   git clone <votre-url-github>
   cd carflex
   ```

### 2. Installation des Dépendances
```bash
npm install
```

### 3. Ajouter les Plateformes Natives

**Pour iOS (nécessite un Mac avec Xcode) :**
```bash
npx cap add ios
npx cap update ios
```

**Pour Android (nécessite Android Studio) :**
```bash
npx cap add android
npx cap update android
```

### 4. Build du Projet
```bash
npm run build
```

### 5. Synchroniser avec les Plateformes Natives
```bash
npx cap sync
```

## 📲 Lancer l'Application

### Sur Android
```bash
npx cap run android
```
Ou ouvrez le projet dans Android Studio :
```bash
npx cap open android
```

### Sur iOS
```bash
npx cap run ios
```
Ou ouvrez le projet dans Xcode :
```bash
npx cap open ios
```

## 🏪 Préparation pour les App Stores

### Pour Apple App Store (iOS)

1. **Prérequis :**
   - Un Mac avec Xcode installé
   - Un compte Apple Developer (99$/an)
   - Certificats et Provisioning Profiles configurés

2. **Configuration dans Xcode :**
   - Ouvrir le projet : `npx cap open ios`
   - Sélectionner votre équipe de développement
   - Configurer le Bundle Identifier
   - Configurer les certificats de signature

3. **Build pour Production :**
   - Sélectionner "Any iOS Device" comme destination
   - Product → Archive
   - Suivre le processus de distribution via App Store Connect

4. **Informations requises :**
   - Icônes d'application (toutes les tailles requises)
   - Screenshots (iPhone et iPad)
   - Description de l'application
   - Mots-clés
   - Catégorie
   - Politique de confidentialité

### Pour Google Play Store (Android)

1. **Prérequis :**
   - Android Studio installé
   - Un compte Google Play Developer (25$ une seule fois)

2. **Générer une Clé de Signature :**
   ```bash
   keytool -genkey -v -keystore carflex-release-key.keystore -alias carflex -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Configuration du Build dans Android Studio :**
   - Ouvrir : `npx cap open android`
   - Build → Generate Signed Bundle / APK
   - Sélectionner "Android App Bundle"
   - Renseigner les informations de la clé

4. **Informations requises :**
   - Icône de l'application (512x512px)
   - Feature Graphic (1024x500px)
   - Screenshots (minimum 2)
   - Description courte et longue
   - Catégorie
   - Politique de confidentialité
   - Classification du contenu

## 🔄 Mises à Jour Futures

Après chaque modification du code :
1. `git pull` (pour récupérer les derniers changements)
2. `npm install` (si de nouvelles dépendances)
3. `npm run build`
4. `npx cap sync`
5. Tester sur émulateur ou device
6. Créer un nouveau build pour les stores si tout fonctionne

## ⚠️ Points Importants

### Configuration pour Production
- Le fichier `capacitor.config.ts` est déjà configuré pour la production
- L'URL du serveur de développement est commentée
- L'app utilisera les fichiers locaux buildés

### Permissions
L'application demande les permissions suivantes :
- **Caméra** : Pour prendre des photos des véhicules
- **Photos** : Pour sélectionner des images de la galerie
- **Géolocalisation** : Pour afficher les annonces à proximité
- **Notifications Push** : Pour les alertes et messages

### Variables d'Environnement
Assurez-vous que toutes vos clés API et secrets sont bien configurés :
- Variables Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- Clés Stripe
- Autres services externes

## 📚 Ressources Utiles

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide iOS App Store](https://developer.apple.com/app-store/submissions/)
- [Guide Google Play](https://developer.android.com/distribute)
- [Blog Lovable - Capacitor Setup](https://docs.lovable.dev)

## 🆘 Dépannage

### ❌ L'application crash au démarrage (Android)

Si l'application se ferme immédiatement après son lancement sur Android, cela est souvent lié à une mauvaise configuration du splash screen.

**Solutions :**

1. **Vérifier la configuration du splash screen dans `capacitor.config.ts`** :
   ```typescript
   SplashScreen: {
     launchShowDuration: 3000,  // ❌ NE PAS mettre 0
     launchAutoHide: true,
     launchFadeOutDuration: 300,
     useDialog: true,  // ✅ Important pour éviter les crashes SurfaceControl
     splashImmersive: false,  // ✅ false pour compatibilité Android 12+
     splashFullScreen: true,
     backgroundColor: "#ffffff"
   }
   ```

2. **Créer les ressources splash screen** :
   Créez des images splash dans `android/app/src/main/res/` :
   - `drawable-land-xxhdpi/splash.png` (1920x1080px)
   - `drawable-land-xhdpi/splash.png` (1280x720px)
   - `drawable-port-xxhdpi/splash.png` (1080x1920px)
   - `drawable-port-xhdpi/splash.png` (720x1280px)
   
   💡 **Conseil** : Utilisez une image simple avec le logo CarFlex centré sur fond blanc.

3. **Après toute modification** :
   ```bash
   npm run build
   npx cap sync android
   npx cap run android
   ```

### 🔧 Autres Problèmes Courants

**Erreur de build :**
- Vérifiez que toutes les dépendances sont installées
- Essayez `npm run build` pour voir les erreurs
- Nettoyez le cache : `rm -rf node_modules && npm install`

**Erreur de sync :**
- Supprimez les dossiers `ios` et `android`
- Relancez `npx cap add ios` et `npx cap add android`
- Puis `npx cap sync`

**Problèmes de permissions :**
- Vérifiez les fichiers `AndroidManifest.xml` et `Info.plist`
- Ajoutez les descriptions pour chaque permission demandée

---

**Bonne chance pour la publication de votre application ! 🎉**
