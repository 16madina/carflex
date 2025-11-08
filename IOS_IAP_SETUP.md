# Configuration des Achats In-App iOS

## 🚀 Guide Complet d'Implémentation

### 1. Configuration App Store Connect

#### Créer le Produit IAP
1. Accédez à [App Store Connect](https://appstoreconnect.apple.com/)
2. Sélectionnez votre app **CarFlex**
3. Allez dans **Fonctionnalités** → **Achats in-app**
4. Cliquez sur **+** pour créer un nouveau produit

**Détails du produit :**
- **Type** : Abonnement auto-renouvelable
- **Identifiant de référence** : `pro_monthly`
- **Identifiant du produit** : `com.missdee.carflextest.pro.monthly`
- **Groupe d'abonnements** : `carflex_subscriptions`

**Prix et disponibilité :**
- **Prix** : Tier approprié pour votre marché (ex: 2,99 € / mois)
- **Pays** : Sélectionner tous les pays où l'app sera disponible

**Informations de révision :**
- **Nom d'affichage** : "CarFlex Pro - Mensuel"
- **Description** : "Abonnement mensuel au plan Pro de CarFlex avec annonces illimitées et visibilité maximale"
- **Capture d'écran** : Upload une image montrant les avantages du plan Pro

#### Configurer les Notifications
1. Dans App Store Connect → **Général** → **Informations sur l'app**
2. Configurez l'URL du serveur pour les notifications de serveur :
   - URL : `https://dgmqdovojzzbdovgkawu.supabase.co/functions/v1/ios-subscription-webhook`

---

### 2. Configuration RevenueCat

#### Créer un Compte RevenueCat
1. Allez sur [RevenueCat](https://app.revenuecat.com/)
2. Créez un compte gratuit (gratuit jusqu'à $2,500 de revenu mensuel)
3. Créez un nouveau projet **CarFlex**

#### Configurer l'App iOS
1. Dans RevenueCat Dashboard → **Apps** → **Add New App**
2. Sélectionnez **iOS**
3. Entrez :
   - **App name** : CarFlex
   - **Bundle ID** : `com.missdee.carflextest`
   - **Shared Secret** : Obtenez-le depuis App Store Connect → Général → Informations sur l'app → Informations sur l'abonnement → Secret partagé de l'app

#### Créer les Produits et Offres
1. Dans RevenueCat → **Products** → **Add New Product**
2. Créez le produit :
   - **Product ID** : `com.missdee.carflextest.pro.monthly` (doit correspondre à App Store Connect)
   - **Type** : Subscription

3. Dans **Offerings** → **Create New Offering**
   - **Offering ID** : `default`
   - **Package** : Ajoutez votre produit créé ci-dessus
   - **Package ID** : `monthly`

#### Obtenir la Clé API
1. Dans RevenueCat → **Settings** → **API Keys**
2. Copiez la **Public App-specific API Key**
3. Remplacez `YOUR_REVENUECAT_API_KEY_HERE` dans `src/pages/Subscription.tsx` :

```typescript
await Purchases.configure({
  apiKey: "appl_XXXXXXXXXXXXX", // Votre clé API
});
```

---

### 3. Configuration Xcode

#### Ajouter la Capacité In-App Purchase
1. Ouvrez le projet dans Xcode : `npx cap open ios`
2. Sélectionnez le target **App**
3. Allez dans **Signing & Capabilities**
4. Cliquez sur **+ Capability**
5. Ajoutez **In-App Purchase**

#### Configurer StoreKit Testing
1. Dans Xcode → **Product** → **Scheme** → **Edit Scheme**
2. Sous **Run** → **Options**
3. Activez **StoreKit Configuration**
4. Créez un fichier de configuration StoreKit si demandé

**Configuration du fichier StoreKit** (`Configuration.storekit`) :
```json
{
  "identifier" : "com.missdee.carflextest.pro.monthly",
  "reference_name" : "Pro Monthly",
  "type" : "Renewable Subscription",
  "duration" : "P1M",
  "price" : "2.99",
  "family_name" : "CarFlex Subscriptions",
  "group_name" : "carflex_subscriptions"
}
```

---

### 4. Tester les Achats In-App

#### Test en Local (Sandbox)
1. Créez un compte Sandbox dans App Store Connect :
   - **Utilisateurs et accès** → **Sandbox** → **Testeurs**
   - Créez un compte avec un email de test (ex: `reviewer@carflex.test`)

2. Sur votre appareil iOS physique :
   - Déconnectez-vous de votre compte Apple normal
   - Allez dans **Réglages** → **App Store** → **Compte Sandbox**
   - Connectez-vous avec le compte Sandbox créé

3. Lancez l'app et testez l'achat :
   ```bash
   npm run build
   npx cap sync
   npx cap run ios
   ```

4. Dans l'app, allez sur la page Abonnement et cliquez sur "Passer à Pro"
5. Confirmez l'achat avec le compte Sandbox

#### Vérifier les Logs
- Ouvrez la console Xcode pour voir les logs :
  ```
  [IAP] RevenueCat initialisé
  [IAP] Récupération des offres disponibles...
  [IAP] Achat du package: monthly
  [IAP] Achat réussi
  [IAP] Achat synchronisé avec succès
  ```

---

### 5. Configuration Base de Données

#### Créer la Table user_subscriptions (si non existante)

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id UUID REFERENCES subscription_plans NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  platform TEXT NOT NULL DEFAULT 'stripe',
  transaction_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 6. Déploiement en Production

#### Avant la Soumission
- [ ] Vérifiez que le produit IAP est approuvé dans App Store Connect
- [ ] Testez l'achat avec un compte Sandbox
- [ ] Vérifiez que l'abonnement se synchronise correctement en base de données
- [ ] Testez la restauration d'achat (implémenter si nécessaire)
- [ ] Vérifiez que les notifications RevenueCat fonctionnent

#### Build de Production
```bash
# 1. Mettre à jour le code
git pull

# 2. Installer les dépendances
npm install

# 3. Build
npm run build

# 4. Synchroniser avec Capacitor
npx cap sync

# 5. Ouvrir dans Xcode
npx cap open ios
```

#### Dans Xcode
1. Sélectionnez le target **Any iOS Device**
2. **Product** → **Archive**
3. Une fois l'archive créée, cliquez sur **Distribute App**
4. Sélectionnez **App Store Connect**
5. Suivez l'assistant pour télécharger sur App Store Connect

---

### 7. Notes Importantes pour Apple Review

**À inclure dans les notes de révision :**

```markdown
## Achats In-App

L'application propose un abonnement mensuel "Plan Pro" via achats in-app.

**Produit IAP :**
- Identifiant : com.missdee.carflextest.pro.monthly
- Prix : [VOTRE_PRIX] / mois
- Type : Abonnement auto-renouvelable

**Test de l'achat :**
1. Connectez-vous avec le compte test fourni
2. Accédez à "Mon Compte" → "Abonnement"
3. Cliquez sur "Passer à Pro"
4. Utilisez le compte Sandbox fourni pour tester

**Compte Sandbox pour test :**
- Email : reviewer@carflex.test
- Mot de passe : ReviewTest2024!

**Fonctionnalités débloquées :**
- Annonces illimitées
- Badge Pro sur le profil
- Visibilité maximale des annonces
- Statistiques avancées
```

---

### 8. Restauration des Achats

Pour permettre aux utilisateurs de restaurer leurs achats, ajoutez cette fonction :

```typescript
const handleRestorePurchases = async () => {
  try {
    console.log('[IAP] Restauration des achats...');
    const customerInfo = await Purchases.restorePurchases();
    
    if (customerInfo.activeSubscriptions.includes(IOS_PRODUCT_ID)) {
      await syncIOSPurchase({ customerInfo });
      await refreshSubscription();
      
      toast({
        title: "Achats restaurés",
        description: "Votre abonnement a été restauré avec succès",
      });
    } else {
      toast({
        title: "Aucun achat",
        description: "Aucun abonnement actif trouvé",
        variant: "destructive"
      });
    }
  } catch (error) {
    console.error('[IAP] Erreur restauration:', error);
    toast({
      title: "Erreur",
      description: "Impossible de restaurer les achats",
      variant: "destructive"
    });
  }
};
```

Ajoutez un bouton dans l'interface :
```tsx
<Button variant="outline" onClick={handleRestorePurchases}>
  Restaurer mes achats
</Button>
```

---

### 9. Checklist Finale

- [ ] Compte RevenueCat créé et configuré
- [ ] Clé API RevenueCat ajoutée dans le code
- [ ] Produit IAP créé dans App Store Connect
- [ ] Produit configuré dans RevenueCat
- [ ] Capability In-App Purchase ajoutée dans Xcode
- [ ] Tests Sandbox réussis
- [ ] Edge function `verify-ios-purchase` déployée
- [ ] Table `user_subscriptions` créée avec RLS
- [ ] Restauration d'achats implémentée
- [ ] Build de production créé
- [ ] Notes de révision mises à jour

---

### 10. Ressources Utiles

- [Documentation RevenueCat](https://docs.revenuecat.com/)
- [Guide Apple sur les IAP](https://developer.apple.com/in-app-purchase/)
- [RevenueCat Capacitor Plugin](https://github.com/RevenueCat/purchases-capacitor)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Xcode Console
2. Vérifiez les logs dans RevenueCat Dashboard
3. Consultez la documentation RevenueCat
4. Contactez le support RevenueCat si nécessaire
