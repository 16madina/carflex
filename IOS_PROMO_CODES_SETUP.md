# Configuration des Codes Promo iOS (Promotional Offers)

Ce guide explique comment configurer les codes promo Apple pour permettre des réductions sur les abonnements iOS via StoreKit.

## Prérequis

- Compte Apple Developer actif
- Abonnement auto-renouvelable déjà configuré dans App Store Connect
- Accès à App Store Connect avec les permissions appropriées

## Étape 1 : Créer une Clé de Signature d'Abonnement

1. Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
2. Allez dans **Users and Access** → **Keys** → **In-App Purchase**
3. Cliquez sur le bouton **+** pour créer une nouvelle clé
4. Donnez un nom à la clé (ex: "CarFlex Promo Key")
5. Téléchargez le fichier `.p8` - **IMPORTANT : vous ne pourrez le télécharger qu'une seule fois !**
6. Notez le **Key ID** (ex: `A1B2C3D4E5`)

## Étape 2 : Créer une Offre Promotionnelle

1. Dans App Store Connect, allez dans **My Apps** → Votre app → **Subscriptions**
2. Sélectionnez votre groupe d'abonnements
3. Sélectionnez votre abonnement (ex: "Pro Plan")
4. Faites défiler jusqu'à **Promotional Offers** et cliquez sur **Create Promotional Offer**
5. Configurez l'offre :
   - **Reference Name** : Nom interne (ex: "WELCOME20")
   - **Promotional Offer Product ID** : ID unique (ex: "welcome_20_off")
   - **Offer Code** : Code que les utilisateurs entreront (ex: "WELCOME20")
   - **Type** : Pay As You Go ou Pay Up Front
   - **Duration** : Durée de la réduction
   - **Price** : Prix réduit
6. Sauvegardez l'offre

## Étape 3 : Configurer les Secrets dans Lovable Cloud

1. Convertissez votre clé `.p8` en une seule ligne :
   ```bash
   awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' SubscriptionKey_A1B2C3D4E5.p8
   ```

2. Dans votre projet Lovable, allez dans **Settings** → **Secrets**

3. Ajoutez les secrets suivants :
   - `APPLE_SUBSCRIPTION_KEY_ID` : Votre Key ID (ex: `A1B2C3D4E5`)
   - `APPLE_SUBSCRIPTION_PRIVATE_KEY` : Le contenu de votre fichier `.p8` en une seule ligne

## Étape 4 : Créer la Table de Base de Données

Exécutez cette migration SQL dans votre base de données :

```sql
-- Table pour stocker les codes promo iOS
CREATE TABLE IF NOT EXISTS public.ios_promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  offer_identifier TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherches rapides
CREATE INDEX idx_ios_promo_codes_code ON public.ios_promo_codes(code);
CREATE INDEX idx_ios_promo_codes_active ON public.ios_promo_codes(is_active);

-- RLS policies
ALTER TABLE public.ios_promo_codes ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent lire les codes actifs
CREATE POLICY "Users can read active promo codes"
  ON public.ios_promo_codes
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Fonction pour incrémenter les utilisations
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_uses INTEGER;
  v_current_uses INTEGER;
BEGIN
  -- Get current usage
  SELECT max_uses, current_uses 
  INTO v_max_uses, v_current_uses
  FROM ios_promo_codes
  WHERE code = p_code AND is_active = true;
  
  -- Check if code exists and hasn't reached max uses
  IF v_max_uses IS NULL OR v_current_uses < v_max_uses THEN
    -- Increment usage
    UPDATE ios_promo_codes
    SET current_uses = current_uses + 1,
        updated_at = now()
    WHERE code = p_code;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Étape 5 : Ajouter des Codes Promo de Test

```sql
-- Exemple de code promo
INSERT INTO public.ios_promo_codes (code, offer_identifier, description, max_uses, expires_at)
VALUES 
  ('WELCOME20', 'welcome_20_off', 'Réduction de bienvenue de 20%', 1000, now() + interval '3 months'),
  ('SUMMER2024', 'summer_2024_promo', 'Promotion d\'été 2024', 500, '2024-09-01'::timestamp);
```

## Étape 6 : Modifier le Plugin StoreKit Natif

Ajoutez le support des offres promotionnelles dans `ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift` :

```swift
@objc func purchaseProductWithOffer(_ call: CAPPluginCall) {
    guard let productId = call.getString("productId"),
          let offerIdentifier = call.getString("offerIdentifier"),
          let keyIdentifier = call.getString("keyIdentifier"),
          let nonce = call.getString("nonce"),
          let signature = call.getString("signature"),
          let timestamp = call.getInt("timestamp") else {
        call.reject("Missing required parameters")
        return
    }
    
    // Store the call for later resolution
    self.purchaseCall = call
    
    // Find the product
    guard let product = self.products.first(where: { $0.productIdentifier == productId }) else {
        call.reject("Product not found")
        return
    }
    
    // Create promotional offer
    let payment = SKMutablePayment(product: product)
    
    if #available(iOS 12.2, *) {
        let discount = SKPaymentDiscount(
            identifier: offerIdentifier,
            keyIdentifier: keyIdentifier,
            nonce: UUID(uuidString: nonce)!,
            signature: signature,
            timestamp: NSNumber(value: timestamp)
        )
        payment.paymentDiscount = discount
    }
    
    payment.applicationUsername = call.getString("applicationUsername")
    
    // Add to payment queue
    SKPaymentQueue.default().add(payment)
}
```

## Étape 7 : Tester

1. Construisez et déployez votre app sur un appareil de test
2. Utilisez un compte Sandbox pour tester les achats
3. Entrez un code promo valide (ex: "WELCOME20")
4. Vérifiez que le prix réduit est appliqué dans la feuille d'achat Apple

## Notes Importantes

- **Sandbox** : Les offres promotionnelles fonctionnent également en mode Sandbox
- **Sécurité** : Ne partagez jamais votre clé privée `.p8`
- **Expiration** : Les clés de signature n'expirent pas, mais peuvent être révoquées
- **Limitation** : Un utilisateur ne peut utiliser chaque offre promotionnelle qu'une seule fois
- **Code unique** : Chaque code promo doit être unique

## Dépannage

### L'offre ne s'applique pas
- Vérifiez que l'offre est active dans App Store Connect
- Vérifiez que la signature est correctement générée
- Vérifiez les logs dans Xcode pour les erreurs StoreKit

### Erreur "Invalid signature"
- Vérifiez que le Key ID correspond à votre clé
- Vérifiez que la clé privée est correctement formatée
- Vérifiez que le nonce est un UUID valide

### Code promo non reconnu
- Vérifiez que le code existe dans la base de données
- Vérifiez que le code n'a pas expiré
- Vérifiez que le nombre maximum d'utilisations n'est pas atteint

## Ressources

- [Apple Documentation - Implementing Promotional Offers in Your App](https://developer.apple.com/documentation/storekit/in-app_purchase/subscriptions_and_offers/implementing_promotional_offers_in_your_app)
- [Generating a Signature for Promotional Offers](https://developer.apple.com/documentation/storekit/in-app_purchase/subscriptions_and_offers/generating_a_signature_for_promotional_offers)
