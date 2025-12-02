# Plugin StoreKit pour iOS - Guide Rapide

## 🚀 Configuration en 2 Étapes

### 1. Exécuter le Script de Configuration

Depuis la racine du projet:

```bash
# Rendre le script exécutable (une seule fois)
chmod +x setup-storekit-plugin.sh

# Exécuter la configuration automatique
./setup-storekit-plugin.sh
```

### 2. Synchroniser et Lancer

```bash
# Synchroniser Capacitor avec iOS
npx cap sync ios

# Lancer l'app sur simulateur/appareil
npx cap run ios
```

## ✅ Vérification

L'app devrait démarrer sans l'erreur "StoreKitPlugin plugin is not implemented on ios".

Pour vérifier que le plugin est chargé, ouvrez la console dans Xcode et cherchez:
```
🛒 StoreKitPlugin loaded successfully!
```

## 🔧 Que Fait le Script ?

Le script `setup-storekit-plugin.sh` automatise:

1. **Vérification** des fichiers du plugin StoreKit
2. **Création** d'un podspec local (`ios/StoreKitPlugin.podspec`)
3. **Mise à jour** du Podfile pour référencer le plugin
4. **Configuration** du bridging header Swift/Objective-C
5. **Installation** des pods CocoaPods
6. **Nettoyage** du cache Xcode

## 📁 Structure du Plugin

```
ios/
├── StoreKitPlugin.podspec           # Définition du pod (créé par le script)
└── App/
    ├── App/
    │   ├── App-Bridging-Header.h    # Bridge Swift/Obj-C
    │   └── Plugins/
    │       └── StoreKitPlugin/
    │           ├── StoreKitPlugin.swift  # Implémentation principale
    │           └── StoreKitPlugin.m      # Enregistrement Capacitor
    └── Podfile                      # Dépendances CocoaPods (mis à jour)
```

## 🐛 Dépannage

### Le script échoue avec "pod install"

```bash
# Installer/mettre à jour CocoaPods
sudo gem install cocoapods
pod repo update
```

### L'erreur persiste après le script

```bash
# Clean complet
cd ios/App
rm -rf Pods Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData
pod install
cd ../..

# Rebuild
npx cap sync ios
npx cap run ios
```

### Le plugin ne charge pas

Vérifiez dans Xcode:
1. Ouvrez `ios/App/App.xcworkspace` (pas .xcodeproj)
2. Build Settings → Objective-C Bridging Header doit être `App/App-Bridging-Header.h`
3. Les fichiers dans `App/Plugins/StoreKitPlugin/` doivent être en noir (pas en rouge)

### Erreur de compilation Swift

Assurez-vous que:
- Version Swift: 5.0+
- iOS Deployment Target: 14.0+
- Les frameworks StoreKit sont disponibles

## 📦 Nouveau Projet / Clone

Sur une nouvelle machine ou après clonage:

```bash
# Installer les dépendances
npm install

# Installer les pods
cd ios/App
pod install
cd ../..

# Synchroniser
npx cap sync ios

# Lancer
npx cap run ios
```

## 🔄 Après Mise à Jour du Plugin

Si vous modifiez les fichiers Swift/Objective-C:

```bash
# Réinstaller les pods
cd ios/App
pod install
cd ../..

# Rebuild
npx cap sync ios
```

## 📚 Ressources

- [Documentation complète](./STOREKIT_PLUGIN_SETUP.md)
- [Guide de test StoreKit](./STOREKIT_TESTING_GUIDE.md)
- [Configuration des codes promo iOS](./IOS_PROMO_CODES_SETUP.md)

## 💡 Pourquoi un Pod Local ?

Le plugin est configuré comme un "pod local" via CocoaPods car:
- ✅ Intégration automatique dans Xcode
- ✅ Gestion des dépendances simplifiée
- ✅ Pas de manipulation manuelle du projet .pbxproj
- ✅ Compatible avec les mises à jour Capacitor
- ✅ Fonctionne avec `pod install` sur d'autres machines
