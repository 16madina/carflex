#!/bin/bash

echo "🔴 FIX COMPLET iOS - Nettoyage Pods Corrompus"
echo "=============================================="
echo ""

# Étape 1 : Fermer Xcode
echo "📱 Étape 1/8 : Fermeture de Xcode..."
killall Xcode 2>/dev/null || true
sleep 2

# Étape 2 : Nettoyer le cache CocoaPods global
echo "🧹 Étape 2/8 : Nettoyage cache CocoaPods global..."
rm -rf ~/.cocoapods/repos
rm -rf ~/Library/Caches/CocoaPods

# Étape 3 : Nettoyer les caches Xcode
echo "🧹 Étape 3/8 : Nettoyage caches Xcode..."
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# Étape 4 : Supprimer les Pods locaux
echo "🧹 Étape 4/8 : Suppression Pods locaux..."
cd ios/App
rm -rf Pods
rm -rf Podfile.lock
rm -rf .build
rm -rf DerivedData

# Étape 5 : Setup CocoaPods
echo "📦 Étape 5/8 : Setup CocoaPods (peut prendre 2-3 min)..."
pod setup

# Étape 6 : Mettre à jour le repo CocoaPods
echo "📦 Étape 6/8 : Mise à jour repo CocoaPods..."
pod repo update

# Étape 7 : Installer les pods avec verbose
echo "📦 Étape 7/8 : Installation des Pods..."
pod install --repo-update --clean-install --verbose

# Étape 8 : Ouvrir Xcode
echo "✅ Étape 8/8 : Ouverture de Xcode..."
open App.xcworkspace

echo ""
echo "✅ TERMINÉ !"
echo ""
echo "Dans Xcode :"
echo "1. Attendez l'indexation complète"
echo "2. Product → Clean Build Folder (⇧⌘K)"
echo "3. Product → Build (⌘B)"
echo ""
