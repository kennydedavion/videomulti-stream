#!/bin/bash

# Nastav proměnné pro číslování verzí
MAJOR_VERSION=1
MINOR_VERSION=0

# Nekonečná smyčka pro sledování změn
while true
do
  # Zkontroluj, jestli jsou nějaké změny
  if [[ `git status --porcelain` ]]; then
    # Přidej všechny změny
    git add .

    # Vytvoř commit s číslem verze
    git commit -m "Version ${MAJOR_VERSION}.${MINOR_VERSION}"

    # Zvětši číslo verze
    MINOR_VERSION=$((MINOR_VERSION + 1))

    # Push na GitHub
    git push origin main
  fi

  # Počkej 5 minut, než se znovu zkontrolují změny
  sleep 300
done

