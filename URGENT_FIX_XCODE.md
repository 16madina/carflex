# 🔴 FIX URGENT - Erreurs Xcode Pods Corrompus

## Problème Actuel
21 erreurs dans `CapacitorSplashScreen` (code natif des Pods). Les pods Capacitor sont corrompus.

## ✅ Solution Complète (Suivre dans l'ordre)

### Étape 1 : Fermer Xcode Complètement
```bash
# Quittez Xcode complètement (⌘Q)
killall Xcode
```

### Étape 2 : Nettoyer Complètement le Projet iOS
```bash
cd ios/App

# Supprimer tous les caches et pods
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf DerivedData
rm -rf .build

# Nettoyer le dossier capacitor cordova android plugins aussi
cd ../../
rm -rf android/capacitor-cordova-android-plugins
```

### Étape 3 : Réinstaller Capacitor Proprement
```bash
# À la racine du projet
npm install

# Sync Capacitor (va recréer les configurations natives)
npx cap sync ios

# Important : cela va régénérer les fichiers natifs et podfile
```

### Étape 4 : Réinstaller les Pods
```bash
cd ios/App

# Mettre à jour CocoaPods si nécessaire
sudo gem install cocoapods

# Installer les pods (peut prendre 2-3 minutes)
pod install --repo-update

# Si ça échoue, essayez :
pod install --repo-update --verbose
```

### Étape 5 : Nettoyer le Cache Xcode
```bash
# Supprimer le cache DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# Supprimer les caches de build
rm -rf ~/Library/Caches/com.apple.dt.Xcode
```

### Étape 6 : Ouvrir et Build dans Xcode
```bash
# Ouvrir le workspace (PAS le .xcodeproj)
open App.xcworkspace
```

Dans Xcode :
1. **Product** → **Clean Build Folder** (⇧⌘K)
2. Attendez que le nettoyage se termine
3. **Product** → **Build** (⌘B)

## 🚨 Si les Erreurs Persistent

### Solution Alternative 1 : Réinstaller Capacitor CLI
```bash
# À la racine du projet
npm uninstall @capacitor/cli @capacitor/core
npm install @capacitor/cli@latest @capacitor/core@latest

# Réinstaller tous les plugins
npm install @capacitor/ios@latest
npm install @capacitor/splash-screen@latest
npm install @capacitor/push-notifications@latest
npm install @capacitor/camera@latest
npm install capacitor-plugin-app-tracking-transparency@latest

# Resync
npx cap sync ios

# Réinstaller les pods
cd ios/App
rm -rf Pods Podfile.lock
pod install --repo-update
```

### Solution Alternative 2 : Recréer le Projet iOS
```bash
# À la racine du projet
npx cap remove ios
npx cap add ios

# Les plugins seront automatiquement ajoutés
npx cap sync ios

cd ios/App
pod install --repo-update
open App.xcworkspace
```

## ⚠️ Vérifications Importantes

### 1. Version de CocoaPods
```bash
pod --version
# Devrait être >= 1.11.0
```

Si inférieur à 1.11.0 :
```bash
sudo gem install cocoapods
```

### 2. Version de Xcode
- Minimum : Xcode 14.0
- Recommandé : Xcode 15.0+

Vérifier :
```bash
xcodebuild -version
```

### 3. Command Line Tools
```bash
xcode-select -p
# Devrait afficher : /Applications/Xcode.app/Contents/Developer
```

Si ce n'est pas le cas :
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcode-select --reset
```

### 4. Vérifier le Podfile
Le fichier `ios/App/Podfile` devrait contenir :
```ruby
platform :ios, '14.0'
use_frameworks!

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCamera', :path => '../../node_modules/@capacitor/camera'
  pod 'CapacitorPushNotifications', :path => '../../node_modules/@capacitor/push-notifications'
  pod 'CapacitorSplashScreen', :path => '../../node_modules/@capacitor/splash-screen'
  pod 'CapacitorPluginAppTrackingTransparency', :path => '../../node_modules/capacitor-plugin-app-tracking-transparency'
end

target 'App' do
  capacitor_pods
end

post_install do |installer|
  assertDeploymentTarget(installer)
end
```

## 🎯 Commande Complète de Reset (Dernier Recours)

```bash
# Script complet - copier/coller tout le bloc
cd /path/to/your/project

# Nettoyer complètement
rm -rf ios/App/Pods
rm -rf ios/App/Podfile.lock
rm -rf node_modules
rm -rf package-lock.json
rm -rf ~/Library/Developer/Xcode/DerivedData

# Réinstaller tout
npm install
npx cap sync ios

cd ios/App
pod deintegrate
pod install --repo-update

# Ouvrir Xcode
open App.xcworkspace
```

## ✅ Résultat Attendu

Après ces étapes :
- ✅ 0 erreur dans Xcode
- ✅ Build réussit pour simulateur
- ✅ Build réussit pour device
- ✅ Les 4 plugins fonctionnent : Camera, Push Notifications, Splash Screen, App Tracking

## 📞 Support

Si après TOUTES ces étapes les erreurs persistent, vérifiez :
1. Logs détaillés : Dans Xcode, **View** → **Navigators** → **Report Navigator**
2. Vérifiez les versions dans `package.json`
3. Vérifiez que vous utilisez bien `App.xcworkspace` et pas `App.xcodeproj`

## Notes Finales

- ⚠️ TOUJOURS utiliser `App.xcworkspace` après avoir installé les pods
- ⚠️ JAMAIS modifier manuellement les fichiers dans le dossier `Pods/`
- ⚠️ Après chaque `git pull`, exécuter `npx cap sync ios` puis `pod install`
- ⚠️ Si vous ajoutez/supprimez un plugin Capacitor, relancer `npx cap sync ios` puis `pod install`
