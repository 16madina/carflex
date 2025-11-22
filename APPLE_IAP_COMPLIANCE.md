# Conformité aux règles Apple In-App Purchase

Ce document explique comment l'application CarFlex respecte les règles strictes d'Apple concernant les achats in-app.

## ✅ Règle d'Apple

**Règle App Store Review Guideline 3.1.1** :
> Les apps proposant des contenus ou fonctionnalités numériques (abonnements, monnaies virtuelles, contenus premium) **DOIVENT** utiliser exclusivement le système d'In-App Purchase d'Apple sur iOS. Il est **INTERDIT** d'afficher des liens ou boutons vers des systèmes de paiement externes (Stripe, PayPal, Wave, etc.) pour ces achats.

Source : [Apple Developer Guidelines](https://developer.apple.com/app-store/review/guidelines/#payments)

## 🎯 Ce qui est concerné

Dans CarFlex, les achats suivants sont des **contenus numériques** et doivent passer par IAP sur iOS :
- ✅ **Abonnement Pro** : accès aux fonctionnalités premium
- ✅ **Packages Premium** : mise en avant des annonces (3 jours, 7 jours, 15 jours)

## 🚫 Ce qui n'est PAS concerné

Les paiements suivants **peuvent** utiliser Stripe/PayPal/Wave même sur iOS :
- ❌ Biens physiques (achat d'une voiture réelle)
- ❌ Services du monde réel (location de voiture réelle)
- ❌ Frais de service entre utilisateurs

**Note** : CarFlex étant une marketplace, si vous ajoutez des paiements pour l'achat/location de véhicules réels entre utilisateurs, ces paiements peuvent utiliser Stripe sur toutes les plateformes.

## ✅ Implémentation dans CarFlex

### Détection de plateforme

Le code détecte automatiquement la plateforme avec Capacitor :

```typescript
import { Capacitor } from '@capacitor/core';

const isIOS = Capacitor.getPlatform() === 'ios';
```

### Comportement par plateforme

#### Sur iOS (iPhone/iPad) :

1. **Abonnement Pro** (`/subscription`) :
   - Bouton "Passer à Pro" → Appelle directement `storeKitService.purchase()`
   - Pas de sélecteur de paiement
   - Aucun lien vers Stripe/PayPal/Wave

2. **Packages Premium** (`/promote-listing`) :
   - Bouton "Acheter via l'App Store" → Appelle directement `handleIOSPremiumPurchase()`
   - Le composant `PaymentMethodSelector` n'est **jamais affiché**
   - Aucune mention de Stripe/PayPal/Wave

#### Sur Android & Web :

1. **Abonnement Pro** :
   - Bouton "Passer à Pro" → Affiche le sélecteur de paiement
   - Options : Stripe, Apple Pay (web), Wave (bientôt), PayPal (bientôt)

2. **Packages Premium** :
   - Bouton "Continuer vers le paiement" → Affiche le `PaymentMethodSelector`
   - Options : Stripe, Apple Pay (web), Wave (bientôt), PayPal (bientôt)

### Code de conformité

#### Dans `src/pages/PromoteListing.tsx` :

```typescript
const handlePromote = async () => {
  // ...
  
  // Sur iOS, appeler directement l'achat natif (règles App Store)
  if (isIOS) {
    await handleIOSPremiumPurchase();
  } else {
    // Sur web/Android, afficher le sélecteur de paiement
    setShowPaymentSelector(true);
  }
};

// PaymentMethodSelector uniquement sur Web/Android
{!isIOS && (
  <PaymentMethodSelector
    open={showPaymentSelector}
    onOpenChange={setShowPaymentSelector}
    onSelectMethod={handlePaymentMethod}
    amount={selectedPackageData?.price || 0}
    formatPrice={formatPrice}
  />
)}
```

#### Dans `src/pages/Subscription.tsx` :

```typescript
const handleSubscribe = async () => {
  // ...
  
  // Sur iOS, utiliser les achats in-app natifs
  if (isIOS) {
    await handleIOSPurchase();
  } else {
    // Sur web/Android, utiliser Stripe
    await handleStripePurchase();
  }
};

// Pas de PaymentMethodSelector, le choix est automatique selon la plateforme
```

## 📋 Checklist de conformité

Avant de soumettre à l'App Store, vérifiez :

- [ ] ✅ Sur iOS, aucun bouton Stripe/PayPal/Wave n'est visible
- [ ] ✅ Sur iOS, les achats utilisent exclusivement StoreKit
- [ ] ✅ Sur iOS, le texte des boutons mentionne "App Store" ou "Acheter"
- [ ] ✅ Les produits IAP sont créés dans App Store Connect
- [ ] ✅ Les prix IAP correspondent aux prix sur web/Android
- [ ] ✅ La restauration des achats fonctionne
- [ ] ✅ Les achats sont vérifiés côté serveur avec l'API App Store Server

## 🔍 Tests de conformité

### Test 1 : Vérifier qu'aucun lien externe n'est visible sur iOS

1. Lancez l'app sur un simulateur iOS
2. Naviguez vers `/subscription`
3. Vérifiez : **Pas de mention de Stripe, PayPal, Wave**
4. Naviguez vers `/promote-listing`
5. Vérifiez : **Pas de sélecteur de paiement, juste "Acheter via l'App Store"**

### Test 2 : Vérifier que Stripe fonctionne sur Web

1. Ouvrez l'app dans un navigateur web
2. Naviguez vers `/subscription`
3. Cliquez sur "Passer à Pro"
4. Vérifiez : **Le sélecteur de paiement s'affiche avec Stripe**

### Test 3 : Vérifier que Stripe fonctionne sur Android

1. Lancez l'app sur un appareil Android
2. Naviguez vers `/subscription`
3. Cliquez sur "Passer à Pro"
4. Vérifiez : **Le sélecteur de paiement s'affiche avec Stripe**

## ⚠️ Avertissements

### Rejet automatique si non-conforme

Si Apple détecte :
- Un bouton "Payer avec Stripe" sur iOS
- Un lien vers un site de paiement externe
- Une mention "Abonnez-vous sur le web pour moins cher"

→ **Rejet automatique de l'app** (Guideline 3.1.1)

### Prix "équitables" (Business Steering)

Depuis 2024, Apple autorise de mentionner que des prix différents existent ailleurs, MAIS :
- Vous ne pouvez PAS dire que c'est moins cher ailleurs
- Vous ne pouvez PAS mettre de lien cliquable vers le web
- Vous ne pouvez PAS encourager les utilisateurs à acheter ailleurs

**Recommandation** : Gardez les mêmes prix sur toutes les plateformes.

## 📚 Ressources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/#payments)
- [In-App Purchase Programming Guide](https://developer.apple.com/documentation/storekit/in-app_purchase)
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [StoreKit Testing Guide](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)

## 🆘 En cas de rejet

Si Apple rejette votre app pour violation de la 3.1.1 :

1. **Vérifiez le code** : Assurez-vous qu'aucun sélecteur de paiement n'est visible sur iOS
2. **Vérifiez les screenshots** : Ne montrez PAS de captures d'écran avec Stripe visible
3. **Vérifiez la description** : Ne mentionnez PAS "payez moins cher sur le web"
4. **Répondez à Apple** : Expliquez que vous utilisez IAP sur iOS et Stripe uniquement sur web/Android

## ✅ Résumé

CarFlex respecte les règles Apple en :
1. Utilisant StoreKit exclusivement sur iOS pour les achats numériques
2. N'affichant jamais de boutons Stripe/PayPal/Wave sur iOS
3. Permettant Stripe sur Android et Web (où c'est autorisé)
4. Vérifiant tous les achats côté serveur avec l'API App Store Server

**Résultat** : App conforme et prête pour soumission à l'App Store ✅
