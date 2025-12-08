#!/bin/bash

echo "🔍 DIAGNOSTIC XCODE - StoreKitPlugin"
echo "===================================="
echo ""

echo "📁 1. Vérification des fichiers:"
echo "--------------------------------"
if [ -f "ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift" ]; then
    echo "✅ StoreKitPlugin.swift trouvé"
    echo "   Taille: $(wc -c < ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift) octets"
else
    echo "❌ StoreKitPlugin.swift MANQUANT"
fi

if [ -f "ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.m" ]; then
    echo "✅ StoreKitPlugin.m trouvé"
    echo "   Taille: $(wc -c < ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.m) octets"
else
    echo "❌ StoreKitPlugin.m MANQUANT"
fi

if [ -f "ios/App/App/App-Bridging-Header.h" ]; then
    echo "✅ App-Bridging-Header.h trouvé"
else
    echo "❌ App-Bridging-Header.h MANQUANT"
fi

echo ""
echo "📋 2. Contenu du Bridging Header:"
echo "---------------------------------"
cat ios/App/App/App-Bridging-Header.h

echo ""
echo "⚙️  3. Configuration dans project.pbxproj:"
echo "------------------------------------------"
BRIDGING_HEADER=$(grep "SWIFT_OBJC_BRIDGING_HEADER" ios/App/App.xcodeproj/project.pbxproj | head -1)
if [ ! -z "$BRIDGING_HEADER" ]; then
    echo "✅ Bridging Header configuré:"
    echo "$BRIDGING_HEADER"
else
    echo "❌ Bridging Header NON configuré"
fi

echo ""
echo "🔗 4. Fichiers enregistrés dans le projet:"
echo "-------------------------------------------"
if grep -q "StoreKitPlugin.swift in Sources" ios/App/App.xcodeproj/project.pbxproj; then
    echo "✅ StoreKitPlugin.swift est dans Sources"
else
    echo "❌ StoreKitPlugin.swift N'EST PAS dans Sources"
fi

if grep -q "StoreKitPlugin.m in Sources" ios/App/App.xcodeproj/project.pbxproj; then
    echo "✅ StoreKitPlugin.m est dans Sources"
else
    echo "❌ StoreKitPlugin.m N'EST PAS dans Sources"
fi

echo ""
echo "📦 5. Vérification du framework StoreKit:"
echo "------------------------------------------"
if grep -q "StoreKit.framework" ios/App/App.xcodeproj/project.pbxproj; then
    echo "✅ StoreKit.framework est lié"
else
    echo "⚠️  StoreKit.framework pourrait ne pas être lié"
fi

echo ""
echo "✅ DIAGNOSTIC TERMINÉ"
echo "====================="
echo ""
echo "👉 Maintenant, ouvrez Xcode et suivez les instructions dans XCODE_VERIFICATION_REPORT.md"
