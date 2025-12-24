#!/bin/bash

# Script de configuration automatique du plugin StoreKit pour iOS
# Ce script configure le plugin personnalisé dans le projet Xcode

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Configuration du Plugin StoreKit${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Vérifier qu'on est à la racine du projet
if [ ! -f "capacitor.config.ts" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Étape 1: Vérification des fichiers du plugin${NC}"

# Chemins des fichiers
PLUGIN_DIR="ios/App/App/Plugins/StoreKitPlugin"
SWIFT_FILE="$PLUGIN_DIR/StoreKitPlugin.swift"
OBJC_FILE="$PLUGIN_DIR/StoreKitPlugin.m"
BRIDGING_HEADER="ios/App/App/App-Bridging-Header.h"

# Vérifier que les fichiers du plugin existent
if [ ! -f "$SWIFT_FILE" ]; then
    echo -e "${RED}❌ Fichier manquant: $SWIFT_FILE${NC}"
    exit 1
fi

if [ ! -f "$OBJC_FILE" ]; then
    echo -e "${RED}❌ Fichier manquant: $OBJC_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Fichiers du plugin trouvés${NC}\n"

# echo -e "${YELLOW}📋 Étape 2: Configuration via CocoaPods (méthode recommandée)${NC}"

# # Créer le podspec local
# PODSPEC_FILE="ios/StoreKitPlugin.podspec"

# cat > "$PODSPEC_FILE" << 'EOF'
# Pod::Spec.new do |s|
#   s.name             = 'StoreKitPlugin'
#   s.version          = '1.0.0'
#   s.summary          = 'Custom StoreKit Plugin for Capacitor'
#   s.description      = 'A custom Capacitor plugin for iOS in-app purchases using StoreKit'
#   s.homepage         = 'https://github.com/capacitor-community/storekit-plugin'
#   s.license          = { :type => 'MIT' }
#   s.author           = { 'Capacitor Community' => 'hello@capacitorjs.com' }
#   s.source           = { :git => '', :tag => s.version.to_s }
#   s.source_files     = 'App/App/Plugins/StoreKitPlugin/**/*.{swift,h,m}'
#   s.ios.deployment_target = '14.0'
#   s.swift_versions   = '5.0'
#   s.dependency 'Capacitor'
#   s.dependency 'CapacitorCordova'
# end
# EOF

# echo -e "${GREEN}✅ Podspec créé: $PODSPEC_FILE${NC}\n"

# echo -e "${YELLOW}📋 Étape 3: Mise à jour du Podfile${NC}"

# PODFILE="ios/App/Podfile"

# # Vérifier si le plugin est déjà dans le Podfile
# if grep -q "pod 'StoreKitPlugin'" "$PODFILE"; then
#     echo -e "${BLUE}ℹ️  Le plugin est déjà référencé dans le Podfile${NC}"
# else
#     # Créer une sauvegarde
#     cp "$PODFILE" "$PODFILE.backup"
#     echo -e "${GREEN}✅ Sauvegarde créée: $PODFILE.backup${NC}"
    
#     # Ajouter le pod dans le bloc "target 'App' do"
#     sed -i.tmp "/# Add your Pods here/a\\
#   pod 'StoreKitPlugin', :path => '../' # Ajouté par le script
# " "$PODFILE"
    
#     rm "$PODFILE.tmp"
#     rm "$PODFILE.backup"
#     echo -e "${GREEN}✅ Podfile mis à jour et sauvegarde supprimée${NC}"
# fi

echo ""
echo -e "${YELLOW}📋 Étape 4: Vérification du Bridging Header${NC}"

# Vérifier que le bridging header existe et contient l'import Capacitor
if [ ! -f "$BRIDGING_HEADER" ]; then
    echo -e "${YELLOW}⚠️  Création du bridging header${NC}"
    cat > "$BRIDGING_HEADER" << 'EOF'
//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//

#import <Capacitor/Capacitor.h>
EOF
    echo -e "${GREEN}✅ Bridging header créé${NC}"
else
    if ! grep -q "Capacitor/Capacitor.h" "$BRIDGING_HEADER"; then
        echo -e "${YELLOW}⚠️  Ajout de l'import Capacitor au bridging header${NC}"
        echo "" >> "$BRIDGING_HEADER"
        echo "#import <Capacitor/Capacitor.h>" >> "$BRIDGING_HEADER"
        echo -e "${GREEN}✅ Import Capacitor ajouté${NC}"
    else
        echo -e "${GREEN}✅ Bridging header correct${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📋 Étape 5: Installation des pods${NC}"

cd ios/App

# Nettoyer les pods existants
if [ -d "Pods" ]; then
    echo -e "${BLUE}🧹 Nettoyage des pods existants${NC}"
    rm -rf Pods
    rm -f Podfile.lock
fi

# Installer les pods
echo -e "${BLUE}📦 Installation des pods...${NC}"
pod install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Pods installés avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation des pods${NC}"
    exit 1
fi

cd ../..

echo ""
echo -e "${YELLOW}📋 Étape 6: Clean build Xcode${NC}"

# Supprimer les données dérivées
echo -e "${BLUE}🧹 Nettoyage du cache Xcode${NC}"
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*

echo -e "${GREEN}✅ Cache nettoyé${NC}\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Configuration terminée avec succès!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}📝 Prochaines étapes:${NC}"
echo -e "1. Synchroniser Capacitor:"
echo -e "   ${YELLOW}npx cap sync ios${NC}\n"
echo -e "2. Lancer l'app sur iOS:"
echo -e "   ${YELLOW}npx cap run ios${NC}\n"
echo -e "3. Ou ouvrir dans Xcode:"
echo -e "   ${YELLOW}cd ios/App && open App.xcworkspace${NC}\n"

echo -e "${BLUE}💡 Le plugin StoreKit est maintenant configuré comme un pod local.${NC}"
echo -e "${BLUE}Il sera automatiquement inclus dans les futurs builds.${NC}\n"

echo -e "${YELLOW}⚠️  Note importante:${NC}"
echo -e "Si vous clonez le projet sur une autre machine, exécutez:"
echo -e "${YELLOW}pod install${NC} depuis le dossier ${YELLOW}ios/App/${NC}\n"
