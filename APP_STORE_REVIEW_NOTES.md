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

## 🛡️ Système de Modération de Contenu

### Vue d'Ensemble

CarFlex dispose d'un système de modération complet pour garantir la sécurité et la qualité du contenu publié sur la plateforme.

### Fonctionnalités de Modération

#### 1. Signalement de Contenu Utilisateur

**Accès :** Disponible sur toutes les annonces via le bouton "🚩 Signaler"

**Types de signalements :**
- 🚫 Contenu inapproprié ou offensant
- 🎭 Fausse annonce / Fraude
- 💰 Prix incorrect ou trompeur
- 📸 Photos inappropriées
- 📝 Description mensongère
- ⚖️ Violation des conditions d'utilisation
- 🔞 Contenu pour adultes

**Processus :**
1. L'utilisateur sélectionne un type de signalement
2. Ajoute un commentaire explicatif (optionnel)
3. Le signalement est envoyé aux modérateurs
4. L'utilisateur reçoit une confirmation

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
