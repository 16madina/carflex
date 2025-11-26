# Correction des Erreurs de Build Xcode

## Problème
Erreurs de compilation Swift pour les plugins Capacitor (SplashScreen, PushNotifications, StoreKit).

## Solution Appliquée

### 1. Nettoyage des Fichiers en Double
- Supprimé `ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift` (fichier en double avec beaucoup de code commenté)
- Conservé uniquement `ios/App/App/StoreKitPlugin.swift` comme implémentation principale

### 2. Instructions pour Corriger les Erreurs de Build

Dans Xcode sur votre Mac :

#### Étape 1 : Nettoyer le Build
```bash
cd ios/App
rm -rf DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData
```

#### Étape 2 : Réinstaller les Pods
```bash
cd ios/App
pod deintegrate
pod install
```

#### Étape 3 : Ouvrir et Clean Build dans Xcode
```bash
open App.xcworkspace
```

Dans Xcode :
1. **Product** → **Clean Build Folder** (⇧⌘K)
2. **Product** → **Build** (⌘B)

#### Étape 4 : Si les erreurs persistent
1. Fermez complètement Xcode
2. Supprimez le cache DerivedData :
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```
3. Supprimez le dossier Pods et réinstallez :
   ```bash
   cd ios/App
   rm -rf Pods
   rm Podfile.lock
   pod install
   ```
4. Rouvrez le workspace : `open App.xcworkspace`
5. Clean et rebuild

### 3. Vérifications Supplémentaires

Si les erreurs persistent après ces étapes, vérifiez :

#### A. Version de CocoaPods
```bash
pod --version
# Devrait être >= 1.11.0
```

Si nécessaire, mettez à jour :
```bash
sudo gem install cocoapods
```

#### B. Version de Xcode
- Assurez-vous d'avoir Xcode 14.0 ou supérieur
- Vérifiez que les Command Line Tools sont correctement installés :
  ```bash
  xcode-select -p
  ```

#### C. Podfile Integrity
Le Podfile devrait référencer correctement tous les plugins :
- CapacitorSplashScreen
- CapacitorPushNotifications
- CapacitorCamera
- CapacitorPluginAppTrackingTransparency

### 4. Test de Build

Après avoir suivi ces étapes :

1. **Build pour Simulateur** :
   - Sélectionnez un simulateur iOS dans Xcode
   - ⌘B pour build
   
2. **Build pour Device** :
   - Connectez un appareil iOS
   - Sélectionnez-le dans Xcode
   - ⌘B pour build

### 5. Si le Problème Persiste

Faites un build complètement propre :

```bash
# Fermez Xcode d'abord
cd ios/App

# Supprimez tout
rm -rf Pods
rm -rf DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData
rm Podfile.lock

# Réinitialisez Capacitor
cd ../..
npx cap sync ios

# Réinstallez les pods
cd ios/App
pod install

# Ouvrez et buildez
open App.xcworkspace
```

## Notes Importantes

- ⚠️ Ne modifiez JAMAIS manuellement les fichiers dans le dossier `Pods/`
- ⚠️ Utilisez toujours `App.xcworkspace` et non `App.xcodeproj`
- ⚠️ Après chaque `git pull`, exécutez `npx cap sync ios` puis `pod install`

## Commandes Rapides de Dépannage

```bash
# Script complet de réinitialisation
cd ios/App
pod deintegrate
rm -rf ~/Library/Developer/Xcode/DerivedData
pod install
open App.xcworkspace
```

## Résultat Attendu

Après ces étapes, le build devrait réussir sans erreurs Swift pour les plugins Capacitor.
