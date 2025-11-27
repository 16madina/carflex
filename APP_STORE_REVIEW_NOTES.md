# Notes de Révision App Store - CarFlex

## 📱 Informations de l'Application

**Nom de l'application :** CarFlex
**Bundle ID :** com.missdee.carflextest
**Version :** 1.0.0
**Catégorie :** Shopping / Automobile

---

## 🔐 Suppression de Compte Utilisateur

### Fonctionnalité Implémentée

L'application CarFlex permet aux utilisateurs de supprimer complètement leur compte et toutes leurs données associées, conformément aux exigences de l'App Store.

### Accès à la Suppression de Compte

1. **Navigation :** Profil → ⚙️ Paramètres → Section "Zone de Danger" → Bouton "Supprimer mon compte"
2. **Confirmation :** Double confirmation requise pour éviter les suppressions accidentelles
3. **Processus :** Suppression immédiate et irréversible

### Données Supprimées

Lors de la suppression du compte, **toutes** les données suivantes sont définitivement supprimées :

- ✅ Informations de profil (nom, email, téléphone, adresse)
- ✅ Photo de profil
- ✅ Toutes les annonces publiées (vente et location)
- ✅ Historique des messages et conversations
- ✅ Favoris et préférences
- ✅ Historique des réservations
- ✅ Avis et évaluations
- ✅ Données d'authentification
- ✅ Notifications
- ✅ Abonnements actifs (annulés automatiquement)

### Implémentation Technique

- **Backend Function :** `delete-account` (Edge Function Supabase)
- **Méthode :** Suppression en cascade de toutes les données liées
- **Sécurité :** Authentification requise, validation du mot de passe
- **Conformité RGPD :** Suppression complète et définitive sous 30 jours

### Code de Test pour l'Équipe de Révision

Si vous souhaitez tester la suppression de compte :
1. Créez un compte de test dans l'application
2. Ajoutez quelques données (annonces, favoris)
3. Accédez à Profil → Paramètres → "Supprimer mon compte"
4. Confirmez la suppression

**Note :** Le processus est irréversible. Nous recommandons de créer un compte de test spécifique pour cette vérification.

---

## 🛡️ Système de Modération de Contenu (Guideline 1.2)

### Vue d'Ensemble

CarFlex dispose d'un système de modération complet pour garantir la sécurité des utilisateurs et la qualité du contenu.

### Politique de Tolérance Zéro

**CarFlex applique une politique de TOLÉRANCE ZÉRO** envers :
- Les contenus inappropriés, offensants, pornographiques ou illégaux
- Les utilisateurs abusifs, harcelants ou menaçants
- Les arnaques, fraudes et comportements frauduleux
- Les contenus protégés par des droits d'auteur publiés sans autorisation
- Les discours haineux, discriminatoires ou incitant à la violence

**Engagement de modération :** Tout contenu signalé est examiné par notre équipe dans un délai de **24 heures maximum**. Les utilisateurs en infraction sont immédiatement bannis de la plateforme sans préavis ni possibilité de remboursement.

Cette politique est clairement affichée dans nos **Conditions Générales d'Utilisation** que tous les utilisateurs doivent accepter lors de l'inscription.

### Fonctionnalités de Modération

#### 1. Signalement de Contenu Utilisateur

**Accès :** Bouton "🚩 Signaler" présent sur :
- Toutes les annonces de vente (ListingDetail.tsx)
- Toutes les annonces de location (RentalDetail.tsx)
- Toutes les conversations de messagerie (ChatBox.tsx)

**Raisons de signalement disponibles :**
- Contenu inapproprié
- Arnaque/fraude
- Spam
- Harcèlement
- Fausses informations
- Autre (avec description personnalisée)

**Processus :**
1. L'utilisateur clique sur le bouton de signalement
2. Sélectionne une raison dans le menu déroulant
3. Ajoute une description optionnelle
4. Le signalement est immédiatement enregistré
5. Les administrateurs sont notifiés automatiquement
6. Une confirmation est affichée à l'utilisateur

**Composant :** `src/components/ReportContentDialog.tsx`
**Backend :** Edge Function `report-content` qui enregistre les signalements et notifie les admins

#### 2. Blocage d'Utilisateurs

**Accès :** Profil public de n'importe quel utilisateur → Bouton "Bloquer l'utilisateur"

**Effets du blocage :**
- ❌ L'utilisateur bloqué ne peut plus envoyer de messages
- ❌ Ses annonces n'apparaissent plus dans les résultats de recherche
- ❌ Aucune interaction possible entre les deux parties
- ✅ Réversible à tout moment

#### 3. Panel d'Administration

**Accès :** Réservé aux administrateurs (rôle vérifié côté serveur)

**Fonctionnalités :**
- 📊 Visualisation de tous les signalements (en attente, examinés, résolus)
- 👀 Examen détaillé de chaque signalement
- ✅ Marquer comme résolu
- 👁️ Marquer comme examiné
- ❌ Rejeter le signalement
- 💬 Ajouter des notes de modération
- 🗑️ Suppression de contenu inapproprié

**Sécurité du Panel :**
- Authentification requise
- Vérification du rôle admin via fonction SECURITY DEFINER
- Row-Level Security (RLS) activé sur toutes les tables
- Aucune manipulation possible côté client

### Implémentation Technique

#### Edge Functions
1. **`report-content`** : Gestion des signalements
2. **`moderate-content`** : Actions de modération (admin uniquement)

#### Tables Base de Données
- `reported_content` : Stockage des signalements
- `blocked_users` : Gestion des blocages
- `user_roles` : Gestion des rôles (admin, modérateur, user)

#### Sécurité
- Row-Level Security (RLS) activé sur toutes les tables sensibles
- Fonctions SECURITY DEFINER pour éviter l'escalade de privilèges
- Validation des rôles côté serveur uniquement
- Logs d'audit pour toutes les actions de modération

### Politique de Modération

**Temps de Réponse :**
- Signalements urgents : < 24h
- Signalements standards : < 72h

**Actions Possibles :**
1. Avertissement à l'utilisateur
2. Suppression du contenu
3. Suspension temporaire
4. Bannissement définitif (cas graves)

---

## 📸 Captures d'Écran pour Référence

Les captures d'écran suivantes sont disponibles pour l'équipe de révision :

1. **Suppression de compte** : Profil → Paramètres → Section "Zone de Danger"
2. **Signalement** : N'importe quelle annonce → Bouton "Signaler"
3. **Blocage** : Profil public → Bouton "Bloquer"
4. **Panel de modération** : Admin → Panel de modération

---

## 💳 Achats In-App (StoreKit)

### Vue d'Ensemble

CarFlex propose deux types d'achats in-app natifs via StoreKit :

1. **Abonnement Pro mensuel** : Accès aux fonctionnalités premium
2. **Packages de promotion d'annonces** : Mise en avant temporaire des annonces

### Produits IAP Configurés

**Abonnement :**
- Product ID : `com.missdee.carflextest.subscription.pro.monthly`
- Type : Auto-Renewable Subscription
- Durée : 1 mois
- Prix : 29,99 € / mois

**Packages Premium :**
- Product IDs : `premium_package_[id]` (configurés selon les packages en base de données)
- Type : Consumable
- Durée : Variable (7, 14, 30 jours selon le package)

### Fonctionnalités de l'Abonnement Pro

- ✅ Annonces illimitées (vente et location)
- ✅ Messagerie illimitée
- ✅ Badge "PRO" sur le profil
- ✅ Support prioritaire
- ✅ Analyses avancées

### Vérification Côté Serveur

**Sécurité implémentée :**
- Vérification automatique via App Store Server API
- Validation des transactions avec JWT signé
- Contrôle du Bundle ID et Product ID
- Protection contre la fraude
- Logs d'audit complets

**Edge Function de vérification :** `verify-ios-purchase`
- Vérifie chaque transaction avec les serveurs Apple
- Active l'abonnement ou le premium uniquement après validation
- Gère les erreurs et les cas limites

### Test des Achats In-App

**Pour tester l'abonnement Pro :**
1. Connectez-vous avec un compte test
2. Allez dans **Abonnement**
3. Cliquez sur **"Passer à Pro"**
4. Confirmez l'achat dans la popup StoreKit

**Pour tester un package premium :**
1. Créez une annonce de vente
2. Allez dans **Promouvoir une annonce**
3. Sélectionnez un package premium
4. Sélectionnez votre annonce
5. Choisissez **iOS/Apple Pay** comme méthode de paiement
6. Confirmez l'achat

### Configuration Technique

**StoreKit Testing :**
- Fichier `.storekit` configuré avec tous les produits
- Tests locaux possibles dans le simulateur
- Sandbox testers configurés pour tests sur appareil réel

**Backend :**
- Clé API App Store Connect configurée (secrets sécurisés)
- Vérification obligatoire côté serveur pour tous les achats
- Synchronisation automatique avec la base de données

### Gestion des Abonnements

**Annulation :**
- Les utilisateurs peuvent annuler via les Réglages iOS
- L'abonnement reste actif jusqu'à la fin de la période payée
- Suppression automatique du statut Pro après expiration

**Restauration :**
- Bouton "Restaurer les achats" disponible
- Synchronisation automatique des achats précédents
- Support multi-appareils

### Conformité Apple

- ✅ StoreKit natif utilisé (pas de solution tierce)
- ✅ Vérification serveur pour tous les achats
- ✅ Bundle ID correct : `com.missdee.carflextest`
- ✅ Prix clairement affichés avant l'achat
- ✅ Fonctionnalités premium clairement décrites
- ✅ Bouton de restauration des achats présent
- ✅ Support de la suppression de compte (annule les abonnements actifs)

---

## 🔗 URLs Importantes

- **Privacy Policy :** https://[votre-domaine]/privacy-policy
- **Terms of Service :** https://[votre-domaine]/terms-of-service
- **Support Email :** support@carflex.com
- **Site Web :** https://[votre-domaine]

---

## 📧 Contact de Révision

En cas de questions sur ces fonctionnalités, l'équipe de révision peut nous contacter à :

**Email :** app-review@carflex.com
**Téléphone :** [Votre numéro]

---

## ✅ Checklist de Conformité

- [x] Suppression de compte disponible dans l'application
- [x] Processus de suppression clair et accessible
- [x] Toutes les données utilisateur supprimées
- [x] Système de modération actif
- [x] Signalement de contenu disponible
- [x] Panel d'administration fonctionnel
- [x] Privacy Policy et Terms of Service accessibles
- [x] Conformité RGPD
- [x] RLS et sécurité backend implémentés
- [x] Achats in-app StoreKit natifs implémentés
- [x] Vérification côté serveur pour tous les achats
- [x] Restauration des achats disponible
- [x] Prix clairement affichés

---

## 🔄 Changements depuis la Dernière Soumission

**Nouveau :** Première soumission de l'application

**Fonctionnalités Clés :**
- Marketplace automobile (achat/vente et location)
- Système de messagerie intégré
- Réservations et paiements
- Évaluations et avis
- Géolocalisation
- Notifications push
- Système de modération complet
- Suppression de compte conforme
- Achats in-app (abonnement Pro et packages premium)
- Vérification sécurisée des achats via App Store Server API

---

## 🧪 Compte de Test pour l'Équipe de Révision

**Email :** reviewer@carflex.test
**Mot de passe :** ReviewTest2024!

**Compte Administrateur (pour tester la modération) :**
**Email :** admin@carflex.test
**Mot de passe :** AdminTest2024!

**Note :** Ces comptes sont créés spécifiquement pour la révision et contiennent des données de démonstration.

---

## 📱 Compatibilité

- **iOS :** 13.0 et supérieur
- **Appareils :** iPhone, iPad
- **Orientation :** Portrait et Paysage
- **Langues :** Français (primaire), Anglais

---

**Date de soumission :** [Date]
**Soumis par :** [Votre nom]
**Version :** 1.0.0
