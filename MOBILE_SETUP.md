# Configuration Mobile CarFlex

## ✅ Ce qui est configuré

### 1. Splash Screen (Désactivé)
- Le splash screen Capacitor se cache automatiquement au démarrage
- Configuration dans `capacitor.config.ts` avec `launchShowDuration: 0`
- Hook `useSplashScreen` dans `App.tsx` cache le splash immédiatement

### 2. Push Notifications (Android)
- Plugin `@capacitor/push-notifications` installé
- Hook `usePushNotifications` configuré dans `App.tsx`
- Gestion automatique des permissions
- Affichage des notifications via toast

### 3. Safe Areas iOS
- Compatible avec **TOUS les iPhones** (avec notch, Dynamic Island, etc.)
- Configuration CSS dans `index.css` avec `env(safe-area-inset-*)`
- Meta viewport avec `viewport-fit=cover` dans `index.html`
- Support pour iPhone X, 11, 12, 13, 14, 15 Pro Max, etc.

## 📱 Instructions pour tester sur Android

### Prérequis
- Android Studio installé
- Node.js et npm installés
- Un téléphone Android ou un émulateur

### Étapes

1. **Cloner le projet depuis GitHub**
   ```bash
   git clone [votre-repo]
   cd carflex-auto-hub
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Ajouter la plateforme Android**
   ```bash
   npx cap add android
   ```

4. **Build du projet**
   ```bash
   npm run build
   ```

5. **Synchroniser avec Capacitor**
   ```bash
   npx cap sync android
   ```

6. **Configuration Firebase (pour les Push Notifications)**
   - Créer un projet sur [Firebase Console](https://console.firebase.google.com/)
   - Télécharger `google-services.json`
   - Placer le fichier dans `android/app/`
   - Activer Cloud Messaging dans Firebase

7. **Lancer l'app**
   ```bash
   npx cap run android
   ```
   Ou ouvrir dans Android Studio :
   ```bash
   npx cap open android
   ```

## 📱 Instructions pour tester sur iOS

### Prérequis
- Mac avec Xcode installé
- Compte Apple Developer (pour tester sur device réel)

### Étapes

1. **Ajouter la plateforme iOS**
   ```bash
   npx cap add ios
   ```

2. **Build du projet**
   ```bash
   npm run build
   ```

3. **Synchroniser avec Capacitor**
   ```bash
   npx cap sync ios
   ```

4. **Ouvrir dans Xcode**
   ```bash
   npx cap open ios
   ```

5. **Dans Xcode:**
   - Sélectionner votre équipe de développement
   - Configurer le Bundle Identifier si nécessaire
   - Connecter votre iPhone ou utiliser le simulateur
   - Cliquer sur Run (▶️)

## 🔄 Après chaque modification du code

Après avoir fait `git pull` de nouvelles modifications :

```bash
npm run build
npx cap sync
```

## 🔔 Tester les Push Notifications (Android)

1. Après avoir lancé l'app, vérifier les logs pour obtenir le token :
   ```
   Push registration success, token: [votre-token]
   ```

2. Utiliser Firebase Console pour envoyer une notification test
   - Cloud Messaging > Nouvelle campagne
   - Collez le token de test

## 🛡️ Safe Areas iOS - Vérification

Les safe areas sont automatiquement gérées pour :
- ✅ iPhone X, XS, XS Max, XR
- ✅ iPhone 11, 11 Pro, 11 Pro Max
- ✅ iPhone 12, 12 mini, 12 Pro, 12 Pro Max
- ✅ iPhone 13, 13 mini, 13 Pro, 13 Pro Max
- ✅ iPhone 14, 14 Plus, 14 Pro, 14 Pro Max
- ✅ iPhone 15, 15 Plus, 15 Pro, 15 Pro Max

Le contenu s'ajuste automatiquement pour éviter le notch, la Dynamic Island et les bords arrondis.

## 🐛 Troubleshooting

### Le splash screen ne se cache pas
- Vérifier que `useSplashScreen()` est appelé dans `App.tsx`
- Build et sync à nouveau : `npm run build && npx cap sync`

### Les notifications ne fonctionnent pas
- Vérifier que `google-services.json` est bien dans `android/app/`
- Vérifier les permissions dans le manifest Android
- Vérifier les logs : `npx cap run android -l`

### Les safe areas ne fonctionnent pas sur iOS
- Vérifier que `viewport-fit=cover` est dans le meta viewport
- Vérifier que les styles CSS sont bien appliqués
- Tester sur un vrai device ou simulateur avec notch

## 📚 Ressources

- [Documentation Capacitor](https://capacitorjs.com/)
- [Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [Splash Screen Plugin](https://capacitorjs.com/docs/apis/splash-screen)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
