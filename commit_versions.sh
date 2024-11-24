#!/bin/bash

# Nastav začátek číslování verze
MAJOR_VERSION=1
MINOR_VERSION=0

# Cyklus, který bude čekat na vstup uživatele pro každou novou verzi
while true
do
  # Přidej všechny změny
  git add .

  # Vytvoř commit s verzí
  git commit -m "Version ${MAJOR_VERSION}.${MINOR_VERSION}"

  # Zvětši číslo verze
  MINOR_VERSION=$((MINOR_VERSION + 1))

  # Push na GitHub
  git push origin main

  # Pauza a čekání na uživatele, aby mohl provést 'rewind' na další verzi
  echo "Prováděj 'rewind' na další verzi v Glitch a poté stiskni ENTER."
  read
done

