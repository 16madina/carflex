# Configuration StoreKit Natif iOS - Sans RevenueCat

Ce guide explique comment configurer et tester les achats in-app natifs iOS avec StoreKit, sans utiliser RevenueCat.

## ✅ Avantages de cette approche

- ✅ Aucun compte externe requis (pas de RevenueCat)
- ✅ Intégration native iOS optimale
- ✅ Pas de frais supplémentaires
- ✅ Compatible avec le fichier `.storekit` existant
- ✅ Test local immédiat dans XCode

## 📋 Fichiers créés

1. **`src/services/storekit.ts`** - Service TypeScript pour gérer StoreKit
2. **`ios/App/App/StoreKitPlugin.swift`** - Plugin Capacitor natif en Swift
3. **`ios/App/App/StoreKitPlugin.m`** - Bridge Objective-C pour Capacitor
4. **`src/pages/Subscription.tsx`** - Mis à jour pour utiliser StoreKit natif

## 🔧 Configuration dans XCode

### Étape 1: Ajouter les fichiers au projet XCode

1. Ouvrez le projet dans XCode:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. Dans XCode, faites un clic droit sur le dossier `App` → `Add Files to "App"...`

3. Ajoutez ces deux fichiers:
   - `ios/App/App/StoreKitPlugin.swift`
   - `ios/App/App/StoreKitPlugin.m`

4. Cochez ✅ "Copy items if needed"
5. Cochez ✅ "Add to targets: App"

### Étape 2: Configurer le Bridging Header

Si XCode demande de créer un Bridging Header, cliquez sur **"Create Bridging Header"**.

Si vous avez déjà un Bridging Header (`App-Bridging-Header.h`), assurez-vous qu'il contient:

```objc
#import <Capacitor/Capacitor.h>
```

### Étape 3: Activer StoreKit Testing

1. Dans XCode, allez dans **Product** → **Scheme** → **Edit Scheme...**
2. Sélectionnez **Run** dans le menu de gauche
3. Allez dans l'onglet **Options**
4. Sous **StoreKit Configuration**, sélectionnez votre fichier **`Products.storekit`**
5. Cliquez sur **Close**

### Étape 4: Vérifier la configuration StoreKit

1. Ouvrez le fichier `ios/App/Products.storekit` dans XCode
2. Vérifiez que le produit suivant existe:
   - **Product ID**: `com.missdee.carflextest.subscription.pro.monthly`
   - **Type**: RecurringSubscription
   - **Price**: 17.99 (ou votre prix configuré)

## 🧪 Tester l'implémentation

### Test 1: Dans le Simulateur iOS

1. Lancez l'app dans le simulateur:
   ```bash
   npx cap run ios
   ```

2. Naviguez vers la page **Abonnement**

3. Cliquez sur **"Passer à Pro"**

4. Une popup StoreKit native devrait apparaître

5. Cliquez sur **"Subscribe"** (en test, c'est gratuit)

6. Vérifiez les logs dans la console XCode:
   ```
   [StoreKit] Service initialisé
   [StoreKit] Démarrage de l'achat...
   [StoreKit] Achat réussi
   ```

### Test 2: Gérer les transactions dans XCode

1. Dans XCode, allez dans **Debug** → **StoreKit** → **Manage Transactions...**

2. Vous pouvez:
   - ✅ Voir les transactions actives
   - ❌ Annuler des abonnements
   - 🔄 Forcer le renouvellement
   - 💰 Simuler des remboursements

### Test 3: Vérifier la synchronisation backend

1. Après un achat réussi, vérifiez les logs:
   ```
   [StoreKit] Achat synchronisé avec succès
   ```

2. Allez dans votre backend Lovable Cloud → **Database** → **user_subscriptions**

3. Vérifiez qu'une nouvelle ligne existe avec:
   - `user_id`: Votre ID utilisateur
   - `status`: active
   - `platform`: ios
   - `transaction_id`: L'ID de transaction StoreKit

## 📱 Tester sur un appareil réel (Sandbox)

Pour tester sur un appareil physique iOS:

1. **Créer un compte Sandbox** dans App Store Connect:
   - Allez sur [App Store Connect](https://appstoreconnect.apple.com)
   - **Users and Access** → **Sandbox Testers**
   - Créez un nouveau testeur avec un email unique

2. **Sur l'appareil iOS**:
   - Déconnectez-vous de l'App Store (Réglages → App Store)
   - NE vous connectez PAS avec le compte Sandbox
   
3. **Lancez l'app** depuis XCode sur l'appareil

4. **Tentez un achat**: l'app vous demandera de vous connecter avec un compte Sandbox

5. Connectez-vous avec le compte Sandbox créé à l'étape 1

## 🔍 Debugging

### Problème: "StoreKit non disponible"

**Solution**: Assurez-vous que:
- Le fichier `Products.storekit` est sélectionné dans le Scheme XCode
- Vous testez sur le simulateur ou un appareil réel (pas dans le navigateur)
- Les fichiers Swift et .m sont bien ajoutés au projet XCode

### Problème: "Produit introuvable"

**Solution**: Vérifiez que:
- L'ID du produit correspond: `com.missdee.carflextest.subscription.pro.monthly`
- Le produit est bien configuré dans `Products.storekit`
- Le type est bien "RecurringSubscription"

### Problème: "Erreur de synchronisation"

**Solution**: 
- Vérifiez les logs dans la console
- Assurez-vous que l'utilisateur est authentifié
- Vérifiez que la fonction edge `verify-ios-purchase` fonctionne

### Voir les logs détaillés

Dans XCode, consultez:
- **Console** (⌘⇧C) pour voir les logs de l'app
- **Debug** → **StoreKit** → **Transaction Manager** pour voir l'état des transactions

## 🚀 Déploiement Production

Pour publier sur l'App Store:

1. **Créer les produits IAP dans App Store Connect**:
   - Allez dans App Store Connect
   - Sélectionnez votre app
   - **Monetization** → **In-App Purchases**
   - Créez un produit avec l'ID: `com.missdee.carflextest.subscription.pro.monthly`

2. **Configurer les prix** dans tous les pays

3. **Soumettre pour révision** (les IAP doivent être approuvés par Apple)

4. **Build et soumission**:
   ```bash
   npm run build
   npx cap sync ios
   ```
   
5. Dans XCode:
   - Changer le Scheme vers **Release**
   - Désélectionner le fichier `.storekit` (pour production)
   - Archive → Upload to App Store

## 📚 Ressources

- [Documentation StoreKit](https://developer.apple.com/documentation/storekit)
- [Guide StoreKit Testing](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Capacitor Documentation](https://capacitorjs.com/docs/ios)

## ✅ Checklist de vérification

Avant de soumettre à l'App Store:

- [ ] Plugin StoreKit ajouté dans XCode
- [ ] Tests réussis dans le simulateur
- [ ] Tests réussis sur appareil réel (Sandbox)
- [ ] Produits IAP créés dans App Store Connect
- [ ] Synchronisation backend testée et fonctionnelle
- [ ] Restauration d'achats implémentée (à venir)
- [ ] Gestion des erreurs testée
- [ ] Screenshots de l'interface d'achat préparés pour Apple

## 🆘 Support

Si vous rencontrez des problèmes:
1. Consultez les logs dans la console XCode
2. Vérifiez le Transaction Manager de StoreKit
3. Testez avec le fichier `.storekit` d'abord
4. Puis passez aux tests Sandbox
