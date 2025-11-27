# Checklist de Soumission App Store - CarFlex

## 📋 Configuration App Store Connect - ÉTAPES OBLIGATOIRES

### ✅ Étape 1 : Ajouter le lien Privacy Policy

**Navigation :**
1. Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
2. Sélectionnez votre app **CarFlex**
3. Cliquez sur l'onglet **App Information** (dans la barre latérale gauche)
4. Descendez jusqu'à la section **General Information**

**Action :**
- Dans le champ **Privacy Policy URL**, entrez :
  ```
  https://carflex.lovable.app/privacy-policy
  ```
  *(Si vous avez un domaine personnalisé, utilisez-le à la place)*

- Cliquez sur **Save** en haut à droite

**✅ Vérification :**
- Le lien doit être cliquable et afficher la page de politique de confidentialité complète
- La page doit être accessible sans authentification

---

### ✅ Étape 2 : Configurer l'EULA (End User License Agreement)

**Option A : Utiliser l'EULA Standard d'Apple** (Plus simple)

1. Dans App Store Connect → **Pricing and Availability**
2. Cochez **"Use Apple's standard End User License Agreement (EULA)"**
3. Sauvegardez

Puis ajoutez dans la **Description de l'App** :
```
📄 Conditions d'utilisation : https://carflex.lovable.app/terms-of-service
```

**Option B : EULA Personnalisé** (Recommandé)

1. Dans App Store Connect → **App Information** → **License Agreement**
2. Cliquez sur **+ End User License Agreement**
3. Visitez : https://carflex.lovable.app/terms-of-service
4. Copiez tout le texte (sans le HTML)
5. Collez dans le champ EULA
6. Sauvegardez

---

### ✅ Étape 3 : Vérifier la Description de l'App

Dans **App Store** → **App Information** → **Description**, assurez-vous que ceci est inclus :

```
📱 ABONNEMENT PRO
- Durée : Mensuel (renouvellement automatique)
- Prix : 10 000 XOF/mois
- Annonces illimitées et fonctionnalités premium
- Gérez votre abonnement dans les Réglages Apple

📄 Liens importants :
Politique de confidentialité : https://carflex.lovable.app/privacy-policy
Conditions d'utilisation : https://carflex.lovable.app/terms-of-service
```

---

### ✅ Étape 4 : Vérifier l'Abonnement In-App

**Navigation :**
1. App Store Connect → **Features** → **In-App Purchases**
2. Sélectionnez `com.missdee.carflextest.subscription.pro.monthly`

**Vérification :**
- **Display Name** : Abonnement CarFlex Pro
- **Description** : Accès à toutes les fonctionnalités premium
- **Duration** : 1 Month
- **Price** : 10 000 XOF

---

## ✅ Corrections Appliquées

### Guideline 2.1 - Performance (Achat Échoué)
**Problème :** Erreur lors de l'achat d'abonnement avec compte Sandbox Apple.

**Solution :**
- ✅ Validation Production → Sandbox automatique dans `verify-ios-purchase`
- ✅ Détection erreurs 21007/404 = reçu Sandbox
- ✅ Retry automatique avec API Sandbox
- ✅ Logs détaillés pour debugging

**Tests :**
- [ ] Achat avec compte Sandbox → Doit fonctionner
- [ ] Logs backend confirment détection environnement

---

### Guideline 3.1.1 - In-App Purchase (Codes Promo)
**Problème :** Codes promo pour débloquer abonnements sur iOS (interdit).

**Solution :**
- ✅ Codes promo supprimés sur iOS (`isIOS` check)
- ✅ Codes promo restent disponibles Web/Android (Stripe)
- ✅ iOS utilise uniquement Apple IAP natif

**Tests :**
- [ ] Sur iOS : AUCUN champ code promo visible
- [ ] Sur Web/Android : Champ code promo présent
- [ ] Achat iOS fonctionne sans code

---

### Guideline 3.1.2 - Subscriptions (Liens Manquants)
**Problème :** Liens Privacy Policy et Terms of Use manquants.

**Solution :**
- ✅ Encadré informatif ajouté sur page abonnement iOS
- ✅ Contient : Titre, Durée, Prix, Liens fonctionnels
- ✅ Liens vers Privacy Policy et Terms of Use
- ✅ Guide de configuration App Store Connect

**Tests :**
- [ ] Sur iOS : Encadré visible avec toutes les infos
- [ ] Liens cliquables et fonctionnels
- [ ] App Store Connect : URLs configurées

---

### Guideline 1.2 - Contenu Généré par Utilisateurs
**Statut :** ✅ DÉJÀ CONFORME

- ✅ CGU avec politique tolérance zéro
- ✅ Système de signalement
- ✅ Blocage d'utilisateurs
- ✅ Panneau de modération admin
- ✅ Délai 24h pour review contenus signalés

---

### Guideline 5.1.2 - App Tracking Transparency
**Statut :** ✅ IMPLÉMENTÉ

- ✅ Plugin ATT installé
- ✅ Dialogue explicatif avant prompt système
- ✅ Message clair sur données collectées

---

## 📸 Captures d'Écran Requises

Préparez ces captures pour la soumission :
1. ✅ Page abonnement iOS avec encadré informatif
2. ✅ Lien Privacy Policy cliqué → page affichée
3. ✅ Lien Terms of Use cliqué → page affichée
4. ✅ Flux achat Apple IAP (sans code promo)

---

## 📝 Notes pour l'Équipe de Review Apple

**Compte de test :**
- Email : reviewer@carflex.test
- Password : ReviewTest2024!

**Guideline 2.1 - Performance :**
✅ Fixed: Receipt validation now handles both Production and Sandbox environments automatically.

**Guideline 3.1.1 - In-App Purchase :**
✅ Fixed: Promo codes removed from iOS. Only native Apple IAP is used for subscriptions on iOS.

**Guideline 3.1.2 - Subscriptions :**
✅ Fixed: All subscription information displayed in app:
- Subscription title: "Abonnement CarFlex Pro"
- Duration: "Monthly (auto-renewable)"
- Price: "10,000 XOF/month"
- Functional links to Privacy Policy and Terms of Use

✅ Metadata configured:
- Privacy Policy URL: https://carflex.lovable.app/privacy-policy
- EULA: [Configured in App Store Connect]

**Guideline 1.2 - User Generated Content :**
✅ Already compliant:
- Zero-tolerance policy in Terms of Service
- Content reporting system
- User blocking functionality
- Admin moderation panel
- 24-hour review SLA

---

## ✅ Checklist Finale Avant Soumission

### Configuration App Store Connect
- [ ] Privacy Policy URL configurée
- [ ] EULA configuré (Standard Apple OU Custom)
- [ ] Description mentionne les liens
- [ ] Abonnement In-App vérifié

### Tests Fonctionnels
- [ ] Achat avec Sandbox fonctionne (Guideline 2.1)
- [ ] Aucun code promo visible sur iOS (Guideline 3.1.1)
- [ ] Encadré info + liens visibles sur iOS (Guideline 3.1.2)
- [ ] Privacy Policy accessible
- [ ] Terms of Use accessible

### Documents
- [ ] Captures d'écran préparées
- [ ] Note pour review Apple prête
- [ ] Guide de compliance vérifié

---

## 🔄 Prochaines Étapes

1. **Configurer App Store Connect** (voir étapes ci-dessus)
2. **Build de production**
   ```bash
   npm run build
   npx cap sync ios
   ```
3. **Tests sur device iOS réel**
4. **Archive Xcode** → Upload App Store Connect
5. **Soumission avec notes pour Apple**

---

## 📚 Documents de Référence

- `APPLE_GUIDELINE_2.1_FIX.md` - Fix validation reçus
- `APPLE_REVIEW_GUIDELINE_3.1.1_CHANGES.md` - Suppression codes promo iOS
- `APPLE_GUIDELINE_3.1.2_COMPLIANCE.md` - Liens EULA et Privacy Policy
- `APPLE_GUIDELINE_1.2_COMPLIANCE.md` - Modération contenu

---

**Date de dernière mise à jour :** 27 novembre 2025  
**Build concerné :** Version 1.0.0  
**Guidelines corrigées :** 2.1, 3.1.1, 3.1.2, 1.2, 5.1.2
