#!/bin/bash

echo "🔧 REBUILD COMPLET DE L'APP"
echo ""

echo "1️⃣ Build de l'app web..."
npm run build

echo ""
echo "2️⃣ Synchronisation avec iOS..."
npx cap sync ios

echo ""
echo "3️⃣ Réinstallation des Pods..."
cd ios/App
rm -rf Pods Podfile.lock
pod install

echo ""
echo "✅ TERMINÉ!"
echo ""
echo "🚀 Maintenant:"
echo "   1. Fermez Xcode complètement (⌘ + Q)"
echo "   2. Dans le Terminal: open ios/App/App.xcworkspace"
echo "   3. Dans Xcode: Clean Build Folder (⌘ + Shift + K)"
echo "   4. Build (⌘ + B)"
echo "   5. Run (⌘ + R)"
