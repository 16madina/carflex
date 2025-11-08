# Conformité App Store - CarFlex

## ✅ Checklist Conformité Apple App Store

### 1. Politique de Confidentialité ✅
- **Emplacement**: `/privacy-policy` et popup dans l'app
- **Contenu RGPD**: Conforme
- **Droits utilisateurs**: Détaillés (accès, rectification, effacement, portabilité)
- **Données collectées**: Liste complète et transparente
- **Partage de données**: Clairement indiqué (Stripe, hébergement)
- **Durées de conservation**: Spécifiées
- **Contact**: privacy@carflex.app

### 2. Conditions Générales d'Utilisation ✅
- **Emplacement**: `/terms-of-service` et popup dans l'app
- **Acceptation obligatoire**: Checkbox à l'inscription
- **Services décrits**: Complet
- **Responsabilités**: Clairement définies
- **Modération**: Politique de modération incluse
- **Paiements**: Conditions détaillées

### 3. Permissions iOS (Info.plist) ✅
```xml
<!-- Caméra -->
<key>NSCameraUsageDescription</key>
<string>CarFlex a besoin d'accéder à votre caméra pour prendre des photos de vos véhicules lors de la création d'annonces.</string>

<!-- Photos -->
<key>NSPhotoLibraryUsageDescription</key>
<string>CarFlex a besoin d'accéder à vos photos pour vous permettre de sélectionner des images de vos véhicules pour vos annonces.</string>

<!-- Localisation -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>CarFlex utilise votre localisation pour afficher les annonces près de chez vous et pour indiquer l'emplacement de vos véhicules dans vos annonces.</string>
```

### 4. Suppression de Compte ✅
- **Emplacement**: Page Profil → Bouton "Supprimer mon compte"
- **Confirmation**: Dialog de confirmation avec avertissement RGPD
- **Edge Function**: `delete-account` (supprime utilisateur et données)
- **Transparence**: Mention des données conservées pour raisons légales

### 5. Système de Modération ✅
- **Signalement de contenu**: Bouton présent sur annonces et profils
- **Panel de modération**: Dashboard admin pour gérer les signalements
- **Blocage d'utilisateurs**: Fonctionnalité implémentée
- **Edge Functions**: 
  - `report-content`: Signaler du contenu
  - `moderate-content`: Modérer le contenu

### 6. Conformité RGPD ✅
- **Droit d'accès**: Via profil utilisateur
- **Droit de rectification**: Via modification du profil
- **Droit à l'effacement**: Bouton de suppression de compte
- **Droit à la portabilité**: Mentionné dans politique
- **Droit d'opposition**: Contact fourni
- **Consentement explicite**: Checkbox CGU/Politique

---

## ✅ Checklist Conformité Google Play Store

### 1. Déclaration de Sécurité des Données ✅
**Types de données collectées** (à déclarer dans la console):
- Informations personnelles: Nom, Email, Téléphone, Photo
- Localisation: Ville, Pays (approximative)
- Photos et fichiers: Images des véhicules
- Données financières: Historique des achats (via Stripe)

**Utilisation des données**:
- Fonctionnalités de l'app
- Personnalisation
- Sécurité et prévention de la fraude

**Partage des données**:
- Stripe (traitement des paiements)
- Services d'hébergement cloud

### 2. Permissions Android (AndroidManifest.xml) ✅
```xml
<!-- Permissions avec descriptions claires -->
<uses-permission android:name="android.permission.CAMERA" />
<!-- Description: Pour photographier les véhicules -->

<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<!-- Description: Pour sélectionner des photos de véhicules -->

<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<!-- Description: Pour afficher les annonces à proximité -->
```

### 3. Politique de Confidentialité ✅
- **URL publique**: https://votre-domaine.com/privacy-policy
- **Accessible sans authentification**: Oui
- **Lien dans l'app**: Oui (Footer + Signup)

### 4. Suppression de Compte ✅
- **Accessible dans l'app**: Oui (Page Profil)
- **Processus clair**: Dialog de confirmation
- **Suppression réelle**: Via edge function
- **Alternative web**: Peut être demandé via email

### 5. Contenu Généré par les Utilisateurs ✅
- **Système de signalement**: Implémenté
- **Modération**: Dashboard admin
- **Blocage d'utilisateurs**: Disponible
- **Politique claire**: Dans les CGU

---

## 📋 Actions Requises pour Soumission

### Apple App Store
1. ✅ Créer un compte Apple Developer
2. ✅ Remplir "App Privacy" dans App Store Connect:
   - Data Types Collected
   - Purposes of Data Collection
   - Data Shared with Third Parties
3. ✅ Ajouter le lien de la politique de confidentialité
4. ✅ Fournir des captures d'écran (iPhone et iPad)
5. ✅ Préparer vidéo de démo (optionnel mais recommandé)

### Google Play Store
1. ✅ Créer un compte Google Play Console
2. ✅ Remplir "Data safety" dans la console:
   - Types de données collectées
   - Utilisation des données
   - Partage des données
   - Mesures de sécurité
3. ✅ Ajouter le lien de la politique de confidentialité
4. ✅ Télécharger les captures d'écran (Phone, Tablet, 7-inch, 10-inch)
5. ✅ Classification du contenu

---

## 🔗 URLs à Fournir aux Stores

- **Politique de Confidentialité**: https://votre-domaine.com/privacy-policy
- **Conditions d'Utilisation**: https://votre-domaine.com/terms-of-service
- **Protection des Données**: https://votre-domaine.com/data-protection
- **Support**: support@carflex.app
- **Site Web**: https://votre-domaine.com

---

## ⚠️ Points d'Attention pour la Review

### Apple
- Les IAP (In-App Purchases) doivent utiliser le système Apple (si applicable)
- Les permissions doivent être demandées au bon moment (pas au lancement)
- L'app doit fonctionner sans crash
- Tous les liens doivent être fonctionnels

### Google
- La politique de confidentialité doit être accessible publiquement
- Les permissions doivent être justifiées
- Le système de signalement doit être visible
- Les données sensibles doivent être sécurisées (SSL/TLS)

---

## ✅ Résumé de Conformité

| Exigence | Apple | Android | Statut |
|----------|-------|---------|--------|
| Politique de Confidentialité | ✅ | ✅ | Implémenté |
| CGU | ✅ | ✅ | Implémenté |
| Acceptation à l'inscription | ✅ | ✅ | Implémenté |
| Descriptions de permissions | ✅ | ✅ | Implémenté |
| Suppression de compte | ✅ | ✅ | Implémenté |
| Système de modération | ✅ | ✅ | Implémenté |
| Conformité RGPD | ✅ | ✅ | Implémenté |
| Signalement de contenu | ✅ | ✅ | Implémenté |
| Sécurité des données | ✅ | ✅ | Implémenté |

---

## 📝 Notes pour la Resoumission

### Changements depuis le dernier rejet:
1. ✅ Ajout checkbox CGU/Politique obligatoire à l'inscription
2. ✅ Ajout popups CGU/Politique dans l'app (pas de liens externes)
3. ✅ Ajout bouton suppression de compte dans le profil
4. ✅ Descriptions détaillées des permissions Android
5. ✅ Info.plist iOS avec toutes les descriptions de permissions
6. ✅ Système complet de modération et signalement

### À mentionner dans les notes de review:
- Système de modération activement géré par des administrateurs
- Politique de confidentialité conforme RGPD
- Suppression de compte accessible dans Profil > Supprimer mon compte
- Acceptation explicite des CGU à l'inscription
- Toutes les permissions sont justifiées et expliquées
