# Corrections pour Apple App Store Review

## ✅ Problème 5.1.1 (Account Deletion) - RÉSOLU
Apple a confirmé avoir trouvé la fonctionnalité de suppression de compte.

### Améliorations ajoutées :
- ✅ **Période de grâce de 30 jours** avant suppression définitive
- ✅ **Email de confirmation** envoyé automatiquement avec :
  - Date de suppression définitive
  - Rappel de la possibilité d'annuler
  - Liste des données qui seront supprimées
- ✅ **Annulation automatique** en se reconnectant avant la date limite
- ✅ **Tâche planifiée** (cron job) qui nettoie les comptes expirés quotidiennement

---

## 🔧 Problème 3.1.1 (In-App Purchase) - CORRIGÉ

**Bug identifié :** Chargement infini lors du clic sur "Passer à Pro" sur iOS/iPad

### Corrections appliquées :

#### 1. Amélioration du service StoreKit (`src/services/storekit.ts`)
- ✅ Logging détaillé à chaque étape (timestamps, états)
- ✅ Messages d'erreur plus clairs et spécifiques en français
- ✅ Meilleure gestion des erreurs natives iOS

#### 2. Réduction du timeout (`src/pages/Subscription.tsx`)
- ⏱️ **Timeout réduit de 60s à 30s** pour détecter plus rapidement les problèmes
- 📱 **Message amélioré** : "Le paiement n'a pas répondu. Vérifiez vos achats dans Réglages > App Store"
- 🔄 **Meilleure feedback** : Toast avec message "Ouverture App Store..." au lieu de "Traitement en cours..."

#### 3. Plugin natif StoreKit
- ✅ Le plugin Swift (`ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift`) est correctement configuré
- ✅ Gestion des transactions avec SKPaymentQueue
- ✅ Gestion des erreurs natives (E_USER_CANCELLED, E_PAYMENT_INVALID, etc.)

### Comment tester :
1. **Sur un appareil iOS/iPad physique** (obligatoire - ne fonctionne pas sur simulateur)
2. Connectez-vous à l'app CarFlex
3. Allez dans Abonnement → Cliquez sur "Passer à Pro"
4. Le système de paiement Apple devrait s'ouvrir sous 2-3 secondes
5. Si rien ne se passe après 30 secondes, un message d'erreur s'affichera

### Logs de débogage :
Tous les événements sont maintenant loggés dans la console avec le préfixe `[StoreKit]` :
- `====== PURCHASE START ======`
- Détails du produit et statut du service
- `====== PURCHASE SUCCESS ======` ou `====== PURCHASE ERROR ======`

---

## 🔧 Problème 5.1.2 (App Tracking Transparency) - CORRIGÉ

**Bug identifié :** Le dialogue ATT n'est pas déclenché au lancement de l'app

### Corrections appliquées :

#### 1. Import correct du plugin (`src/hooks/useAppTracking.ts`)
**AVANT :**
```typescript
const AppTrackingTransparency = (window as any).AppTrackingTransparency;
```

**APRÈS :**
```typescript
import { AppTrackingTransparency, AppTrackingStatus } from 'capacitor-plugin-app-tracking-transparency';
```

#### 2. Vérification du statut avant de demander la permission
- ✅ L'app vérifie d'abord le statut avec `AppTrackingTransparency.getStatus()`
- ✅ Le dialogue n'apparaît que si le statut est `notDetermined`
- ✅ Mapping correct des statuts (notDetermined → not-determined)

#### 3. Appel automatique au lancement
- ✅ Le hook `useAppTracking()` est appelé dans `App.tsx` au lancement
- ✅ Délai de 1.5 secondes pour laisser l'app se charger
- ✅ Logging détaillé avec préfixe `[ATT]`

### Comment tester :
1. **Désinstaller complètement** l'app de l'iPhone/iPad
2. **Réinstaller** la nouvelle version
3. Au premier lancement, après 1.5 secondes, le dialogue ATT devrait apparaître :
   > "Cette app souhaite vous suivre sur les apps et sites web d'autres sociétés afin de vous proposer de meilleures offres et publicités personnalisées."
4. L'utilisateur peut choisir "Autoriser" ou "Demander à l'app de ne pas effectuer le suivi"

### Configuration requise (déjà en place) :
✅ `NSUserTrackingUsageDescription` dans `ios/App/App/Info.plist` (lignes 48-49)
✅ Plugin `capacitor-plugin-app-tracking-transparency` installé (v2.0.5)
✅ Hook appelé au démarrage dans `App.tsx`

### Logs de débogage :
Tous les événements ATT sont loggés avec le préfixe `[ATT]` :
- `[ATT] Current status: notDetermined/authorized/denied/restricted`
- `[ATT] Requesting tracking permission...`
- `[ATT] Permission result: { status: '...' }`

---

## 📋 Checklist de test pour Apple

### Test du problème 3.1.1 (Achats In-App)
- [ ] Tester sur iPhone/iPad **physique** (pas simulateur)
- [ ] L'App Store doit s'ouvrir sous 2-3 secondes
- [ ] Le processus d'achat doit se compléter sans freeze
- [ ] En cas de timeout (30s), message d'erreur clair s'affiche
- [ ] Vérifier les logs Xcode avec préfixe `[StoreKit]`

### Test du problème 5.1.2 (ATT)
- [ ] **Désinstaller** puis **réinstaller** l'app
- [ ] Au **premier lancement**, après 1.5s, le dialogue ATT doit apparaître
- [ ] Le texte du dialogue doit correspondre au NSUserTrackingUsageDescription
- [ ] Tester "Autoriser" et "Demander de ne pas suivre"
- [ ] Vérifier les logs Xcode avec préfixe `[ATT]`

---

## 🚀 Prochaines étapes

1. **Compiler et installer** la nouvelle version sur un appareil iOS physique
2. **Tester les deux fonctionnalités** selon les checklists ci-dessus
3. **Vérifier les logs** dans Xcode pour confirmer que tout fonctionne
4. **Soumettre la nouvelle build** à Apple pour review

---

## 📞 Support technique

Si les problèmes persistent après ces corrections :
- Consulter les logs Xcode avec les préfixes `[ATT]` et `[StoreKit]`
- Vérifier que l'appareil est connecté à Internet
- S'assurer que les achats in-app sont activés dans les réglages iOS
- Confirmer que le produit `com.missdee.carflextest.subscription.pro.monthly` est bien configuré dans App Store Connect
