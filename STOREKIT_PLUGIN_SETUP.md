# Configuration du Plugin StoreKit pour iOS

## Problème
L'erreur "StoreKitPlugin plugin is not implemented on ios" indique que le plugin personnalisé n'est pas correctement intégré dans le projet Xcode.

## ⚡ Solution Automatique (Recommandée)

Utilisez le script de configuration automatique qui configure tout en une seule commande:

```bash
# Rendre le script exécutable (une seule fois)
chmod +x setup-storekit-plugin.sh

# Exécuter le script
./setup-storekit-plugin.sh
```

Le script va automatiquement:
- ✅ Vérifier la présence des fichiers du plugin
- ✅ Créer un podspec local pour le plugin
- ✅ Mettre à jour le Podfile
- ✅ Configurer le bridging header
- ✅ Installer les pods CocoaPods
- ✅ Nettoyer le cache Xcode

Une fois terminé, lancez simplement:
```bash
npx cap sync ios
npx cap run ios
```

---

## 📖 Solution Manuelle (Alternative)

Si vous préférez configurer manuellement ou si le script automatique ne fonctionne pas:

### Méthode 1 : Ajouter le Plugin au Projet Xcode

### Étape 1 : Ouvrir le Projet dans Xcode

```bash
# Depuis la racine du projet
cd ios/App
open App.xcworkspace
```

⚠️ **IMPORTANT** : Ouvrez toujours le fichier `.xcworkspace` et non `.xcodeproj` car le projet utilise CocoaPods.

### Étape 2 : Vérifier les Fichiers du Plugin

1. Dans Xcode, dans le navigateur de projet (panneau de gauche), vérifiez que ces fichiers existent dans `App/Plugins/StoreKitPlugin/`:
   - `StoreKitPlugin.swift`
   - `StoreKitPlugin.m`

2. Si les fichiers ne sont pas visibles ou sont en rouge (fichiers manquants):
   - Clic droit sur le dossier `App` → `Add Files to "App"...`
   - Naviguez vers `ios/App/App/Plugins/StoreKitPlugin/`
   - Sélectionnez les deux fichiers
   - **Cochez** "Copy items if needed"
   - **Cochez** "Add to targets: App"
   - Cliquez sur "Add"

### Étape 3 : Vérifier le Bridging Header

1. Dans Xcode, sélectionnez le projet `App` (icône bleue en haut)
2. Sélectionnez le target `App`
3. Allez dans l'onglet `Build Settings`
4. Cherchez "Objective-C Bridging Header"
5. Vérifiez que la valeur est : `App/App-Bridging-Header.h`

### Étape 4 : Vérifier le Contenu du Bridging Header

Le fichier `ios/App/App/App-Bridging-Header.h` doit contenir:

```objc
#import <Capacitor/Capacitor.h>
```

### Étape 5 : Vérifier l'Enregistrement du Plugin

Le fichier `StoreKitPlugin.m` doit contenir:

```objc
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(StoreKitPlugin, "StoreKitPlugin",
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getProducts, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(purchaseProduct, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(restorePurchases, CAPPluginReturnPromise);
)
```

### Étape 6 : Clean Build et Rebuild

1. Dans Xcode, menu : `Product` → `Clean Build Folder` (ou Cmd+Shift+K)
2. Fermez Xcode
3. Supprimez le cache:
   ```bash
   cd ios/App
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
4. Rouvrez le workspace:
   ```bash
   open App.xcworkspace
   ```
5. Lancez un nouveau build : `Product` → `Build` (ou Cmd+B)

### Étape 7 : Tester le Plugin

Lancez l'app sur un simulateur ou un appareil réel :

```bash
npx cap run ios
```

Si l'erreur persiste, vérifiez les logs dans la console Xcode.

### Méthode 2 : Configuration via CocoaPods Local Pod (Utilisée par le script automatique)

Cette méthode est celle utilisée par le script automatique `setup-storekit-plugin.sh`:

### 1. Créer un Podspec

Créez le fichier `ios/StoreKitPlugin.podspec`:

```ruby
Pod::Spec.new do |s|
  s.name             = 'StoreKitPlugin'
  s.version          = '1.0.0'
  s.summary          = 'Custom StoreKit Plugin for Capacitor'
  s.homepage         = 'https://github.com/yourrepo'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Your Name' => 'your@email.com' }
  s.source           = { :git => '', :tag => s.version.to_s }
  s.source_files     = 'App/Plugins/StoreKitPlugin/**/*.{swift,h,m}'
  s.ios.deployment_target = '14.0'
  s.swift_versions   = '5.0'
  s.dependency 'Capacitor'
end
```

### 2. Modifier le Podfile

Dans `ios/App/Podfile`, ajoutez avant `target 'App' do`:

```ruby
# Plugin StoreKit local
pod 'StoreKitPlugin', :path => '../'
```

### 3. Installer les Pods

```bash
cd ios/App
pod install
```

## Vérification Finale

Pour vérifier que le plugin est bien chargé, ajoutez un log dans `StoreKitPlugin.swift`:

```swift
@objc override public func load() {
    print("🛒 StoreKitPlugin loaded successfully!")
    SKPaymentQueue.default().add(self)
}
```

Puis lancez l'app et cherchez ce log dans la console Xcode.

## Problèmes Courants

### Le plugin n'apparaît pas dans la liste des plugins
- Assurez-vous que les fichiers sont bien dans le target "App"
- Vérifiez que le bridging header est correctement configuré
- Clean build et rebuild

### Erreur de compilation Swift
- Vérifiez que la version Swift est compatible (iOS 14.0+)
- Assurez-vous que `import StoreKit` fonctionne

### Le plugin se charge mais les méthodes échouent
- Vérifiez les signatures dans `StoreKitPlugin.m`
- Assurez-vous que les méthodes Swift ont le décorateur `@objc`

## Ressources

- [Capacitor iOS Plugin Guide](https://capacitorjs.com/docs/plugins/ios)
- [Apple StoreKit Documentation](https://developer.apple.com/documentation/storekit)
