#!/bin/bash

echo "🔧 Réinstallation complète des Pods..."
echo ""

cd ios/App

echo "1️⃣ Suppression des anciennes installations..."
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "2️⃣ Deintegration CocoaPods..."
pod deintegrate

echo "3️⃣ Mise à jour du repo CocoaPods..."
pod repo update

echo "4️⃣ Installation des Pods..."
pod install

echo ""
echo "✅ Terminé!"
echo ""
echo "🚀 Maintenant dans Xcode:"
echo "   1. Fermez Xcode complètement"
echo "   2. Ouvrez: ios/App/App.xcworkspace"
echo "   3. Product → Clean Build Folder (⌘ + Shift + K)"
echo "   4. Product → Build (⌘ + B)"
echo "   5. Product → Run (⌘ + R)"
