# 🚨 GUIDE DE DÉPANNAGE XCODE - StoreKitPlugin

## ✅ RÉSUMÉ DU DIAGNOSTIC

D'après l'analyse automatique, **TOUT EST CORRECTEMENT CONFIGURÉ** :

✅ Tous les fichiers sont présents
✅ Le Bridging Header est configuré correctement
✅ Les fichiers sont enregistrés dans le projet
✅ StoreKit.framework est lié

## 🎯 ÉTAPES À SUIVRE MAINTENANT

### DANS XCODE:

#### 1️⃣ VÉRIFICATION VISUELLE (CRITIQUE)

Ouvrez `ios/App/App.xcodeproj` dans Xcode:

```
Fichier → Ouvrir → ios/App/App.xcodeproj
```

**Dans le navigateur de gauche**, déroulez et vérifiez:
```
App (projet bleu)
└── App (dossier jaune)
    └── Plugins
        └── StoreKitPlugin
            ├── StoreKitPlugin.swift ← Doit être NOIR (pas rouge)
            └── StoreKitPlugin.m ← Doit être NOIR (pas rouge)
```

**🔴 SI LES FICHIERS SONT ROUGES:**
Cela signifie que Xcode ne trouve pas les fichiers physiques.

**SOLUTION:**
1. Supprimez les références rouges:
   - Clic droit sur le fichier rouge → Delete → "Remove Reference" (PAS "Move to Trash")
2. Réajoutez les fichiers:
   - Ouvrez le Finder, allez dans `ios/App/App/Plugins/StoreKitPlugin/`
   - Glissez-déposez les 2 fichiers vers le groupe StoreKitPlugin dans Xcode
   - Cochez "Copy items if needed" et "Add to targets: App"

#### 2️⃣ BUILD SETTINGS

Sélectionnez le **target "App"** (en haut du navigateur, icône bleue):

1. Cliquez sur l'onglet **"Build Settings"**
2. Dans la barre de recherche (en haut à droite), tapez: `bridging`
3. Cherchez: **"Objective-C Bridging Header"**
4. Vérifiez la valeur: `App/App-Bridging-Header.h`

**SI LA VALEUR EST VIDE OU DIFFÉRENTE:**
- Double-cliquez sur la ligne
- Entrez: `App/App-Bridging-Header.h`
- Appuyez sur Entrée

#### 3️⃣ CLEAN ET BUILD

**IMPORTANT:** Faites ces étapes dans l'ordre:

1. **Clean Build Folder:**
   ```
   Product → Clean Build Folder (⌘ + Shift + K)
   ```
   Attendez que la barre de progression en haut disparaisse.

2. **Build:**
   ```
   Product → Build (⌘ + B)
   ```
   
   **REGARDEZ LA CONSOLE DE BUILD** (en bas de Xcode):
   - Si des erreurs apparaissent (triangle rouge), notez-les
   - Cliquez sur l'erreur pour voir les détails

3. **Run:**
   ```
   Product → Run (⌘ + R)
   ```

## 🔍 ERREURS COMMUNES ET SOLUTIONS

### Erreur: "Use of undeclared type 'CAPPlugin'"

**Cause:** Le Bridging Header n'est pas pris en compte.

**Solution 1:**
```
1. Product → Clean Build Folder
2. Fermez Xcode complètement
3. Supprimez le cache: rm -rf ~/Library/Developer/Xcode/DerivedData
4. Rouvrez Xcode
5. Product → Build
```

**Solution 2:**
Vérifiez que le fichier `App-Bridging-Header.h` contient bien:
```objc
#import <Capacitor/Capacitor.h>
```

### Erreur: "No such module 'Capacitor'"

**Cause:** Les Pods ne sont pas installés ou à jour.

**Solution:**
```bash
cd ios/App
pod deintegrate
pod install
```

Puis dans Xcode:
```
Product → Clean Build Folder
Product → Build
```

### Erreur: "Cannot find 'SKPaymentQueue' in scope"

**Cause:** StoreKit.framework n'est pas lié.

**Solution:**
1. Sélectionnez le target "App"
2. Onglet "General"
3. Section "Frameworks, Libraries, and Embedded Content"
4. Cliquez sur "+" et ajoutez "StoreKit.framework"

### Les fichiers sont ROUGES dans Xcode

**Cause:** Xcode ne trouve pas les fichiers à l'emplacement attendu.

**Solution détaillée:**
1. Dans Xcode, clic droit sur **StoreKitPlugin** (le dossier) → Delete
2. Choisissez **"Remove Reference"** (PAS "Move to Trash")
3. Dans le **Finder**, ouvrez `ios/App/App/Plugins/`
4. Vérifiez que le dossier `StoreKitPlugin` existe avec les 2 fichiers
5. Dans Xcode, clic droit sur le dossier **Plugins** → Add Files to "App"
6. Sélectionnez le dossier `StoreKitPlugin`
7. **IMPORTANT:** Cochez ces options:
   - ✅ "Copy items if needed"
   - ✅ "Create groups" (pas "Create folder references")
   - ✅ Add to targets: **App**
8. Cliquez sur "Add"

### Build réussit mais le plugin n'est pas accessible en JavaScript

**Diagnostic:**
Dans la console Safari/Chrome DevTools, tapez:
```javascript
console.log(Capacitor.Plugins.StoreKitPlugin);
```

**Si undefined:**
1. Le plugin n'est pas enregistré
2. Vérifiez que `StoreKitPlugin.m` contient bien le code d'enregistrement
3. Faites `npx cap sync ios`
4. Rebuild dans Xcode

**Si erreur "Plugin StoreKitPlugin does not have web implementation":**
C'est NORMAL! Le plugin est iOS-only.
Testez sur un device iOS ou simulateur, pas dans le navigateur.

## 📱 TESTER LE PLUGIN

### Sur Simulateur iOS:

1. Lancez l'app dans le simulateur (⌘ + R)
2. Ouvrez Safari sur votre Mac
3. Menu: Develop → Simulator → [Your App]
4. Dans la console JavaScript:

```javascript
// Test 1: Vérifier que le plugin existe
console.log(Capacitor.Plugins.StoreKitPlugin);
// Devrait afficher un objet avec les méthodes

// Test 2: Test echo
const { StoreKitPlugin } = Capacitor.Plugins;
StoreKitPlugin.echo({ value: "Hello from StoreKit!" })
  .then(result => console.log("✅ Echo success:", result))
  .catch(error => console.error("❌ Echo error:", error));

// Test 3: Vérifier les méthodes
console.log("getProducts:", typeof StoreKitPlugin.getProducts);
console.log("purchaseProduct:", typeof StoreKitPlugin.purchaseProduct);
console.log("restorePurchases:", typeof StoreKitPlugin.restorePurchases);
```

### Sur Device Physique:

Pour tester sur un vrai iPhone/iPad:

1. Connectez votre device
2. Sélectionnez-le dans Xcode (en haut, à côté du bouton Play)
3. Product → Run
4. **IMPORTANT:** Pour tester les achats in-app:
   - Vous devez avoir un compte Apple Developer payant
   - Configurer les produits dans App Store Connect
   - Créer un compte Sandbox pour les tests

## 📞 SI ÇA NE MARCHE TOUJOURS PAS

### Informations à fournir:

1. **Couleur des fichiers dans Xcode:**
   - StoreKitPlugin.swift: NOIR ou ROUGE?
   - StoreKitPlugin.m: NOIR ou ROUGE?

2. **Messages d'erreur de compilation:**
   - Copiez-collez le texte COMPLET des erreurs rouges dans la console de build

3. **Configuration Build Settings:**
   - Valeur exacte de "Objective-C Bridging Header"

4. **Test JavaScript:**
   - Résultat de `console.log(Capacitor.Plugins.StoreKitPlugin)`

5. **Logs Xcode:**
   - Ouvrez la console de debug (⌘ + Shift + Y)
   - Copiez les logs pertinents

## 🎯 CHECKLIST FINALE

Avant de dire que ça ne marche pas, vérifiez:

- [ ] Xcode ouvert sur le bon projet (ios/App/App.xcodeproj)
- [ ] Les fichiers sont NOIRS dans le navigateur Xcode
- [ ] Bridging Header configuré à `App/App-Bridging-Header.h`
- [ ] Le contenu du Bridging Header inclut `#import <Capacitor/Capacitor.h>`
- [ ] Product → Clean Build Folder effectué
- [ ] Product → Build réussit SANS erreurs
- [ ] L'app se lance sur le simulateur/device
- [ ] Test effectué dans la console JavaScript (pas dans le navigateur web)
- [ ] `npx cap sync ios` exécuté récemment

## 💡 ASTUCES SUPPLÉMENTAIRES

### Réinitialisation complète en cas de doute:

```bash
# Dans le terminal
cd /home/user/webapp

# 1. Nettoyer Capacitor
npx cap sync ios

# 2. Réinstaller les Pods
cd ios/App
rm -rf Pods Podfile.lock
pod install
cd ../..

# 3. Nettoyer le cache Xcode (sur Mac)
rm -rf ~/Library/Developer/Xcode/DerivedData

# 4. Rouvrir Xcode
open ios/App/App.xcodeproj
```

Dans Xcode:
```
Product → Clean Build Folder
Product → Build
```

### Debug logging:

Ajoutez des logs dans `StoreKitPlugin.swift`:

```swift
@objc func echo(_ call: CAPPluginCall) {
    print("🎯 StoreKitPlugin.echo called!")
    let value = call.getString("value") ?? ""
    print("🎯 Value received: \(value)")
    call.resolve(["value": value])
}
```

Regardez les logs dans la console Xcode lors de l'exécution.

---

## 🎉 CONCLUSION

Si vous avez suivi TOUTES ces étapes et que:
- ✅ Les fichiers sont NOIRS dans Xcode
- ✅ Le build réussit sans erreurs
- ✅ L'app se lance

**Alors le plugin FONCTIONNE!**

Le test final est dans la console JavaScript du simulateur iOS, pas dans Chrome/Safari sur votre ordinateur.

**Bonne chance! 🚀**
