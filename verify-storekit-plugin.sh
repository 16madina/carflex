#!/bin/bash

# Script de vérification du plugin StoreKit
# Vérifie que tout est correctement configuré

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Vérification du Plugin StoreKit${NC}"
echo -e "${BLUE}========================================${NC}\n"

ERRORS=0
WARNINGS=0

# Fonction de vérification
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 ${RED}(manquant)${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $3"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}  $3 ${YELLOW}(non trouvé)${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

echo -e "${YELLOW}📂 Vérification des fichiers${NC}"
check_file "ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.swift"
check_file "ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.m"
check_file "ios/StoreKitPlugin.podspec"
check_file "ios/App/Podfile"
check_file "ios/App/App/App-Bridging-Header.h"

echo -e "\n${YELLOW}📝 Vérification du contenu${NC}"
check_content "ios/StoreKitPlugin.podspec" "s.name.*StoreKitPlugin" "Podspec valide"
check_content "ios/App/Podfile" "StoreKitPlugin" "Plugin référencé dans Podfile"
check_content "ios/App/App/App-Bridging-Header.h" "Capacitor/Capacitor.h" "Import Capacitor dans bridging header"
check_content "ios/App/App/Plugins/StoreKitPlugin/StoreKitPlugin.m" "CAP_PLUGIN" "Plugin enregistré pour Capacitor"

echo -e "\n${YELLOW}🔍 Vérification des pods${NC}"
if [ -f "ios/App/Podfile.lock" ]; then
    if grep -q "StoreKitPlugin" "ios/App/Podfile.lock"; then
        echo -e "${GREEN}✅${NC} Plugin installé dans Podfile.lock"
    else
        echo -e "${YELLOW}⚠️${NC}  Plugin non trouvé dans Podfile.lock ${YELLOW}(pod install requis)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌${NC} Podfile.lock manquant ${RED}(pod install requis)${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "ios/App/Pods/StoreKitPlugin" ]; then
    echo -e "${GREEN}✅${NC} Dossier Pods/StoreKitPlugin présent"
else
    echo -e "${YELLOW}⚠️${NC}  Dossier Pods/StoreKitPlugin absent ${YELLOW}(pod install requis)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo -e "\n${YELLOW}🔧 Vérification de l'environnement${NC}"

# Vérifier CocoaPods
if command -v pod &> /dev/null; then
    POD_VERSION=$(pod --version)
    echo -e "${GREEN}✅${NC} CocoaPods installé (version $POD_VERSION)"
else
    echo -e "${RED}❌${NC} CocoaPods non installé"
    ERRORS=$((ERRORS + 1))
fi

# Vérifier Capacitor CLI
if command -v npx &> /dev/null; then
    echo -e "${GREEN}✅${NC} npx disponible"
else
    echo -e "${RED}❌${NC} npx non disponible"
    ERRORS=$((ERRORS + 1))
fi

# Vérifier les node_modules
if [ -d "node_modules/@capacitor/ios" ]; then
    echo -e "${GREEN}✅${NC} @capacitor/ios installé"
else
    echo -e "${RED}❌${NC} @capacitor/ios manquant ${RED}(npm install requis)${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -e "\n${BLUE}========================================${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tout est correctement configuré!${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    echo -e "${BLUE}Vous pouvez maintenant lancer:${NC}"
    echo -e "  ${YELLOW}npx cap sync ios${NC}"
    echo -e "  ${YELLOW}npx cap run ios${NC}\n"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Configuration OK avec $WARNINGS avertissement(s)${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    echo -e "${YELLOW}Actions recommandées:${NC}"
    if ! grep -q "StoreKitPlugin" "ios/App/Podfile.lock" 2>/dev/null; then
        echo -e "1. Installer les pods:"
        echo -e "   ${YELLOW}cd ios/App && pod install && cd ../..${NC}"
    fi
    echo -e "2. Synchroniser Capacitor:"
    echo -e "   ${YELLOW}npx cap sync ios${NC}\n"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) et $WARNINGS avertissement(s)${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    echo -e "${RED}Le plugin n'est pas correctement configuré.${NC}"
    echo -e "${YELLOW}Exécutez le script de configuration:${NC}"
    echo -e "  ${YELLOW}./setup-storekit-plugin.sh${NC}\n"
    exit 1
fi
