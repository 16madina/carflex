#!/bin/bash

echo "🔴 FIX CapacitorSplashScreen Corrompu"
echo "======================================"
echo ""

# Étape 1 : Fermer Xcode
echo "📱 Fermeture de Xcode..."
killall Xcode 2>/dev/null || true
sleep 2

# Étape 2 : Supprimer le package npm corrompu
echo "🗑️  Suppression du package @capacitor/splash-screen..."
rm -rf node_modules/@capacitor/splash-screen
rm -rf node_modules/.cache

# Étape 3 : Réinstaller le package npm proprement
echo "📦 Réinstallation de @capacitor/splash-screen..."
npm install @capacitor/splash-screen@7.0.3 --force

# Étape 4 : Nettoyer complètement les pods iOS
echo "🧹 Nettoyage complet des Pods iOS..."
cd ios/App
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf DerivedData

# Étape 5 : Réinstaller les pods avec nettoyage complet
echo "📦 Installation des Pods (peut prendre 2-3 min)..."
pod deintegrate 2>/dev/null || true
pod install --repo-update --clean-install

# Étape 6 : Vérifier que SplashScreen.swift existe et est valide
echo "✅ Vérification du fichier SplashScreen..."
SPLASH_FILE="Pods/CapacitorSplashScreen/Sources/SplashScreenPlugin/SplashScreenPlugin.swift"
if [ -f "$SPLASH_FILE" ]; then
    echo "   ✅ Fichier trouvé : $SPLASH_FILE"
    head -5 "$SPLASH_FILE"
else
    echo "   ❌ Fichier introuvable : $SPLASH_FILE"
fi

# Étape 7 : Ouvrir Xcode
echo ""
echo "🚀 Ouverture de Xcode..."
open App.xcworkspace

echo ""
echo "✅ TERMINÉ !"
echo ""
echo "Dans Xcode :"
echo "1. Attendez l'indexation complète"
echo "2. Product → Clean Build Folder (⇧⌘K)"
echo "3. Product → Build (⌘B)"
echo ""
