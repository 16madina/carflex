#!/bin/bash

# Script de rollback pour le plugin StoreKit
# Annule les modifications faites par setup-storekit-plugin.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Rollback du Plugin StoreKit${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${RED}⚠️  Ce script va annuler les modifications du plugin StoreKit${NC}\n"

read -p "Voulez-vous continuer? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Opération annulée.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}📋 Étape 1: Suppression du podspec${NC}"
if [ -f "ios/StoreKitPlugin.podspec" ]; then
    rm "ios/StoreKitPlugin.podspec"
    echo -e "${GREEN}✅ StoreKitPlugin.podspec supprimé${NC}"
else
    echo -e "${BLUE}ℹ️  Podspec déjà absent${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Étape 2: Restauration du Podfile${NC}"
if [ -f "ios/App/Podfile.backup" ]; then
    cp "ios/App/Podfile.backup" "ios/App/Podfile"
    echo -e "${GREEN}✅ Podfile restauré depuis la sauvegarde${NC}"
else
    # Supprimer manuellement la ligne du plugin
    if grep -q "pod 'StoreKitPlugin'" "ios/App/Podfile"; then
        # Créer une sauvegarde avant modification
        cp "ios/App/Podfile" "ios/App/Podfile.rollback-backup"
        
        # Supprimer les lignes du plugin
        sed -i.tmp "/# Plugin StoreKit personnalisé/d" "ios/App/Podfile"
        sed -i.tmp "/pod 'StoreKitPlugin'/d" "ios/App/Podfile"
        rm "ios/App/Podfile.tmp"
        
        echo -e "${GREEN}✅ Référence au plugin supprimée du Podfile${NC}"
    else
        echo -e "${BLUE}ℹ️  Podfile ne contient pas de référence au plugin${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📋 Étape 3: Nettoyage des pods${NC}"
cd ios/App

if [ -d "Pods/StoreKitPlugin" ]; then
    echo -e "${BLUE}🧹 Suppression du pod StoreKitPlugin${NC}"
fi

rm -rf Pods Podfile.lock

echo -e "${GREEN}✅ Pods nettoyés${NC}"

echo ""
echo -e "${BLUE}📦 Réinstallation des pods sans le plugin...${NC}"
pod install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Pods réinstallés${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation des pods${NC}"
    cd ../..
    exit 1
fi

cd ../..

echo ""
echo -e "${YELLOW}📋 Étape 4: Nettoyage du cache Xcode${NC}"
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
echo -e "${GREEN}✅ Cache Xcode nettoyé${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Rollback terminé avec succès!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}⚠️  Note importante:${NC}"
echo -e "Le plugin StoreKit personnalisé n'est plus configuré comme pod."
echo -e "Les fichiers source sont toujours présents dans:"
echo -e "  ${BLUE}ios/App/App/Plugins/StoreKitPlugin/${NC}\n"

echo -e "${BLUE}Pour reconfigurer le plugin, exécutez:${NC}"
echo -e "  ${YELLOW}./setup-storekit-plugin.sh${NC}\n"

echo -e "${BLUE}Pour utiliser le plugin, vous devrez:${NC}"
echo -e "  ${YELLOW}1. Ajouter manuellement les fichiers dans Xcode${NC}"
echo -e "  ${YELLOW}2. Ou réexécuter le script de setup${NC}\n"
