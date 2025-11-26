# 🔴 FIX DÉFINITIF - Recréer le Projet iOS

## Problème
Les pods Capacitor restent corrompus après réinstallation. 19 erreurs dans SplashScreen natif.

## ✅ Solution Radicale (Garantie)

### ÉTAPE 1 : Sauvegarder les Fichiers Personnalisés

Si vous avez des certificats, provisioning profiles, ou configurations spécifiques :

```bash
# Créer un backup du dossier ios
cd /path/to/your/project
cp -r ios ios_backup_$(date +%Y%m%d_%H%M%S)
```

### ÉTAPE 2 : Supprimer Complètement iOS

```bash
# Fermer Xcode d'abord (⌘Q)
killall Xcode

# À la racine du projet
npx cap remove ios

# Vérifier que le dossier ios est supprimé
ls -la
# Le dossier ios ne doit plus exister
```

### ÉTAPE 3 : Nettoyer les Caches Système

```bash
# Supprimer tous les caches Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Caches/com.apple.dt.Xcode
rm -rf ~/Library/Caches/org.cocoapods.pods

# Supprimer les caches CocoaPods
rm -rf ~/.cocoapods
```

### ÉTAPE 4 : Mettre à Jour CocoaPods

```bash
# Mettre à jour CocoaPods (peut prendre 2-3 minutes)
sudo gem install cocoapods

# Vérifier la version (doit être >= 1.11.0)
pod --version

# Setup CocoaPods
pod setup
```

### ÉTAPE 5 : Vérifier les Versions Capacitor

Vérifier dans `package.json` que toutes les versions Capacitor sont cohérentes :

```json
{
  "@capacitor/core": "^7.4.3",
  "@capacitor/cli": "^7.4.3",
  "@capacitor/ios": "^7.4.3",
  "@capacitor/android": "^7.4.3",
  "@capacitor/camera": "^7.0.2",
  "@capacitor/push-notifications": "^7.0.3",
  "@capacitor/splash-screen": "^7.0.3",
  "capacitor-plugin-app-tracking-transparency": "^2.0.5"
}
```

Si les versions ne correspondent pas :

```bash
# Réinstaller Capacitor avec les bonnes versions
npm install @capacitor/core@latest @capacitor/cli@latest
npm install @capacitor/ios@latest @capacitor/android@latest
npm install @capacitor/camera@latest @capacitor/push-notifications@latest
npm install @capacitor/splash-screen@latest
npm install capacitor-plugin-app-tracking-transparency@latest
```

### ÉTAPE 6 : Recréer le Projet iOS

```bash
# À la racine du projet
npx cap add ios

# Cela va :
# 1. Créer un nouveau dossier ios/
# 2. Générer les fichiers Xcode
# 3. Créer le Podfile
# 4. Copier les assets web
```

### ÉTAPE 7 : Installer les Pods

```bash
cd ios/App

# Installer les pods avec les dernières versions
pod install --repo-update --verbose

# Cela devrait afficher quelque chose comme :
# Installing Capacitor (7.4.3)
# Installing CapacitorCamera (7.0.2)
# Installing CapacitorPushNotifications (7.0.3)
# Installing CapacitorSplashScreen (7.0.3)
# Installing CapacitorPluginAppTrackingTransparency (2.0.5)
```

### ÉTAPE 8 : Restaurer les Configurations Personnalisées

Si vous aviez des configurations spécifiques dans le backup :

#### A. Info.plist
Copier ces clés depuis `ios_backup.../App/App/Info.plist` vers `ios/App/App/Info.plist` :
- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSUserTrackingUsageDescription`
- etc.

#### B. Signing & Capabilities
Dans Xcode :
1. Ouvrir `ios/App/App.xcworkspace`
2. Sélectionner le target "App"
3. Onglet "Signing & Capabilities"
4. Reconfigurer Team, Bundle ID, etc.

#### C. Assets (Icônes, Splash)
Copier depuis le backup :
```bash
cp -r ios_backup.../App/App/Assets.xcassets/* ios/App/App/Assets.xcassets/
```

### ÉTAPE 9 : Build Final

```bash
# Ouvrir Xcode
open ios/App/App.xcworkspace
```

Dans Xcode :
1. **Product** → **Clean Build Folder** (⇧⌘K)
2. Sélectionner un simulateur (ex: iPhone 16 Pro Max)
3. **Product** → **Build** (⌘B)

### ✅ Résultat Attendu

- ✅ **0 erreur** dans le build
- ✅ Tous les plugins fonctionnent
- ✅ L'app démarre correctement

## 🚨 Si Ça Échoue Encore

### Vérification 1 : Version Xcode
```bash
xcodebuild -version
```

Minimum requis : **Xcode 14.0**  
Recommandé : **Xcode 15.0+**

Si vous avez une version trop ancienne :
1. Télécharger la dernière version depuis Mac App Store
2. Installer
3. Recommencer depuis l'ÉTAPE 3

### Vérification 2 : Command Line Tools
```bash
xcode-select -p
```

Doit afficher : `/Applications/Xcode.app/Contents/Developer`

Si ce n'est pas le cas :
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcode-select --install
```

### Vérification 3 : Versions Node/NPM
```bash
node -v
npm -v
```

Minimum requis :
- **Node.js** : 18.0.0+
- **npm** : 8.0.0+

Si trop ancien :
```bash
# Installer nvm si pas déjà fait
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Installer Node LTS
nvm install --lts
nvm use --lts
```

## 📋 Checklist Complète

Avant de commencer, vérifier :
- [ ] Xcode 14.0+ installé
- [ ] Command Line Tools installés
- [ ] CocoaPods 1.11.0+ installé
- [ ] Node.js 18.0.0+ installé
- [ ] Toutes les versions Capacitor cohérentes dans package.json

Étapes :
- [ ] Backup du dossier ios (si nécessaire)
- [ ] `npx cap remove ios`
- [ ] Nettoyer caches système
- [ ] Mettre à jour CocoaPods
- [ ] Vérifier versions dans package.json
- [ ] `npx cap add ios`
- [ ] `cd ios/App && pod install --repo-update`
- [ ] Restaurer configurations personnalisées
- [ ] Ouvrir `App.xcworkspace` dans Xcode
- [ ] Clean Build Folder
- [ ] Build

## 🎯 Script Automatique

Pour automatiser, créer un fichier `rebuild-ios.sh` :

```bash
#!/bin/bash

echo "🔴 Suppression du projet iOS..."
npx cap remove ios

echo "🧹 Nettoyage des caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Caches/com.apple.dt.Xcode

echo "📦 Mise à jour CocoaPods..."
sudo gem install cocoapods

echo "🆕 Création du projet iOS..."
npx cap add ios

echo "📱 Installation des pods..."
cd ios/App
pod install --repo-update

echo "✅ Terminé ! Ouvrir Xcode..."
open App.xcworkspace
```

Rendre exécutable et lancer :
```bash
chmod +x rebuild-ios.sh
./rebuild-ios.sh
```

## 💡 Conseil Final

Si TOUTES ces étapes échouent, c'est probablement :
1. Un problème avec votre installation Xcode → Réinstaller Xcode
2. Un problème avec votre macOS → Mettre à jour macOS
3. Un conflit avec d'autres outils de dev → Nettoyer complètement votre environnement

Dans ce cas, je recommande de créer un nouveau projet test minimal pour vérifier que Capacitor fonctionne sur votre machine.
