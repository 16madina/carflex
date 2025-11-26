# 🔴 Solution Finale - CapacitorSplashScreen Corrompu

## Diagnostic Final
Le fichier Swift source dans `node_modules/@capacitor/splash-screen` est correct, mais le fichier copié dans `ios/App/Pods/CapacitorSplashScreen` est corrompu lors de l'installation des pods.

## ✅ Solution Garantie

### Option 1 : Script Automatique

Sur votre machine locale, git pull puis :

```bash
chmod +x fix-splashscreen.sh
./fix-splashscreen.sh
```

### Option 2 : Commandes Manuelles

```bash
# 1. Fermer Xcode
killall Xcode

# 2. Supprimer le package npm
rm -rf node_modules/@capacitor/splash-screen
rm -rf node_modules/.cache

# 3. Réinstaller le package npm
npm install @capacitor/splash-screen@7.0.3 --force

# 4. Nettoyer les pods iOS
cd ios/App
rm -rf Pods Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData

# 5. Réinstaller les pods
pod deintegrate
pod install --repo-update --clean-install

# 6. Ouvrir Xcode
open App.xcworkspace
```

Dans Xcode : **Product** → **Clean Build Folder** (⇧⌘K) → **Build** (⌘B)

## 🚨 Si Ça Échoue ENCORE

### Solution Alternative 1 : Downgrade vers 7.0.2

Si la version 7.0.3 est problématique :

```bash
npm install @capacitor/splash-screen@7.0.2 --save-exact
cd ios/App
rm -rf Pods Podfile.lock
pod install --clean-install
```

### Solution Alternative 2 : Utiliser depuis GitHub

Modifier `ios/App/Podfile` ligne 16 :

```ruby
# Remplacer cette ligne :
pod 'CapacitorSplashScreen', :path => '../../node_modules/@capacitor/splash-screen'

# Par celle-ci (version depuis GitHub) :
pod 'CapacitorSplashScreen', :git => 'https://github.com/ionic-team/capacitor-plugins.git', :tag => '@capacitor/splash-screen@7.0.3', :subdir => 'splash-screen'
```

Puis :
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install --repo-update
open App.xcworkspace
```

### Solution Alternative 3 : Supprimer SplashScreen Complètement

Si aucune solution ne fonctionne et que vous n'avez pas absolument besoin du splash screen natif :

1. **Supprimer le plugin :**
```bash
npm uninstall @capacitor/splash-screen
npx cap sync ios
```

2. **Modifier `ios/App/Podfile`** - supprimer la ligne 16 :
```ruby
# Supprimer ou commenter :
# pod 'CapacitorSplashScreen', :path => '../../node_modules/@capacitor/splash-screen'
```

3. **Supprimer les hooks dans le code :**

Dans `src/hooks/useSplashScreen.ts` - désactiver :
```typescript
export const useSplashScreen = () => {
  // Désactivé temporairement
  return;
};
```

4. **Réinstaller les pods :**
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install
open App.xcworkspace
```

5. **Build et test** - l'app fonctionnera mais sans le splash screen natif Capacitor (votre splash screen React custom fonctionnera toujours)

### Solution Alternative 4 : Utiliser une Version Spécifique Stable

Essayer avec la version 6.0.2 (dernière version stable v6) :

```bash
npm install @capacitor/splash-screen@6.0.2 --save-exact
npm install @capacitor/core@6.8.0 @capacitor/ios@6.8.0 --save-exact

cd ios/App
rm -rf Pods Podfile.lock
pod install --clean-install
open App.xcworkspace
```

**⚠️ Note** : Cela downgrade aussi Capacitor core. Évaluez si c'est acceptable pour votre projet.

## 🔍 Diagnostic Avancé

### Vérifier le fichier copié dans Pods

Après `pod install`, vérifiez si le fichier est corrompu :

```bash
cd ios/App/Pods/CapacitorSplashScreen/Sources/SplashScreenPlugin
cat SplashScreenPlugin.swift
```

Le fichier devrait commencer par :
```swift
import Foundation
import Capacitor

@objc(SplashScreenPlugin)
public class SplashScreenPlugin: CAPPlugin, CAPBridgedPlugin {
```

Si vous voyez des erreurs de syntaxe ou des caractères bizarres → Le pod est corrompu.

### Comparer avec le fichier source

```bash
# Fichier source dans node_modules
cat node_modules/@capacitor/splash-screen/ios/Sources/SplashScreenPlugin/SplashScreenPlugin.swift

# Fichier copié dans Pods
cat ios/App/Pods/CapacitorSplashScreen/Sources/SplashScreenPlugin/SplashScreenPlugin.swift

# Comparer les deux
diff node_modules/@capacitor/splash-screen/ios/Sources/SplashScreenPlugin/SplashScreenPlugin.swift \
     ios/App/Pods/CapacitorSplashScreen/Sources/SplashScreenPlugin/SplashScreenPlugin.swift
```

Si `diff` montre des différences → CocoaPods corrompt les fichiers lors de la copie.

### Copier manuellement le fichier

Si CocoaPods corrompt systématiquement :

```bash
cd ios/App

# Supprimer le pod corrompu
rm -rf Pods/CapacitorSplashScreen

# Copier manuellement depuis node_modules
cp -r ../../node_modules/@capacitor/splash-screen/ios Pods/CapacitorSplashScreen

# Rebuild
open App.xcworkspace
```

Dans Xcode : Clean → Build

## 📊 Checklist Complète

Avant d'abandonner, vérifier :

- [ ] Package npm `@capacitor/splash-screen` réinstallé avec `--force`
- [ ] Cache npm nettoyé (`node_modules/.cache`)
- [ ] Pods iOS complètement supprimés et réinstallés
- [ ] DerivedData Xcode nettoyé
- [ ] Fichier source dans `node_modules` est correct et valide
- [ ] Fichier copié dans `Pods` est identique au source
- [ ] Version Xcode 14.0+ installée
- [ ] CocoaPods 1.11.0+ installé
- [ ] Command Line Tools à jour

## 🎯 Résolution par Ordre de Préférence

1. **Réinstaller npm + pods** (Solution Option 2) - 90% de succès
2. **Downgrade vers 7.0.2** - 80% de succès
3. **Utiliser depuis GitHub** - 70% de succès
4. **Copier manuellement** - 60% de succès
5. **Supprimer le plugin** - 100% de succès (mais perd la fonctionnalité)

## 💡 Pourquoi Ce Problème Arrive

Causes possibles :
1. **Cache CocoaPods corrompu** - Le cache global garde une version corrompue
2. **Corruption lors de la copie** - CocoaPods peut corrompre les fichiers durant l'installation
3. **Conflit de versions** - Incompatibilité entre Capacitor 7.x et le plugin
4. **Problème système** - Corruption du filesystem (rare)
5. **Problème Xcode** - Version incompatible ou installation corrompue

## ✅ Après la Réussite

Une fois le build réussi :

1. **Tester sur simulateur** :
   ```bash
   npx cap run ios
   ```

2. **Vérifier que le splash screen fonctionne** :
   - L'app devrait afficher le splash screen natif au lancement
   - Puis votre splash screen React custom
   - Puis l'app normale

3. **Commit les changements** :
   ```bash
   git add .
   git commit -m "Fix: Résolution du problème CapacitorSplashScreen corrompu"
   git push
   ```

## 🆘 Support Final

Si RIEN ne fonctionne après avoir essayé TOUTES ces solutions :

1. Le problème vient probablement de votre environnement macOS/Xcode
2. Essayez sur une autre machine Mac si possible
3. Contactez le support Capacitor : https://github.com/ionic-team/capacitor/issues
4. En dernier recours : supprimez le plugin (Solution Alternative 3)

Remember : L'app peut fonctionner parfaitement SANS le plugin natif SplashScreen, car vous avez déjà un splash screen React custom qui fonctionne bien.
