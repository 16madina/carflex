#!/usr/bin/env bash
set -euo pipefail

# Génère toutes les tailles d'icônes iOS à partir du master 1024px.
# Utilise 'sips' (disponible par défaut sur macOS).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ICONSET_DIR="$ROOT_DIR/ios/App/App/Assets.xcassets/AppIcon.appiconset"
SRC="$ICONSET_DIR/1024.png"

if [ ! -f "$SRC" ]; then
  echo "[generate-app-icons] ERREUR: fichier source introuvable: $SRC"
  exit 1
fi

cd "$ICONSET_DIR"

resize() {
  local px="$1"
  local out="$2"
  echo "[generate-app-icons] -> $out (${px}x${px})"
  sips -Z "$px" "$SRC" --out "$out" >/dev/null
}

# iPhone
resize 40  "icon-20@2x.png"
resize 60  "icon-20@3x.png"

resize 58  "icon-29@2x.png"
resize 87  "icon-29@3x.png"

resize 80  "icon-40@2x.png"
resize 120 "icon-40@3x.png"

resize 120 "icon-60@2x.png"
resize 180 "icon-60@3x.png"

# iPad
resize 20  "icon-20@1x.png"
# icon-20@2x.png déjà généré plus haut (40px)

resize 29  "icon-29@1x.png"
# icon-29@2x.png déjà généré plus haut (58px)

resize 40  "icon-40@1x.png"
# icon-40@2x.png déjà généré plus haut (80px)

resize 76  "icon-76@1x.png"
resize 152 "icon-76@2x.png"

resize 167 "icon-83.5@2x.png"

# App Store
resize 1024 "icon-1024.png"

echo "[generate-app-icons] OK. Icônes générées dans: $ICONSET_DIR"