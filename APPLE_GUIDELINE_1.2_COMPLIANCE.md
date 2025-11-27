# Conformité à la Guideline 1.2 - User-Generated Content

## 📋 Résumé Exécutif

CarFlex a mis en œuvre un système complet de modération du contenu généré par les utilisateurs, conforme aux exigences de la Guideline 1.2 de l'App Store. Cette documentation détaille toutes les mesures prises pour assurer la sécurité des utilisateurs et la qualité du contenu sur la plateforme.

---

## 📝 RÉPONSES À FOURNIR À L'ÉQUIPE DE RÉVISION APPLE

### Question 1: What are the promo codes used for?

**Réponse à donner :**

> Les codes promotionnels dans CarFlex sont utilisés UNIQUEMENT sur les plateformes Web et Android pour offrir des **réductions via Stripe** sur les abonnements et promotions d'annonces.
>
> **Important pour iOS :** CarFlex ne propose PAS de système de saisie manuelle de codes promo dans l'application iOS. Les utilisateurs iOS peuvent uniquement utiliser les offres promotionnelles natives d'Apple en appliquant des codes directement dans l'App Store AVANT l'achat.
>
> **Séparation des systèmes :**
> - **iOS** : Utilise exclusivement le système d'offres promotionnelles natif d'Apple (App Store)
> - **Web/Android** : Utilise le système de coupons Stripe avec saisie de code dans l'application
>
> Cette séparation est conforme aux guidelines 3.1.1 d'Apple qui interdisent les mécanismes de codes promo personnalisés dans les apps iOS.

### Question 2: Do they unlock app features?

**Réponse à donner :**

> **Non**, les codes promotionnels ne débloquent PAS directement des fonctionnalités de l'application.
>
> **Sur iOS :** CarFlex n'utilise AUCUN mécanisme de saisie de codes promo dans l'application. Les utilisateurs iOS peuvent uniquement bénéficier d'offres promotionnelles via le système natif d'Apple en appliquant des codes directement dans l'App Store.
>
> **Sur Web/Android :** Les codes promo Stripe offrent uniquement des réductions sur le prix des abonnements et promotions. C'est l'**abonnement ou la promotion** elle-même qui débloque les fonctionnalités, pas le code promo.
>
> **Fonctionnalités débloquées par le Pro Plan (pas par les codes promo) :**
> - ✅ Annonces illimitées (vente et location)
> - ✅ Messagerie illimitée
> - ✅ Badge "PRO" sur le profil
> - ✅ Support prioritaire
> - ✅ Analyses avancées
> - ✅ Promotion d'annonces
>
> **Clarification :** Un code promo offrant 30% de réduction permet à l'utilisateur de payer 70% du prix normal pour accéder à toutes les fonctionnalités Pro. Sans abonnement Pro (même avec un code promo), les fonctionnalités premium restent verrouillées.


---

## 🛒 CONFORMITÉ GUIDELINE 3.1.1 - IN-APP PURCHASE

### Implémentation Conforme sur iOS

CarFlex respecte intégralement la Guideline 3.1.1 d'Apple concernant les achats in-app et les mécanismes de codes promotionnels :

**✅ CONFORME : Achats In-App Natifs**
- Tous les achats sur iOS utilisent exclusivement StoreKit (système natif Apple)
- Abonnement Pro Plan : `com.missdee.carflextest.subscription.pro.monthly`
- Promotions d'annonces : Produits in-app configurés dans App Store Connect

**✅ CONFORME : Codes Promo iOS**
- **AUCUN** champ de saisie de code promo dans l'application iOS
- Les offres promotionnelles sont gérées via l'App Store Connect
- Les utilisateurs appliquent les codes directement dans l'App Store (hors de l'app)
- L'application reçoit simplement la confirmation de l'achat avec réduction appliquée

**✅ CONFORME : Séparation Web/Android**
- Les codes promo Stripe sont disponibles UNIQUEMENT sur Web et Android
- L'interface de saisie de code promo est masquée automatiquement sur iOS
- Aucun mécanisme alternatif d'achat n'est proposé aux utilisateurs iOS

**Code de vérification :**
```typescript
// src/pages/Subscription.tsx - Lignes 491-522
{/* Codes promo uniquement pour Web/Android (Stripe) */}
{!isIOS && (
  <div className="space-y-2">
    <Button onClick={() => setShowPromoInput(!showPromoInput)}>
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
- ✅ Sur iOS : Pas de champ de code promo visible
- ✅ Sur Web/Android : Champ de code promo Stripe disponible
- ✅ Conformité totale à la Guideline 3.1.1

### Question 3: Guideline 1.2 - User-Generated Content

**Réponse à donner :**

> CarFlex a implémenté un système complet de modération du contenu généré par les utilisateurs, conforme à toutes les exigences de la Guideline 1.2 :
>
> **1. Conditions d'Utilisation avec Politique de Tolérance Zéro ✅**
> - Section 4.3 des CGU accessible dès l'inscription
> - Acceptation obligatoire pour créer un compte
> - Politique explicite : bannissement immédiat sans préavis pour tout contenu inapproprié
>
> **2. Méthode de Filtrage du Contenu ✅**
> - Filtrage automatique par IA (Edge Function `moderate-content`)
> - Modération manuelle via panel administrateur
> - Détection : contenu inapproprié, arnaques, spam, harcèlement
>
> **3. Mécanisme de Signalement ✅**
> - Bouton "🚩 Signaler" sur TOUTES les annonces (vente et location)
> - Bouton "🚩 Signaler" dans TOUTES les conversations
> - Signalements envoyés instantanément aux administrateurs
>
> **4. Blocage des Utilisateurs Abusifs ✅**
> - Bouton "Bloquer l'utilisateur" sur tous les profils publics
> - Effets immédiats : aucun message possible, annonces masquées
> - Fonctionnalité réversible
>
> **5. Réponse sous 24 Heures ✅**
> - Engagement contractuel dans les CGU
> - Notifications push automatiques aux administrateurs
> - Panel admin dédié pour traiter tous les signalements
> - Actions possibles : avertissement, suppression, bannissement
>
> **Preuve de conformité :**
> - Consultez les fichiers : `src/components/ReportContentDialog.tsx`, `src/components/BlockUserButton.tsx`
> - Testez avec les comptes fournis (reviewer@carflex.test)
> - Panel admin accessible avec admin@carflex.test

---

## ✅ Exigences Apple - Checklist de Conformité

- [x] **Conditions d'utilisation avec politique de tolérance zéro**
- [x] **Méthode de filtrage du contenu inapproprié**
- [x] **Mécanisme de signalement du contenu**
- [x] **Mécanisme de blocage des utilisateurs abusifs**
- [x] **Actions sur les signalements sous 24 heures**

---

## 1️⃣ Conditions d'Utilisation avec Politique de Tolérance Zéro

### Emplacement dans l'Application

Les Conditions Générales d'Utilisation sont accessibles à plusieurs endroits :
- **Inscription** : Lien cliquable avant la création du compte
- **Page dédiée** : Menu → "Conditions d'Utilisation"
- **URL directe** : `/terms-of-service`

### Politique de Tolérance Zéro Explicite

**Section 4.3 des CGU - Texte Exact :**

> **CarFlex applique une politique de TOLÉRANCE ZÉRO envers :**
> - Les contenus inappropriés, offensants, pornographiques ou illégaux
> - Les utilisateurs abusifs, harcelants ou menaçants
> - Les arnaques, fraudes et comportements frauduleux
> - Les contenus protégés par des droits d'auteur publiés sans autorisation
> - Les discours haineux, discriminatoires ou incitant à la violence
>
> **Engagement de modération :** Tout contenu signalé sera examiné par notre équipe de modération dans un délai de **24 heures maximum**. Les utilisateurs qui enfreignent ces règles seront immédiatement bannis de la plateforme sans préavis ni possibilité de remboursement.

### Acceptation Obligatoire

- ✅ Les utilisateurs **doivent** accepter les CGU lors de l'inscription
- ✅ Case à cocher obligatoire avec lien vers les CGU complètes
- ✅ Impossible de créer un compte sans acceptation

### Fichiers Concernés

- `src/pages/TermsOfService.tsx` - Page complète des CGU
- `src/components/TermsDialog.tsx` - Dialogue popup des CGU
- `src/pages/Auth.tsx` - Page d'inscription avec acceptation obligatoire

---

## 2️⃣ Méthode de Filtrage du Contenu

### Filtrage Automatique (AI)

**Edge Function :** `moderate-content`

Le système utilise une IA pour analyser automatiquement le contenu avant publication :

```typescript
// Analyse automatique du contenu textuel
const moderationResult = await supabase.functions.invoke('moderate-content', {
  body: {
    text: content,
    context: 'listing_description'
  }
});

if (!moderationResult.approved) {
  // Contenu bloqué automatiquement
  toast.error(`Contenu refusé: ${moderationResult.reason}`);
}
```

**Critères de détection automatique :**
- Langage inapproprié ou offensant
- Contenus pornographiques ou sexuels
- Discours haineux ou discriminatoire
- Menaces ou incitations à la violence
- Tentatives d'arnaque ou de fraude
- Spam et contenus commerciaux non autorisés

### Filtrage Manuel (Administrateurs)

Les administrateurs peuvent examiner et filtrer manuellement :
- Contenu signalé par les utilisateurs
- Annonces suspectes détectées par le système
- Profils utilisateurs problématiques

**Panel d'Administration :** `/admin-panel`

---

## 3️⃣ Mécanisme de Signalement du Contenu

### Emplacements des Boutons de Signalement

Le bouton "🚩 Signaler" est présent sur **TOUS** les contenus générés par les utilisateurs :

#### ✅ Annonces de Vente
- **Page :** `ListingDetail.tsx`
- **Emplacement :** Header de l'annonce, à côté des boutons Partager/Favoris
- **Type de contenu :** `sale_listing`

#### ✅ Annonces de Location
- **Page :** `RentalDetail.tsx`
- **Emplacement :** Header de l'annonce, à côté des boutons Partager/Favoris
- **Type de contenu :** `rental_listing`

#### ✅ Conversations/Messages
- **Composant :** `ChatBox.tsx`
- **Emplacement :** Header de la conversation, icône drapeau à côté du bouton fermer
- **Type de contenu :** `conversation`

### Processus de Signalement

1. **Clic sur le bouton 🚩 Signaler**
2. **Sélection de la raison** (liste déroulante obligatoire) :
   - Contenu inapproprié
   - Arnaque/fraude
   - Spam
   - Harcèlement
   - Fausses informations
   - Autre
3. **Description optionnelle** (zone de texte libre)
4. **Envoi du signalement**
5. **Confirmation immédiate** à l'utilisateur

### Backend de Signalement

**Edge Function :** `report-content`

```typescript
// Enregistrement du signalement
const { data, error } = await supabase
  .from('reported_content')
  .insert({
    content_type: 'sale_listing',
    content_id: listingId,
    reason: 'inappropriate',
    description: 'Description du problème',
    reporter_id: userId,
    status: 'pending'
  });

// Notification automatique des administrateurs
await notifyAdmins(reportData);
```

### Table Base de Données

**Table :** `reported_content`

Colonnes :
- `id` : UUID unique
- `content_type` : Type de contenu signalé
- `content_id` : ID du contenu
- `reason` : Raison du signalement
- `description` : Description optionnelle
- `reporter_id` : ID de l'utilisateur qui signale
- `status` : pending / reviewed / resolved
- `reviewed_by` : ID de l'admin qui a traité
- `reviewed_at` : Date de traitement
- `admin_notes` : Notes de l'administrateur

### Fichiers Concernés

- `src/components/ReportContentDialog.tsx` - Composant de signalement
- `supabase/functions/report-content/index.ts` - Edge Function backend

---

## 4️⃣ Mécanisme de Blocage des Utilisateurs

### Accès au Blocage

Les utilisateurs peuvent bloquer d'autres utilisateurs depuis :
- **Profils publics** : Bouton "Bloquer l'utilisateur" sur `/profile/:userId`
- **Conversations** : Via le signalement de conversation

### Composant de Blocage

**Fichier :** `src/components/BlockUserButton.tsx`

Le blocage est immédiat et comprend une confirmation pour éviter les blocages accidentels :

```typescript
// Dialogue de confirmation
<AlertDialog>
  <AlertDialogTitle>Bloquer cet utilisateur ?</AlertDialogTitle>
  <AlertDialogDescription>
    Cette action empêchera cet utilisateur de vous contacter et cachera ses annonces.
  </AlertDialogDescription>
</AlertDialog>
```

### Effets du Blocage

Lorsqu'un utilisateur A bloque un utilisateur B :

- ❌ B ne peut plus envoyer de messages à A
- ❌ Les annonces de B n'apparaissent plus dans les recherches de A
- ❌ B ne peut plus voir les annonces de A
- ❌ Aucune interaction possible entre A et B
- ✅ Le blocage est **réversible** (déblocage possible)

### Table Base de Données

**Table :** `blocked_users`

Colonnes :
- `id` : UUID unique
- `blocker_id` : ID de l'utilisateur qui bloque
- `blocked_id` : ID de l'utilisateur bloqué
- `reason` : Raison du blocage (optionnel)
- `created_at` : Date du blocage

### Fonction de Vérification

**Fonction SQL :** `is_user_blocked()`

```sql
-- Vérifie si un utilisateur est bloqué
CREATE FUNCTION is_user_blocked(check_blocked_id uuid, check_blocker_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE blocker_id = check_blocker_id
    AND blocked_id = check_blocked_id
  )
$$ LANGUAGE sql SECURITY DEFINER;
```

Cette fonction est utilisée dans les **Row-Level Security (RLS) policies** pour empêcher automatiquement toute interaction entre utilisateurs bloqués.

---

## 5️⃣ Actions sur les Signalements sous 24 Heures

### Engagement Formel

**Délai Maximum : 24 heures**

Cet engagement est :
- ✅ Clairement mentionné dans les CGU (Section 4.3)
- ✅ Affiché dans le panel d'administration
- ✅ Contractuellement contraignant

### Processus de Traitement

#### Étape 1 : Notification Immédiate (< 1 minute)

Dès qu'un signalement est créé :
- 🔔 Notification push envoyée aux administrateurs
- 📧 Email envoyé aux administrateurs
- 🔴 Badge de notification affiché dans le panel admin

#### Étape 2 : Examen du Contenu (< 24h)

Un administrateur examine le signalement et le contenu associé :
- Visualisation du contenu signalé
- Historique de l'utilisateur concerné
- Gravité du signalement

#### Étape 3 : Action de Modération (< 24h)

Selon la gravité, l'administrateur peut :

**Pour contenu inapproprié léger :**
- ⚠️ Avertissement à l'utilisateur
- ✏️ Demande de modification du contenu

**Pour contenu inapproprié modéré :**
- 🗑️ Suppression du contenu
- ⚠️ Avertissement avec mise en garde

**Pour contenu grave ou récidive :**
- 🗑️ Suppression immédiate du contenu
- 🚫 **Bannissement définitif de l'utilisateur**
- 💼 Suppression de toutes les annonces de l'utilisateur

#### Étape 4 : Notification du Reporter (< 24h)

L'utilisateur qui a signalé reçoit :
- ✅ Confirmation que le signalement a été traité
- 📝 Information sur l'action prise (si approprié)
- 🙏 Remerciement pour avoir contribué à la sécurité

### Panel d'Administration

**Accès :** `/admin-panel` (réservé aux administrateurs)

**Fonctionnalités :**
- 📊 Vue d'ensemble de tous les signalements
- 🔍 Filtres par statut (en attente, examiné, résolu)
- 👁️ Prévisualisation du contenu signalé
- ⚡ Actions rapides (approuver, rejeter, bannir)
- 📝 Ajout de notes de modération
- 📈 Statistiques de modération

### Sécurité du Système de Modération

**Vérification des Rôles :**
- ✅ Rôles stockés dans une table séparée (`user_roles`)
- ✅ Vérification côté serveur uniquement (jamais côté client)
- ✅ Fonction `SECURITY DEFINER` pour éviter les escalades de privilèges
- ✅ Row-Level Security (RLS) activé sur toutes les tables sensibles

**Fonction de vérification du rôle admin :**

```sql
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Logs et Audit

Toutes les actions de modération sont enregistrées :
- ✅ Qui a pris l'action
- ✅ Quand l'action a été prise
- ✅ Quel type d'action
- ✅ Sur quel contenu
- ✅ Notes explicatives

---

## 📊 Résumé Technique

| Exigence Apple | Implémentation CarFlex | Statut |
|----------------|------------------------|--------|
| Conditions avec tolérance zéro | Section 4.3 des CGU, acceptation obligatoire | ✅ Conforme |
| Filtrage du contenu | IA automatique + modération manuelle | ✅ Conforme |
| Signalement du contenu | Bouton sur toutes les annonces et conversations | ✅ Conforme |
| Blocage des utilisateurs | Composant BlockUserButton, effets immédiats | ✅ Conforme |
| Réponse sous 24h | Notifications automatiques, panel admin dédié | ✅ Conforme |

---

## 🧪 Instructions de Test pour l'Équipe de Révision

### Test 1 : Acceptation des CGU
1. Créer un nouveau compte
2. Vérifier que les CGU sont affichées avec la politique de tolérance zéro
3. Confirmer que l'acceptation est obligatoire

### Test 2 : Signalement de Contenu
1. Se connecter avec un compte test
2. Aller sur n'importe quelle annonce
3. Cliquer sur le bouton "🚩 Signaler" en haut à droite
4. Sélectionner une raison et envoyer
5. Vérifier la confirmation

### Test 3 : Signalement de Conversation
1. Ouvrir une conversation dans `/messages`
2. Cliquer sur l'icône 🚩 dans le header de la conversation
3. Soumettre le signalement
4. Vérifier la confirmation

### Test 4 : Blocage d'Utilisateur
1. Visiter le profil public d'un utilisateur
2. Cliquer sur "Bloquer l'utilisateur"
3. Confirmer dans la popup
4. Vérifier que l'utilisateur est bloqué

### Test 5 : Panel Admin (Compte Administrateur Requis)
1. Se connecter avec le compte admin : `admin@carflex.test`
2. Aller sur `/admin-panel`
3. Vérifier l'affichage des signalements
4. Tester les actions de modération

---

## 📧 Contact pour Questions

En cas de questions sur ces fonctionnalités, l'équipe de révision peut nous contacter :

**Email :** app-review@carflex.com  
**Réponse sous :** 24 heures maximum

---

## 🔐 Comptes de Test Fournis

### Compte Utilisateur Standard
- **Email :** reviewer@carflex.test
- **Mot de passe :** ReviewTest2024!

### Compte Administrateur (pour tester la modération)
- **Email :** admin@carflex.test
- **Mot de passe :** AdminTest2024!

---

**Date de conformité :** 27 novembre 2025  
**Version de l'app :** 1.0.0  
**Guideline concernée :** 1.2 - Safety - User-Generated Content
