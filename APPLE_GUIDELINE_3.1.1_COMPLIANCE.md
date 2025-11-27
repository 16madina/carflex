# Conformité à la Guideline 3.1.1 - In-App Purchase

## 📋 Résumé Exécutif

CarFlex a implémenté un système d'achats in-app conforme aux exigences de la Guideline 3.1.1 de l'App Store. L'application utilise exclusivement le système natif d'Apple (StoreKit) pour tous les achats sur iOS, sans aucun mécanisme alternatif de paiement ou de codes promotionnels saisis dans l'application.

---

## 🎯 Exigence Apple : Guideline 3.1.1

**Citation officielle :**
> If you want to unlock features or functionality within your app, you must use in-app purchase. Apps may not use their own mechanisms to unlock content or functionality, such as license keys, augmented reality markers, QR codes, cryptocurrencies and cryptocurrency wallets, **promo codes entered in the app**, etc.

---

## ✅ Implémentation Conforme de CarFlex

### 1. Achats In-App Natifs (iOS)

**Tous les achats sur iOS utilisent StoreKit :**
- **Abonnement Pro Plan** : `com.missdee.carflextest.subscription.pro.monthly`
- **Promotions d'annonces** :
  - 3 jours : `com.missdee.carflextest.premium.3jours`
  - 7 jours : `com.missdee.carflextest.premium.7days`
  - 15 jours : `com.missdee.carflextest.premium.15days`

**Code source :**
```typescript
// src/pages/Subscription.tsx
const handleIOSPurchase = async () => {
  // Achat natif iOS via StoreKit UNIQUEMENT
  // Note: Les codes promo doivent être appliqués via l'App Store, pas dans l'app
  const purchaseResult = await storeKitService.purchase(IOS_PRODUCT_ID);
  await syncIOSPurchase(purchaseResult);
};
```

### 2. Codes Promotionnels iOS (Conformité Totale)

**✅ CONFORME : Aucun mécanisme de saisie dans l'app**

L'application iOS **NE CONTIENT PAS** de champ permettant aux utilisateurs de saisir des codes promotionnels. Cette fonctionnalité a été complètement supprimée pour iOS.

**Comment les utilisateurs iOS bénéficient de promotions :**
1. Les offres promotionnelles sont créées dans App Store Connect par les développeurs
2. Les utilisateurs reçoivent des liens promotionnels ou appliquent des codes dans l'App Store
3. L'App Store applique automatiquement la réduction lors de l'achat
4. L'application reçoit simplement la confirmation de l'achat (avec ou sans réduction)

**Code source - Masquage du champ sur iOS :**
```typescript
// src/pages/Subscription.tsx - Lignes 491-522
{/* Codes promo uniquement pour Web/Android (Stripe) */}
{!isIOS && (
  <div className="space-y-2">
    <Button
      type="button"
      variant="outline"
      onClick={() => setShowPromoInput(!showPromoInput)}
      className="w-full"
    >
      <Tag className="mr-2 h-4 w-4" />
      {showPromoInput ? "Masquer" : "Ajouter"} un code promo
    </Button>
    
    {showPromoInput && (
      <Input
        placeholder="Code promo (optionnel)"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
      />
    )}
  </div>
)}
```

**Résultat :**
- ✅ Sur iOS : **AUCUN** champ de saisie de code promo visible
- ✅ Sur Web : Champ de code promo Stripe disponible
- ✅ Sur Android : Champ de code promo Stripe disponible

### 3. Séparation Claire des Plateformes

**iOS (App Store) :**
- ✅ Tous les achats via StoreKit (In-App Purchase)
- ✅ Pas de saisie manuelle de codes promo
- ✅ Offres promotionnelles via App Store Connect uniquement
- ✅ Gestion des abonnements via Réglages iOS

**Web / Android (Stripe) :**
- ✅ Paiements via Stripe Checkout
- ✅ Codes promo Stripe avec saisie dans l'interface
- ✅ Gestion des abonnements via portail Stripe

**Code de détection de plateforme :**
```typescript
import { Capacitor } from "@capacitor/core";

const platform = Capacitor.getPlatform();
const isIOS = platform === 'ios';

// Logique conditionnelle basée sur la plateforme
if (isIOS) {
  await handleIOSPurchase(); // StoreKit natif
} else {
  await handleStripePurchase(); // Stripe avec codes promo
}
```

---

## 🔍 Vérification de Conformité

### Test 1 : Interface iOS

**Étapes :**
1. Ouvrir l'application sur un appareil iOS
2. Aller sur la page `/subscription` (Abonnement)
3. Observer l'interface du Plan Pro

**Résultat attendu :**
- ✅ Bouton "Passer à Pro" visible
- ✅ **AUCUN** bouton "Ajouter un code promo"
- ✅ **AUCUN** champ de saisie de texte pour codes promo
- ✅ Uniquement le bouton "Restaurer mes achats"

### Test 2 : Flux d'Achat iOS

**Étapes :**
1. Sur iOS, cliquer sur "Passer à Pro"
2. Observer le flux de paiement

**Résultat attendu :**
- ✅ Ouverture de la feuille de paiement App Store native
- ✅ **AUCUNE** demande de code promo dans l'application
- ✅ Paiement traité uniquement via Apple

### Test 3 : Interface Web/Android

**Étapes :**
1. Ouvrir l'application sur navigateur web ou Android
2. Aller sur la page `/subscription`
3. Observer l'interface du Plan Pro

**Résultat attendu :**
- ✅ Bouton "Passer à Pro" visible
- ✅ Bouton "Ajouter un code promo" visible
- ✅ Champ de saisie de code promo disponible
- ✅ Redirection vers Stripe pour le paiement

---

## 📊 Résumé Technique

| Aspect | iOS | Web/Android | Conformité |
|--------|-----|-------------|------------|
| Système de paiement | StoreKit natif | Stripe | ✅ Conforme |
| Codes promo dans l'app | ❌ Non disponible | ✅ Disponible | ✅ Conforme |
| Mécanisme alternatif | ❌ Aucun | Stripe (autorisé) | ✅ Conforme |
| Offres promotionnelles | Via App Store uniquement | Via Stripe | ✅ Conforme |
| Gestion abonnement | Réglages iOS | Portail Stripe | ✅ Conforme |

---

## 🧪 Instructions de Test pour l'Équipe de Révision Apple

### Test A : Vérifier l'Absence de Codes Promo sur iOS

1. Ouvrir CarFlex sur un appareil iOS
2. Se connecter avec : `reviewer@carflex.test` / `ReviewTest2024!`
3. Aller dans **Menu → Abonnement**
4. **Vérifier qu'il n'y a AUCUN champ de saisie de code promo**
5. Cliquer sur "Passer à Pro"
6. **Vérifier que seul l'App Store s'ouvre** (pas de code promo demandé)

### Test B : Vérifier les Achats In-App

1. Tester l'achat du Plan Pro (environnement Sandbox)
2. **Vérifier que le paiement passe par Apple uniquement**
3. Cliquer sur "Restaurer mes achats"
4. **Vérifier que la restauration fonctionne via StoreKit**

### Test C : Vérifier la Séparation Web/Android

1. Ouvrir CarFlex dans un navigateur web
2. Aller sur la page Abonnement
3. **Vérifier que le bouton "Ajouter un code promo" est visible**
4. Cette fonctionnalité est autorisée car elle utilise Stripe (pas iOS)

---

## 📝 Réponse à Apple (Guideline 3.1.1)

**Question : "The app uses promo codes to unlock discounts on subscriptions."**

**Réponse officielle :**

> CarFlex a été mise à jour pour respecter intégralement la Guideline 3.1.1. L'application ne propose **aucun mécanisme de saisie de codes promotionnels** sur iOS.
>
> **Sur iOS :**
> - Tous les achats utilisent exclusivement le système In-App Purchase d'Apple (StoreKit)
> - Aucun champ de saisie de code promo n'est présent dans l'interface iOS
> - Les offres promotionnelles peuvent être créées uniquement via App Store Connect
> - Les utilisateurs appliquent les codes directement dans l'App Store (hors de l'application)
>
> **Sur Web/Android :**
> - Les codes promo Stripe sont disponibles (conforme à la Guideline 3.1.3(b) - Multiplatform Services)
> - Cette fonctionnalité est entièrement masquée sur iOS grâce à la détection de plateforme
>
> **Fichiers à examiner pour vérification :**
> - `src/pages/Subscription.tsx` (ligne 491-522) : Masquage du champ de code promo sur iOS
> - `src/pages/PromoteListing.tsx` (ligne 620-641) : Même logique pour les promotions d'annonces
> - `src/services/storekit.ts` : Utilisation exclusive de StoreKit sur iOS
>
> **Test de conformité :**
> Ouvrez l'application sur iOS, allez dans Abonnement, et constatez qu'aucun champ de saisie de code promo n'est présent. L'interface propose uniquement "Passer à Pro" qui ouvre l'App Store natif.

---

## 🔐 Comptes de Test Fournis

### Compte Utilisateur Standard
- **Email :** reviewer@carflex.test
- **Mot de passe :** ReviewTest2024!

### Environnement Sandbox Apple
- Utilisez un compte Apple Sandbox pour tester les achats
- Les achats sont gratuits en environnement Sandbox

---

**Date de conformité :** 27 novembre 2025  
**Version de l'app :** 1.0.0  
**Guideline concernée :** 3.1.1 - Business - Payments - In-App Purchase
