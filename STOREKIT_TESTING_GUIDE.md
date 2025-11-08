# 🧪 Guide StoreKit Testing pour CarFlex

## ✅ Pourquoi StoreKit Testing est Recommandé

**Avantages par rapport au Sandbox Testing:**
- ✅ **Aucun compte Apple requis** - Pas besoin de créer des comptes Sandbox
- ✅ **Tests locaux instantanés** - Pas besoin de connexion internet
- ✅ **Contrôle total** - Simulez différents scénarios (succès, échec, remboursement)
- ✅ **Tests rapides** - Pas d'attente de validation Apple
- ✅ **Debugging facile** - Logs clairs dans Xcode
- ✅ **Réinitialisations illimitées** - Testez autant de fois que nécessaire

---

## 📋 Prérequis

- Xcode 12+ installé
- Projet CarFlex exporté vers Github et cloné localement
- iOS 14+ (sur simulateur ou device physique)

---

## 🚀 Configuration StoreKit Testing

### Étape 1: Créer le Fichier de Configuration StoreKit

1. Ouvrez le projet dans Xcode:
   ```bash
   npx cap open ios
   ```

2. Dans Xcode, allez dans **File** → **New** → **File...**

3. Cherchez **"StoreKit Configuration File"** et cliquez sur **Next**

4. Nommez le fichier: `CarFlexStoreKit.storekit`

5. Assurez-vous qu'il est ajouté au target **App**

### Étape 2: Configurer les Produits IAP

Dans le fichier `CarFlexStoreKit.storekit` (éditeur visuel Xcode):

#### Ajouter un Abonnement
1. Cliquez sur **"+"** en bas à gauche
2. Sélectionnez **"Add Subscription Group"**
3. Configurez:
   - **Reference Name**: `CarFlex Subscriptions`
   - **Group ID**: `carflex_subscriptions`

#### Ajouter le Produit Pro Monthly
1. Sélectionnez le groupe créé
2. Cliquez sur **"+"** → **"Add Auto-Renewable Subscription"**
3. Configurez:

**Onglet Information:**
- **Product ID**: `com.missdee.carflextest.pro.monthly`
- **Reference Name**: `Pro Monthly`
- **Status**: ✅ Cleared for Sale
- **Subscription Duration**: `1 Month`

**Onglet Localization:**
- Cliquez sur **"+"** pour ajouter le français (`fr`)
- **Display Name**: `CarFlex Pro - Mensuel`
- **Description**: `Abonnement mensuel au plan Pro avec annonces illimitées et visibilité maximale`

**Onglet Price:**
- **Price**: `2.99`
- **Currency**: `EUR` (ou votre devise)

#### (Optionnel) Ajouter un Produit Annuel
Répétez le processus pour un abonnement annuel si nécessaire:
- **Product ID**: `com.missdee.carflextest.pro.yearly`
- **Duration**: `1 Year`
- **Price**: `29.99 EUR`

### Étape 3: Activer StoreKit Testing dans Xcode

1. Dans Xcode, allez dans **Product** → **Scheme** → **Edit Scheme...**

2. Sélectionnez **Run** dans la barre latérale gauche

3. Allez dans l'onglet **Options**

4. Sous **StoreKit Configuration**, sélectionnez:
   - ✅ **CarFlexStoreKit.storekit**

5. Cliquez sur **Close**

---

## 🧪 Tester les Achats In-App

### Build et Lancement

```bash
# 1. Build le projet
npm run build

# 2. Sync avec Capacitor
npx cap sync ios

# 3. Ouvrir dans Xcode
npx cap open ios
```

### Scénarios de Test

#### Test 1: Achat Réussi (Flow Normal)
1. Lancez l'app sur un simulateur/device
2. Connectez-vous avec n'importe quel compte (même fictif)
3. Allez dans **Mon Compte** → **Abonnement**
4. Cliquez sur **"Passer à Pro"**
5. ✅ Le dialogue d'achat StoreKit apparaît
6. Cliquez sur **"Subscribe"**
7. ✅ Vérifiez:
   - Toast "Abonnement activé avec succès"
   - Badge "Pro" sur le profil
   - Fonctionnalités Pro débloquées

#### Test 2: Annulation d'Achat
1. Cliquez sur **"Passer à Pro"**
2. Dans le dialogue StoreKit, cliquez sur **"Cancel"**
3. ✅ Vérifiez:
   - Pas d'abonnement créé
   - Message d'annulation approprié

#### Test 3: Restauration d'Achat
1. Effectuez un achat réussi
2. Fermez complètement l'app
3. Supprimez les données de l'app (si simulateur: Reset Content and Settings)
4. Relancez l'app et connectez-vous
5. Allez dans **Mon Compte** → **Abonnement**
6. Cliquez sur **"Restaurer mes achats"**
7. ✅ Vérifiez que l'abonnement est restauré

#### Test 4: Échec de Transaction
1. Dans Xcode, ouvrez **Debug** → **StoreKit** → **Transaction Manager**
2. Avant de faire un achat, activez **"Fail Transactions"**
3. Tentez un achat
4. ✅ Vérifiez que l'erreur est gérée correctement avec un message approprié

---

## 🔍 Debugging avec StoreKit Testing

### Transaction Manager
Dans Xcode, pendant que l'app tourne:

1. Allez dans **Debug** → **StoreKit** → **Manage Transactions...**

2. Vous verrez tous les achats effectués avec:
   - **Transaction ID**
   - **Product ID**
   - **Date d'achat**
   - **Status**

3. Actions disponibles:
   - **Refund**: Simuler un remboursement
   - **Expire**: Forcer l'expiration d'un abonnement
   - **Clear Purchases**: Supprimer tous les achats pour retester

### Simulation de Scénarios Avancés

#### Simuler l'Expiration d'un Abonnement
1. Effectuez un achat
2. Dans Transaction Manager, sélectionnez la transaction
3. Cliquez sur **"Expire Subscription"**
4. ✅ L'abonnement expire immédiatement
5. Vérifiez que l'app détecte l'expiration

#### Simuler un Remboursement
1. Dans Transaction Manager, sélectionnez une transaction
2. Cliquez sur **"Refund"**
3. ✅ Vérifiez que l'app gère le remboursement

#### Tester le Renouvellement Automatique
1. Dans le fichier `.storekit`, sélectionnez votre produit
2. Modifiez **Subscription Duration** à **"5 Minutes"** pour les tests
3. Effectuez un achat
4. Attendez 5 minutes
5. ✅ Vérifiez que l'abonnement se renouvelle automatiquement

---

## 📊 Vérification des Logs

Dans la console Xcode, vous devriez voir:

```
[IAP] RevenueCat initialisé
[IAP] Configuration: appl_XXXXXXXXXXXXX
[IAP] Plateforme: iOS
[IAP] Récupération des offres disponibles...
[IAP] Offerings chargées: 1 package(s)
[IAP] Package disponible: monthly (com.missdee.carflextest.pro.monthly)
[IAP] Prix: 2,99 €

// Lors d'un achat
[IAP] Achat du package: monthly
[IAP] Traitement de l'achat...
[IAP] Transaction ID: ABC123XYZ
[IAP] Achat réussi
[IAP] Appel de verify-ios-purchase...
[IAP] Réponse serveur: 200
[IAP] Abonnement synchronisé avec succès
```

---

## 🔄 Workflow de Test Recommandé

### Avant Chaque Session de Test
```bash
# 1. Mettre à jour le code
git pull

# 2. Installer les dépendances
npm install

# 3. Build
npm run build

# 4. Sync iOS
npx cap sync ios
```

### Pendant les Tests
1. ✅ Testez l'achat initial
2. ✅ Testez l'annulation
3. ✅ Testez la restauration
4. ✅ Testez les erreurs (fail transactions)
5. ✅ Testez l'expiration
6. ✅ Testez le remboursement

### Après les Tests
- Dans Transaction Manager, cliquez sur **"Clear All Transactions"**
- Relancez l'app pour un nouvel environnement propre

---

## ⚠️ Différences avec Production

**StoreKit Testing vs Production:**

| Feature | StoreKit Testing | Production |
|---------|-----------------|------------|
| Compte Apple requis | ❌ Non | ✅ Oui |
| Vraie transaction | ❌ Non | ✅ Oui |
| Webhooks | ❌ Non (locaux) | ✅ Oui |
| Délais Apple | ❌ Instantané | ⏱️ Quelques secondes |
| Renouvellement | ⚡ Rapide (configurable) | 🐌 Temps réel (1 mois) |

**Important:**
- StoreKit Testing ne déclenche **PAS** les webhooks RevenueCat réels
- Les durées d'abonnement sont accélérées (ex: 1 mois = 5 minutes)
- Les transactions ne sont **pas** envoyées à Apple

---

## 🚀 Prochaines Étapes: Tester en Sandbox

Une fois les tests locaux terminés avec StoreKit Testing, passez aux tests Sandbox:

1. **Créer un compte Sandbox** dans App Store Connect
2. **Connecter le device** avec ce compte Sandbox
3. **Désactiver StoreKit Testing** dans le scheme Xcode
4. **Tester les vraies transactions** avec webhooks

Guide complet: Voir `IOS_IAP_SETUP.md` section 4.

---

## 🆘 Troubleshooting

### Problème: Les produits n'apparaissent pas
**Solution:**
- Vérifiez que le fichier `.storekit` est bien sélectionné dans le scheme
- Vérifiez les Product IDs correspondent exactement
- Redémarrez Xcode

### Problème: "Unable to complete purchase"
**Solution:**
- Vérifiez que RevenueCat est bien configuré avec la bonne clé API
- Vérifiez les logs dans la console Xcode
- Vérifiez que le Product ID existe dans le fichier `.storekit`

### Problème: L'abonnement ne se synchronise pas
**Solution:**
- Vérifiez que l'edge function `verify-ios-purchase` est déployée
- Vérifiez les logs réseau dans Xcode
- Vérifiez la table `user_subscriptions` dans Supabase

### Problème: Impossible de restaurer les achats
**Solution:**
- Dans Transaction Manager, cliquez sur "Clear All Transactions"
- Effectuez un nouvel achat
- Puis testez la restauration

---

## 📚 Ressources Officielles

- [Documentation StoreKit Testing - Apple](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)
- [RevenueCat Testing Guide](https://docs.revenuecat.com/docs/testing-and-debugging)
- [StoreKit Testing Video - WWDC](https://developer.apple.com/videos/play/wwdc2020/10659/)

---

## ✅ Checklist de Test Complète

Avant de passer en production, assurez-vous que:

- [ ] Achat initial fonctionne
- [ ] Annulation d'achat fonctionne
- [ ] Restauration d'achat fonctionne
- [ ] Gestion des erreurs fonctionne
- [ ] Badge Pro apparaît après achat
- [ ] Fonctionnalités Pro sont débloquées
- [ ] Logs sont clairs et complets
- [ ] Synchronisation avec Supabase fonctionne
- [ ] Transaction Manager affiche les achats correctement
- [ ] Clear Transactions réinitialise l'environnement

Une fois tous ces tests passés avec StoreKit Testing, vous êtes prêt pour les tests Sandbox puis la production! 🚀
