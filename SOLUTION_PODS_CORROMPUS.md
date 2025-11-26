# 🔴 Solution Définitive - Pods Capacitor Corrompus

## Diagnostic
Les erreurs Swift persistent dans le code natif de `CapacitorSplashScreen` même après réinstallation. Cela indique que le **cache CocoaPods global** contient des versions corrompues.

## ✅ Solution Garantie

### Option 1 : Script Automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x clean-and-rebuild-ios.sh

# Exécuter
./clean-and-rebuild-ios.sh
```

Le script va :
1. Fermer Xcode
2. Nettoyer le cache CocoaPods global (`~/.cocoapods`)
3. Nettoyer les caches Xcode
4. Supprimer les Pods locaux
5. Réinitialiser CocoaPods
6. Télécharger les pods depuis les sources
7. Ouvrir Xcode

**Durée estimée** : 3-5 minutes

### Option 2 : Commandes Manuelles

Si le script échoue, exécutez manuellement :

```bash
# 1. Fermer Xcode
killall Xcode

# 2. Nettoyer le cache CocoaPods GLOBAL (crucial!)
rm -rf ~/.cocoapods/repos
rm -rf ~/Library/Caches/CocoaPods

# 3. Nettoyer Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# 4. Nettoyer Pods locaux
cd ios/App
rm -rf Pods Podfile.lock .build DerivedData

# 5. Réinitialiser CocoaPods (2-3 minutes)
pod setup

# 6. Mettre à jour les repos
pod repo update

# 7. Installer avec clean install
pod install --repo-update --clean-install --verbose

# 8. Ouvrir Xcode
open App.xcworkspace
```

### Dans Xcode

Une fois Xcode ouvert :

1. **Attendez l'indexation complète** (barre de progression en haut)
2. **Product** → **Clean Build Folder** (⇧⌘K)
3. **Product** → **Build** (⌘B)

## 🎯 Pourquoi Cette Solution Fonctionne

### Problème Identifié
- Les pods Capacitor téléchargés précédemment sont corrompus
- Le cache CocoaPods local (`~/.cocoapods`) garde ces versions corrompues
- Même après suppression des Pods locaux, CocoaPods réutilise le cache corrompu

### Solution
- `rm -rf ~/.cocoapods/repos` : Supprime le cache des specs CocoaPods
- `rm -rf ~/Library/Caches/CocoaPods` : Supprime le cache des pods téléchargés
- `pod setup` : Télécharge un nouveau repo specs propre
- `pod install --clean-install` : Force le téléchargement depuis les sources

## 🚨 Si Ça Échoue Encore

### Vérification 1 : Versions Incohérentes

Vérifier que toutes les versions Capacitor dans `package.json` sont identiques :

```json
{
  "@capacitor/core": "^7.4.3",
  "@capacitor/ios": "^7.4.3",
  "@capacitor/cli": "^7.4.3",
  "@capacitor/camera": "^7.0.2",
  "@capacitor/push-notifications": "^7.0.3",
  "@capacitor/splash-screen": "^7.0.3"
}
```

Si différent, mettre à jour :

```bash
npm install @capacitor/core@7.4.3 @capacitor/ios@7.4.3 @capacitor/cli@7.4.3
npm install @capacitor/camera@7.0.2
npm install @capacitor/push-notifications@7.0.3
npm install @capacitor/splash-screen@7.0.3
```

Puis refaire `npx cap sync ios` et `pod install`.

### Vérification 2 : Version Xcode Incompatible

```bash
xcodebuild -version
```

**Minimum requis** : Xcode 14.0  
**Recommandé** : Xcode 15.0+

Si trop ancien, télécharger depuis Mac App Store.

### Vérification 3 : Swift Version

Dans Xcode :
1. Sélectionner le projet "App"
2. Build Settings
3. Chercher "Swift Language Version"
4. Doit être : **Swift 5**

### Vérification 4 : iOS Deployment Target

Dans `ios/App/App.xcodeproj/project.pbxproj`, chercher `IPHONEOS_DEPLOYMENT_TARGET` :

```
IPHONEOS_DEPLOYMENT_TARGET = 14.0;
```

Doit correspondre à la version dans `Podfile` :

```ruby
platform :ios, '14.0'
```

## 🔧 Diagnostic Avancé

Si après TOUT cela les erreurs persistent, exécuter ces diagnostics :

### 1. Vérifier l'intégrité des Pods téléchargés

```bash
cd ios/App/Pods/CapacitorSplashScreen

# Lister les fichiers
ls -la

# Vérifier le contenu du .swift
cat ios/Plugin/SplashScreen.swift | head -50
```

Si le fichier contient des erreurs de syntaxe évidentes → Le pod téléchargé est corrompu.

### 2. Télécharger manuellement le pod

```bash
# Aller dans le dossier Pods
cd ios/App/Pods

# Supprimer CapacitorSplashScreen
rm -rf CapacitorSplashScreen

# Télécharger depuis GitHub directement
git clone https://github.com/ionic-team/capacitor-plugins.git temp
cp -r temp/splash-screen/ios CapacitorSplashScreen
rm -rf temp

# Reconstruire
cd ../..
pod install
```

### 3. Forcer Capacitor à utiliser des versions spécifiques

Modifier `Podfile` pour forcer des versions :

```ruby
def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCamera', :path => '../../node_modules/@capacitor/camera'
  pod 'CapacitorPushNotifications', :path => '../../node_modules/@capacitor/push-notifications'
  
  # Forcer une version spécifique depuis GitHub
  pod 'CapacitorSplashScreen', :git => 'https://github.com/ionic-team/capacitor-plugins.git', :tag => '@capacitor/splash-screen@7.0.3'
  
  pod 'CapacitorPluginAppTrackingTransparency', :path => '../../node_modules/capacitor-plugin-app-tracking-transparency'
end
```

Puis :
```bash
pod install --repo-update
```

## 📊 Checklist de Dépannage

Avant de déclarer échec, vérifier :

- [ ] Cache CocoaPods global supprimé (`~/.cocoapods`)
- [ ] Cache Xcode supprimé (`~/Library/Developer/Xcode/DerivedData`)
- [ ] Pods locaux supprimés (`ios/App/Pods`)
- [ ] `pod setup` exécuté avec succès
- [ ] `pod repo update` exécuté
- [ ] `pod install --clean-install` exécuté
- [ ] Xcode version 14.0+ installée
- [ ] Command Line Tools installés correctement
- [ ] Toutes les versions Capacitor cohérentes dans `package.json`
- [ ] iOS Deployment Target = 14.0 dans Podfile et projet
- [ ] Swift Version = 5 dans Build Settings
- [ ] Utilisation de `App.xcworkspace` (pas `.xcodeproj`)

## 💡 Dernier Recours

Si ABSOLUMENT RIEN ne fonctionne :

1. **Créer un nouveau projet Capacitor test** pour vérifier que Capacitor fonctionne sur votre machine :

```bash
cd ~/Desktop
npm create @capacitor/app my-test-app
cd my-test-app
npm install
npx cap add ios
cd ios/App
pod install
open App.xcworkspace
```

Si ce projet test build correctement → Le problème vient de votre projet actuel.  
Si ce projet test échoue aussi → Le problème vient de votre environnement de dev.

2. **Environnement de dev :**
   - Réinstaller Xcode complètement
   - Mettre à jour macOS
   - Réinstaller Command Line Tools
   - Réinstaller Ruby/CocoaPods

3. **Projet actuel :**
   - Recréer complètement le projet iOS (`npx cap remove ios` puis `npx cap add ios`)
   - Vérifier qu'il n'y a pas de conflits dans `package.json`

## 🎯 Résultat Attendu

Après cette solution complète :
- ✅ **0 erreur** de compilation
- ✅ Build réussit sur simulateur
- ✅ Tous les plugins Capacitor fonctionnent
- ✅ L'app démarre sans crash
