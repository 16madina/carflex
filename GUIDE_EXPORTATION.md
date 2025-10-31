# 📱 GUIDE D'EXPORTATION CARFLEX - iOS & Android

## ✅ CE QUI A ÉTÉ FAIT POUR VOUS

Votre application est maintenant **PRÊTE pour l'exportation** ! Voici ce qui a été préparé :

### Android ✅
- ✅ Permissions complètes ajoutées (Caméra, Photos, Localisation)
- ✅ Dépendances installées
- ✅ Projet buildé pour production
- ✅ Synchronisé avec Capacitor
- ✅ Firebase configuré (google-services.json)
- ✅ Clé de signature présente (`key jks/carflex-key.jks`)

### Configurations générales ✅
- ✅ Safe Areas iOS/Android configurées
- ✅ Splash Screen natif configuré
- ✅ Push Notifications configurées
- ✅ Intégration Stripe sécurisée
- ✅ Variables d'environnement configurées

---

## 🚀 EXPORTATION ANDROID (APK/AAB)

### Méthode 1 : Avec Android Studio (Recommandé)

#### Étape 1 : Ouvrir le projet
```bash
npx cap open android
```

#### Étape 2 : Dans Android Studio
1. Attendez que Gradle finisse de charger (barre en bas)
2. Allez dans **Build → Generate Signed Bundle / APK**
3. Sélectionnez **Android App Bundle** (pour Google Play Store)
   - OU sélectionnez **APK** (pour test ou distribution directe)
4. Cliquez sur **Next**

#### Étape 3 : Configuration de la clé de signature

**Option A : Utiliser la clé existante**
- Key store path : `[Votre projet]/key jks/carflex-key.jks`
- Key store password : `[Votre mot de passe]`
- Key alias : `carflex`
- Key password : `[Votre mot de passe]`

**Option B : Créer une nouvelle clé**
1. Cliquez sur **Create new...**
2. Remplissez les informations :
   - Key store path : Choisissez un emplacement sûr
   - Password : Créez un mot de passe fort (NOTEZ-LE !)
   - Alias : `carflex`
   - Validity : 25 ans minimum
   - Certificate :
     - First and Last Name : Votre nom
     - Organizational Unit : CarFlex
     - Organization : Votre organisation
     - City : Votre ville
     - State : Votre région
     - Country Code : Votre pays (ex: FR)
3. Cliquez sur **OK**

⚠️ **IMPORTANT** : Sauvegardez votre fichier `.jks` et vos mots de passe dans un endroit sûr ! Sans eux, vous ne pourrez pas mettre à jour votre application.

#### Étape 4 : Build final
1. Sélectionnez **release** comme Build Type
2. Cochez **V1 (Jar Signature)** et **V2 (Full APK Signature)**
3. Cliquez sur **Finish**
4. Attendez que le build se termine

#### Étape 5 : Localiser votre fichier
- **AAB** : `android/app/release/app-release.aab`
- **APK** : `android/app/release/app-release.apk`

### Méthode 2 : Ligne de commande (Avancé)

```bash
# 1. Générer un APK signé
cd android
./gradlew assembleRelease

# 2. Signer l'APK manuellement
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore ../key\ jks/carflex-key.jks \
  app/build/outputs/apk/release/app-release-unsigned.apk carflex

# 3. Zipalign
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk \
  app/build/outputs/apk/release/app-release-signed.apk
```

---

## 🍎 EXPORTATION iOS (IPA)

### Prérequis
- ✅ Mac avec macOS (requis)
- ✅ Xcode installé (gratuit sur App Store)
- ✅ Compte Apple Developer (99$/an pour publier)

### Étape 1 : Créer le projet iOS (si pas déjà fait)
```bash
npx cap add ios
npx cap update ios
```

### Étape 2 : Ouvrir le projet
```bash
npx cap open ios
```

### Étape 3 : Configuration dans Xcode

#### A. Configuration générale
1. Sélectionnez le projet **App** dans la barre latérale
2. Dans l'onglet **General** :
   - **Display Name** : CarFlex
   - **Bundle Identifier** : `com.missdee.carflextest` (ou changez-le)
   - **Version** : 1.0.0
   - **Build** : 1

#### B. Équipe de développement
1. Dans **Signing & Capabilities** :
   - Cochez **Automatically manage signing**
   - Sélectionnez votre **Team** (votre compte Apple Developer)
   - Xcode générera automatiquement les certificats

#### C. Permissions (Info.plist)
Vérifiez que ces descriptions sont présentes :
- **NSCameraUsageDescription** : "CarFlex a besoin d'accéder à votre caméra pour prendre des photos de véhicules"
- **NSPhotoLibraryUsageDescription** : "CarFlex a besoin d'accéder à vos photos pour sélectionner des images"
- **NSLocationWhenInUseUsageDescription** : "CarFlex utilise votre localisation pour afficher les annonces à proximité"

### Étape 4 : Build pour test (Simulateur ou Device)
1. Sélectionnez votre appareil ou simulateur en haut
2. Cliquez sur **Product → Run** (⌘R)
3. L'application s'installera et se lancera

### Étape 5 : Archive pour distribution (App Store)
1. Sélectionnez **Any iOS Device (arm64)** comme destination
2. Cliquez sur **Product → Archive**
3. Attendez que l'archive se crée (peut prendre 5-10 min)
4. La fenêtre **Organizer** s'ouvre automatiquement

### Étape 6 : Distribution
1. Sélectionnez votre archive
2. Cliquez sur **Distribute App**
3. Choisissez une méthode :
   - **App Store Connect** : Pour publier sur l'App Store
   - **Ad Hoc** : Pour tester sur des appareils spécifiques
   - **Development** : Pour votre équipe de dev
4. Suivez les étapes (Xcode gère tout automatiquement)

---

## 📤 PUBLICATION SUR LES STORES

### Google Play Store (Android)

#### Prérequis
- ✅ Compte Google Play Developer (25$ une seule fois)
- ✅ Fichier AAB signé
- ✅ Icônes et captures d'écran

#### Étapes
1. Allez sur [Google Play Console](https://play.google.com/console)
2. Cliquez sur **Créer une application**
3. Remplissez les informations :
   - Nom : CarFlex
   - Langue : Français
   - Type : Application
   - Gratuite ou payante : (votre choix)
4. Allez dans **Production** → **Créer une version**
5. Uploadez votre fichier **AAB**
6. Remplissez :
   - Fiche store (description, captures d'écran)
   - Classification du contenu
   - Public cible
   - Politique de confidentialité (URL requise)
7. Soumettez pour révision

**Délai de révision** : 2-7 jours généralement

#### Captures d'écran requises
- 📱 Téléphone : 2-8 screenshots
  - Portrait : 320x640 à 3840x7680 px
- 📱 Tablette 7" : 1-8 screenshots (optionnel)
- 📱 Tablette 10" : 1-8 screenshots (optionnel)

### Apple App Store (iOS)

#### Prérequis
- ✅ Compte Apple Developer (99$/an)
- ✅ Archive IPA
- ✅ Icônes et captures d'écran

#### Étapes
1. Allez sur [App Store Connect](https://appstoreconnect.apple.com)
2. Cliquez sur **Mes Apps → +** → **Nouvelle app**
3. Remplissez :
   - Nom : CarFlex
   - Langue : Français
   - Bundle ID : com.missdee.carflextest
   - SKU : CARFLEX001
4. Dans l'archive Xcode Organizer :
   - Cliquez sur **Distribute App** → **App Store Connect**
   - Votre build sera uploadé automatiquement
5. Dans App Store Connect :
   - Ajoutez captures d'écran
   - Remplissez description, mots-clés
   - Ajoutez politique de confidentialité
   - Sélectionnez la version uploadée
6. Soumettez pour révision

**Délai de révision** : 24-48h généralement (peut aller jusqu'à 1 semaine)

#### Captures d'écran requises
- 📱 iPhone 6.7" (iPhone 15 Pro Max) : Requis
- 📱 iPhone 6.5" (iPhone 11 Pro Max) : Requis
- 📱 iPhone 5.5" (iPhone 8 Plus) : Optionnel
- 📱 iPad Pro 12.9" : Requis si support iPad

---

## 🎨 RESSOURCES GRAPHIQUES NÉCESSAIRES

### Icône d'application

#### Android
Placez vos icônes dans :
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

**Outil recommandé** : [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

#### iOS
Dans Xcode :
1. Ouvrez `ios/App/App/Assets.xcassets`
2. Cliquez sur **AppIcon**
3. Faites glisser vos icônes dans les cases appropriées

Tailles requises : 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

**Outil recommandé** : [AppIcon.co](https://appicon.co/)

### Splash Screen

#### Android
Placez vos images splash dans :
- `android/app/src/main/res/drawable-land-xxhdpi/splash.png` (1920x1080)
- `android/app/src/main/res/drawable-land-xhdpi/splash.png` (1280x720)
- `android/app/src/main/res/drawable-port-xxhdpi/splash.png` (1080x1920)
- `android/app/src/main/res/drawable-port-xhdpi/splash.png` (720x1280)

#### iOS
Dans Xcode :
1. Ouvrez `ios/App/App/Assets.xcassets`
2. Cliquez sur **Splash**
3. Ajoutez vos images

---

## 🔧 APRÈS CHAQUE MODIFICATION DU CODE

```bash
# 1. Pull les dernières modifications (si travail en équipe)
git pull

# 2. Installer les nouvelles dépendances (si nécessaire)
npm install

# 3. Builder le projet
npm run build

# 4. Synchroniser avec les plateformes natives
npx cap sync

# 5. Tester
# Android :
npx cap run android

# iOS :
npx cap run ios
```

---

## ❓ TROUBLESHOOTING

### Android

#### Erreur : "SDK not found"
```bash
# Définir ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# ou
export ANDROID_HOME=$HOME/Android/Sdk  # Linux
```

#### Erreur : "Execution failed for task ':app:validateSigningRelease'"
- Vérifiez que votre fichier .jks existe
- Vérifiez les mots de passe de signature

#### L'app crash au démarrage
1. Vérifiez les logs : `adb logcat | grep CarFlex`
2. Vérifiez que le splash screen est correctement configuré
3. Vérifiez que toutes les ressources existent

### iOS

#### Erreur : "Signing for requires a development team"
- Sélectionnez votre Team dans Signing & Capabilities

#### Erreur : "Module 'Capacitor' not found"
```bash
cd ios/App
pod install
```

#### L'app ne s'installe pas sur le device
- Vérifiez que votre device est dans les Provisioning Profiles
- Allez dans Réglages → Général → Gestion des appareils → Faites confiance

---

## 📋 CHECKLIST FINALE AVANT SOUMISSION

### Technique
- [ ] L'application se lance sans crash
- [ ] Toutes les fonctionnalités marchent
- [ ] Les permissions sont correctement demandées
- [ ] Pas d'erreurs dans les logs
- [ ] Testé sur plusieurs appareils/simulateurs
- [ ] Version et Build number corrects

### Store
- [ ] Icône d'application créée (toutes tailles)
- [ ] Splash screen créé
- [ ] Captures d'écran prises (au moins 2)
- [ ] Description rédigée
- [ ] Mots-clés définis (iOS)
- [ ] Politique de confidentialité publiée (URL accessible)
- [ ] Catégorie sélectionnée
- [ ] Classification du contenu complétée

### Légal
- [ ] Politique de confidentialité conforme RGPD
- [ ] Conditions d'utilisation rédigées
- [ ] Mentions légales présentes
- [ ] Consentement cookies si applicable

---

## 📞 RESSOURCES ET SUPPORT

### Documentation officielle
- [Capacitor](https://capacitorjs.com/docs)
- [Android Developer](https://developer.android.com)
- [Apple Developer](https://developer.apple.com)
- [Google Play Console](https://support.google.com/googleplay/android-developer)
- [App Store Connect](https://developer.apple.com/app-store-connect/)

### Outils utiles
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [AppIcon.co](https://appicon.co/) - Générateur d'icônes
- [Figma](https://figma.com) - Design des captures d'écran
- [Fastlane](https://fastlane.tools/) - Automatisation des builds

---

## 🎉 FÉLICITATIONS !

Votre application CarFlex est maintenant prête à être partagée avec le monde ! 🚀

**Bon succès avec votre publication ! 🎊**

---

*Dernière mise à jour : 2025-10-31*
