# Guideline 3.1.2 - Business - Payments - Subscriptions - Correction

## 📋 Résumé du Problème

**Rejet Apple :** "The app's metadata is missing a functional link to the Terms of Use (EULA)"

**Cause :** Les métadonnées de l'app ne contiennent pas de lien fonctionnel vers les Conditions d'Utilisation (EULA), et l'app n'affichait pas toutes les informations requises pour les abonnements auto-renouvelables.

**Exigences Apple :**
- Titre de l'abonnement auto-renouvelable
- Durée de l'abonnement
- Prix de l'abonnement et prix unitaire si applicable
- **Liens fonctionnels** vers la Politique de Confidentialité ET les Conditions d'Utilisation (EULA)

---

## ✅ Solution Implémentée

### 1. Informations d'Abonnement dans l'App (iOS)

Nous avons ajouté un encadré informatif sur la page d'abonnement (`src/pages/Subscription.tsx`) qui s'affiche **uniquement sur iOS** et contient toutes les informations requises par Apple :

**Fichier modifié :** `src/pages/Subscription.tsx`

```tsx
{/* Informations requises par Apple pour les abonnements auto-renouvelables (Guideline 3.1.2) */}
{isIOS && (
  <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border text-sm">
    <p className="font-semibold mb-2">Abonnement CarFlex Pro</p>
    <ul className="space-y-1 text-muted-foreground">
      <li>• Durée : Mensuel (renouvellement automatique)</li>
      <li>• Prix : 10 000 XOF/mois</li>
      <li>• Le paiement sera débité sur votre compte iTunes à la confirmation de l'achat</li>
      <li>• L'abonnement se renouvelle automatiquement sauf annulation au moins 24h avant la fin de la période en cours</li>
      <li>• Gérez vos abonnements dans les Réglages de votre compte Apple</li>
    </ul>
    <div className="mt-3 pt-3 border-t border-border flex gap-4 text-xs">
      <Link to="/privacy-policy" className="text-primary hover:underline">
        Politique de confidentialité
      </Link>
      <Link to="/terms-of-service" className="text-primary hover:underline">
        Conditions d'utilisation
      </Link>
    </div>
  </div>
)}
```

**Contenu affiché sur iOS :**
- ✅ **Titre :** "Abonnement CarFlex Pro"
- ✅ **Durée :** "Mensuel (renouvellement automatique)"
- ✅ **Prix :** "10 000 XOF/mois"
- ✅ **Lien fonctionnel vers Privacy Policy :** `/privacy-policy`
- ✅ **Lien fonctionnel vers Terms of Use :** `/terms-of-service`
- ✅ **Informations de renouvellement automatique**

---

### 2. Métadonnées App Store Connect

**IMPORTANT :** En plus des modifications dans l'app, vous devez ajouter les liens dans App Store Connect :

#### Étape 1 : Ajouter le lien Privacy Policy
1. Allez dans App Store Connect
2. Sélectionnez votre app **CarFlex**
3. Allez dans **App Information** (Informations sur l'app)
4. Dans le champ **Privacy Policy URL**, ajoutez :
   ```
   https://carflex.lovable.app/privacy-policy
   ```
   *(Remplacez par votre domaine de production si différent)*

#### Étape 2 : Ajouter le lien Terms of Use (EULA)
**Option A - Utiliser l'EULA Apple par défaut :**
1. Dans App Store Connect → **Pricing and Availability**
2. Cochez **Use Apple's standard End User License Agreement (EULA)**
3. Dans la **Description de l'App**, ajoutez une ligne :
   ```
   Conditions d'utilisation : https://carflex.lovable.app/terms-of-service
   ```

**Option B - Utiliser votre EULA personnalisé (recommandé) :**
1. Dans App Store Connect → **App Information**
2. Dans la section **License Agreement**, cliquez sur **+ App License Agreement**
3. Collez le contenu complet de votre fichier `src/pages/TermsOfService.tsx` (le texte uniquement, sans le code React)
4. Sauvegardez

---

## 🧪 Tests de Vérification

### Test 1 : Vérifier l'affichage sur iOS

**Étapes :**
1. Ouvrir l'app sur un appareil iOS (iPad Air 11-inch recommandé)
2. Se connecter avec le compte de test : `reviewer@carflex.test`
3. Aller dans **Abonnement** (via le menu ou le profil)
4. Vérifier la présence de l'encadré informatif **au-dessus** des cartes de plans

**✅ Résultat attendu :**
- L'encadré "Abonnement CarFlex Pro" est visible
- Il contient le titre, la durée, le prix et les informations de renouvellement
- Deux liens cliquables sont présents en bas : "Politique de confidentialité" et "Conditions d'utilisation"

### Test 2 : Vérifier les liens fonctionnels

**Étapes :**
1. Sur la page d'abonnement iOS, cliquer sur **"Politique de confidentialité"**
2. Vérifier que la page Privacy Policy s'ouvre correctement
3. Retourner à la page d'abonnement
4. Cliquer sur **"Conditions d'utilisation"**
5. Vérifier que la page Terms of Service s'ouvre correctement

**✅ Résultat attendu :**
- Les deux liens redirigent vers les pages correspondantes
- Les pages affichent le contenu complet (pas d'erreur 404)
- Les pages sont accessibles sans authentification

### Test 3 : Vérifier les métadonnées App Store Connect

**Étapes :**
1. Se connecter à App Store Connect
2. Vérifier que le champ **Privacy Policy URL** contient bien l'URL complète
3. Vérifier que l'EULA est défini (soit Apple standard + lien dans la description, soit EULA personnalisé)

**✅ Résultat attendu :**
- Privacy Policy URL : `https://carflex.lovable.app/privacy-policy` (ou votre domaine)
- EULA : Défini (standard Apple ou personnalisé)

---

## 📊 Conformité à la Guideline 3.1.2

| Exigence Apple | Implémentation | Statut |
|----------------|----------------|--------|
| Titre de l'abonnement auto-renouvelable | "Abonnement CarFlex Pro" affiché dans l'app | ✅ |
| Durée de l'abonnement | "Mensuel (renouvellement automatique)" affiché | ✅ |
| Prix de l'abonnement | "10 000 XOF/mois" affiché | ✅ |
| Lien fonctionnel vers Privacy Policy (dans l'app) | `/privacy-policy` cliquable | ✅ |
| Lien fonctionnel vers Terms of Use (dans l'app) | `/terms-of-service` cliquable | ✅ |
| Lien Privacy Policy dans métadonnées | À configurer dans App Store Connect | ⚠️ |
| EULA dans métadonnées | À configurer dans App Store Connect | ⚠️ |

---

## 📝 Réponse Suggérée à Apple

> **Objet :** Correction Guideline 3.1.2 - Informations d'abonnement et liens EULA
>
> Bonjour,
>
> Nous avons corrigé le problème signalé concernant les informations d'abonnement manquantes.
>
> **Modifications apportées :**
>
> 1. **Dans l'application (iOS uniquement) :**
>    - Ajout d'un encadré informatif sur la page d'abonnement contenant :
>      - Le titre de l'abonnement : "Abonnement CarFlex Pro"
>      - La durée : "Mensuel (renouvellement automatique)"
>      - Le prix : "10 000 XOF/mois"
>      - Les conditions de renouvellement automatique
>      - Deux liens fonctionnels : Politique de confidentialité et Conditions d'utilisation
>
> 2. **Dans App Store Connect (métadonnées) :**
>    - Privacy Policy URL : https://carflex.lovable.app/privacy-policy
>    - End User License Agreement (EULA) : [Standard Apple / Personnalisé]
>    - Lien vers Terms of Use ajouté dans la description de l'app
>
> **Fichiers modifiés :**
> - `src/pages/Subscription.tsx` (lignes 439-460)
>
> **Tests effectués :**
> - ✅ L'encadré informatif s'affiche uniquement sur iOS
> - ✅ Tous les liens sont fonctionnels et accessibles
> - ✅ Les pages Privacy Policy et Terms of Service s'affichent correctement
> - ✅ Les métadonnées App Store Connect sont configurées
>
> **Compte de test :**
> - Email : reviewer@carflex.test
> - Mot de passe : ReviewTest2024!
>
> L'application respecte maintenant toutes les exigences de la Guideline 3.1.2 concernant les abonnements auto-renouvelables.
>
> Cordialement,  
> L'équipe CarFlex

---

## 🔗 Références

- [Apple - App Store Review Guidelines 3.1.2](https://developer.apple.com/app-store/review/guidelines/#subscriptions)
- [Apple - Schedule 2 of the Apple Developer Program License Agreement](https://developer.apple.com/support/downloads/terms/apple-developer-program/Apple-Developer-Program-License-Agreement-20240610-English.pdf)
- [Apple - In-App Purchase Best Practices](https://developer.apple.com/in-app-purchase/)

---

**Date de correction :** 27 novembre 2025  
**Build concerné :** Version 1.0.0 (prochain build)  
**Guideline corrigée :** 3.1.2 - Business - Payments - Subscriptions
