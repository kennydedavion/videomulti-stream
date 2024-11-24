#!/bin/bash

# Nastav počáteční čísla verze
MAJOR_VERSION=0
MINOR_VERSION=0
PATCH_VERSION=1

# Pauza mezi jednotlivými verzemi pro ruční rewind
PAUSE_BETWEEN_VERSIONS=60  # 60 sekund

# Funkce pro vytvoření čísla verze ve formátu X.Y.Z
function get_version {
  echo "${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}"
}

# Nekonečná smyčka pro commitování verzí
while true
do
  # Zkontroluj, jestli jsou nějaké změny
  if [[ `git status --porcelain` ]]; then
    # Přidej všechny změny
    git add .

    # Vytvoř commit s číslem verze
    VERSION=$(get_version)
    git commit -m "Version ${VERSION}"

    # Push na GitHub
    git push origin main

    # Zvýšení čísla verze (přidání další verze)
    PATCH_VERSION=$((PATCH_VERSION + 1))

    # Pauza pro ruční rewind na další verzi
    echo "Proveď rewind na další verzi v Glitch. Skript se znovu spustí za ${PAUSE_BETWEEN_VERSIONS} sekund."
    sleep $PAUSE_BETWEEN_VERSIONS
  else
    echo "Žádné změny ke commitování, čekám na další rewind..."
  fi
done

