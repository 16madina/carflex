# Configuration StoreKit Natif iOS - Avec Vérification App Store Server API

Ce guide explique comment configurer et tester les achats in-app natifs iOS avec StoreKit et vérification automatique côté serveur via l'App Store Server API.

## ✅ Avantages de cette approche

- ✅ Vérification sécurisée côté serveur avec l'App Store Server API
- ✅ Aucun compte externe requis (pas de RevenueCat)
- ✅ Intégration native iOS optimale
- ✅ Protection contre la fraude
- ✅ Compatible avec le fichier `.storekit` existant
- ✅ Test local immédiat dans XCode

## 🔐 Configuration App Store Connect

### Étape 1: Créer une clé API App Store Connect

1. Allez sur [App Store Connect](https://appstoreconnect.apple.com)
2. Cliquez sur **Users and Access** (Utilisateurs et accès)
3. Allez dans l'onglet **Keys** (Clés)
4. Cliquez sur **Generate API Key** ou le bouton **+**
5. Donnez un nom à votre clé (ex: "CarFlex API")
6. Sélectionnez le rôle **Developer** (minimum requis)
7. Cliquez sur **Generate**
8. **IMPORTANT**: Téléchargez immédiatement le fichier `.p8` - vous ne pourrez plus le télécharger après !
9. Notez ces trois informations :
   - **Issuer ID** (en haut de la page des clés, format UUID)
   - **Key ID** (10 caractères, ex: C9XFKJ756Q)
   - **Contenu du fichier .p8** (la clé privée elle-même)

### Étape 2: Configurer les secrets dans Lovable Cloud

Les secrets suivants ont été configurés :
- `APP_STORE_PRIVATE_KEY` : Contenu du fichier .p8
- `APP_STORE_KEY_ID` : Votre Key ID (ex: C9XFKJ756Q)
- `APP_STORE_ISSUER_ID` : Votre Issuer ID (format UUID)

## 📋 Fichiers créés/mis à jour

1. **`src/services/storekit.ts`** - Service TypeScript pour gérer StoreKit
2. **`ios/App/App/StoreKitPlugin.swift`** - Plugin Capacitor natif en Swift
3. **`ios/App/App/StoreKitPlugin.m`** - Bridge Objective-C pour Capacitor
4. **`supabase/functions/verify-ios-purchase/index.ts`** - Edge function de vérification côté serveur
5. **`src/pages/Subscription.tsx`** - Page d'abonnement utilisant StoreKit natif
6. **`src/pages/PromoteListing.tsx`** - Page de promotion utilisant StoreKit natif

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
2. Vérifiez que les produits suivants existent:
   - **Abonnement Pro**: `com.missdee.carflextest.subscription.pro.monthly`
   - **Packages Premium**: `premium_package_[id]` pour chaque package premium

## 🔄 Comment fonctionne la vérification

### Flux d'achat sécurisé

1. **Client (iOS)**: L'utilisateur initie un achat via StoreKit
2. **StoreKit**: Apple traite le paiement et retourne un `transactionId`
3. **Client**: Envoie le `transactionId` à votre backend via l'edge function `verify-ios-purchase`
4. **Backend**: 
   - Génère un JWT signé avec votre clé privée App Store
   - Appelle l'API App Store Server avec le `transactionId`
   - Vérifie que la transaction est légitime
   - Valide le `bundleId` et le `productId`
   - Active le premium/abonnement dans la base de données
5. **Client**: Reçoit la confirmation et affiche le succès

### Sécurité

- ✅ La clé privée App Store est stockée côté serveur (jamais exposée au client)
- ✅ Chaque achat est vérifié avec les serveurs d'Apple
- ✅ Impossible de frauder en envoyant de fausses données
- ✅ Le `bundleId` et `productId` sont validés côté serveur

## 🧪 Tester l'implémentation

### Test 1: Dans le Simulateur iOS (Local StoreKit)

1. Lancez l'app dans le simulateur:
   ```bash
   npx cap run ios
   ```

2. **Pour tester l'abonnement Pro:**
   - Naviguez vers **Abonnement**
   - Cliquez sur **"Passer à Pro"**
   - La popup StoreKit apparaît
   - Cliquez sur **"Subscribe"** (gratuit en test)

3. **Pour tester un package premium:**
   - Créez une annonce si nécessaire
   - Allez dans **Promouvoir une annonce**
   - Sélectionnez un package premium
   - Sélectionnez votre annonce
   - Cliquez sur **"Continuer vers le paiement"**
   - Sélectionnez **iOS/Apple Pay**
   - Confirmez l'achat dans la popup StoreKit

4. Vérifiez les logs dans la console XCode:
   ```
   [StoreKit] Service initialisé
   [StoreKit] Démarrage de l'achat...
   [verify-ios-purchase] User authenticated: [user-id]
   [JWT] Génération du token App Store...
   [JWT] Token généré avec succès
   [App Store API] Vérification de la transaction: [transaction-id]
   [App Store API] Transaction vérifiée avec succès
   [verify-ios-purchase] Premium/Subscription activé avec succès
   ```

### Test 2: Gérer les transactions dans XCode

1. Dans XCode, allez dans **Debug** → **StoreKit** → **Manage Transactions...**

2. Vous pouvez:
   - ✅ Voir les transactions actives
   - ❌ Annuler des abonnements
   - 🔄 Forcer le renouvellement
   - 💰 Simuler des remboursements

### Test 3: Vérifier la synchronisation backend

1. Après un achat réussi, allez dans **Lovable Cloud** → **Database**

2. Pour un **abonnement Pro**, vérifiez la table **user_subscriptions**:
   - `user_id`: Votre ID utilisateur
   - `status`: active
   - `current_period_end`: Date de fin d'abonnement
   - `verified_by_apple`: true

3. Pour un **package premium**, vérifiez la table **premium_listings**:
   - `user_id`: Votre ID utilisateur
   - `listing_id`: ID de l'annonce
   - `is_active`: true
   - `end_date`: Date de fin de promotion

## 📱 Tester sur un appareil réel (Sandbox)

### Prérequis

1. **Créer un compte Sandbox** dans App Store Connect:
   - Allez sur [App Store Connect](https://appstoreconnect.apple.com)
   - **Users and Access** → **Sandbox Testers**
   - Créez un nouveau testeur avec un email unique

### Sur l'appareil iOS

1. Déconnectez-vous de l'App Store (Réglages → App Store)
2. NE vous connectez PAS avec le compte Sandbox maintenant
3. Lancez l'app depuis XCode sur l'appareil
4. Tentez un achat: l'app vous demandera de vous connecter
5. Connectez-vous avec le compte Sandbox créé

### Logs côté serveur

Pour voir les logs de vérification en temps réel :
- Allez dans **Lovable Cloud** → **Edge Functions**
- Sélectionnez **verify-ios-purchase**
- Consultez les logs en direct

## 🔍 Debugging

### Problème: "StoreKit non disponible"

**Solution**: 
- Le fichier `Products.storekit` est sélectionné dans le Scheme XCode
- Vous testez sur simulateur ou appareil réel (pas dans le navigateur)
- Les fichiers Swift et .m sont ajoutés au projet XCode

### Problème: "Produit introuvable"

**Solution**: 
- L'ID du produit correspond exactement
- Le produit est configuré dans `Products.storekit`
- Le type de produit est correct (Subscription ou Consumable)

### Problème: "App Store API error: 401"

**Solution**: 
- Vérifiez que les secrets sont correctement configurés dans Lovable Cloud
- La clé privée `.p8` est complète (avec BEGIN/END)
- Le Key ID et l'Issuer ID correspondent à la clé créée

### Problème: "Bundle ID mismatch"

**Solution**: 
- Le Bundle ID dans le code est: `app.lovable.c69889b6be82430184ff53e58a725869`
- Ce Bundle ID doit correspondre dans :
  - XCode: Target → General → Bundle Identifier
  - Products.storekit: Chaque produit doit avoir ce Bundle ID
  - App Store Connect: L'app doit être enregistrée avec ce Bundle ID

### Voir les logs détaillés

**XCode (client):**
- **Console** (⌘⇧C) pour voir les logs de l'app
- **Debug** → **StoreKit** → **Transaction Manager**

**Lovable Cloud (serveur):**
- **Cloud** → **Edge Functions** → **verify-ios-purchase** → **Logs**

## 🚀 Déploiement Production

### 1. Créer les produits IAP dans App Store Connect

1. Allez dans App Store Connect
2. Sélectionnez votre app (créez-la si nécessaire avec le bon Bundle ID)
3. **Monetization** → **In-App Purchases**
4. Créez les produits :
   - Abonnement Pro: `com.missdee.carflextest.subscription.pro.monthly`
   - Packages Premium: `premium_package_[id]` pour chaque package

### 2. Configurer les prix

- Définissez les prix dans tous les pays où vous voulez vendre
- Assurez-vous que les prix correspondent à ceux dans votre base de données

### 3. Soumettre pour révision

- Les IAP doivent être approuvés par Apple avant publication
- Préparez des screenshots de l'interface d'achat
- Rédigez une description claire de ce que l'utilisateur obtient

### 4. Build de production

```bash
npm run build
npx cap sync ios
```

Dans XCode:
- Changez le Scheme vers **Release**
- **Désélectionnez** le fichier `.storekit` (important !)
- Archive → Upload to App Store

### 5. Vérification finale

Avant de soumettre, vérifiez :
- ✅ Les secrets App Store sont configurés en production
- ✅ L'edge function `verify-ios-purchase` est déployée
- ✅ Les produits IAP sont créés dans App Store Connect
- ✅ Les tests Sandbox ont réussi sur appareil réel
- ✅ Le Bundle ID est correct partout

## 📚 Ressources

- [Documentation StoreKit](https://developer.apple.com/documentation/storekit)
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [Guide StoreKit Testing](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Capacitor Documentation](https://capacitorjs.com/docs/ios)

## ✅ Checklist de vérification

Avant de soumettre à l'App Store:

**Configuration:**
- [ ] Plugin StoreKit ajouté dans XCode
- [ ] Fichiers Swift et .m compilent sans erreur
- [ ] Clé API App Store Connect créée et téléchargée
- [ ] Secrets configurés dans Lovable Cloud

**Tests:**
- [ ] Tests réussis dans simulateur avec `.storekit`
- [ ] Tests réussis sur appareil réel avec Sandbox
- [ ] Vérification backend testée et logs OK
- [ ] Abonnements et packages premium fonctionnent

**Production:**
- [ ] Produits IAP créés dans App Store Connect
- [ ] Prix configurés dans tous les pays
- [ ] Edge function déployée en production
- [ ] Bundle ID correct et cohérent partout
- [ ] Screenshots et descriptions préparés pour Apple

**Sécurité:**
- [ ] Clés privées jamais exposées au client
- [ ] Vérification côté serveur pour tous les achats
- [ ] Validation du Bundle ID et Product ID
- [ ] Logs de sécurité en place

## 🆘 Support

Si vous rencontrez des problèmes:

1. **Logs client**: Console XCode + StoreKit Transaction Manager
2. **Logs serveur**: Lovable Cloud → Edge Functions → verify-ios-purchase
3. **Network**: Vérifiez les requêtes réseau dans les logs
4. **Database**: Vérifiez les tables user_subscriptions et premium_listings

Pour assistance: Consultez la documentation Lovable ou contactez le support.
