#!/bin/bash

# Script de démarrage pour Agents Liminals Frontend (Next.js 15)
# Version: 3.0.0

echo "🚀 Agents Liminals - Next.js 15"
echo "==============================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ avant de continuer."
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js $NODE_VERSION détecté. Version $REQUIRED_VERSION ou supérieure requise."
    exit 1
fi

echo "✅ Node.js $NODE_VERSION détecté"

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé."
    exit 1
fi

echo "✅ npm $(npm -v) détecté"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
    echo "✅ Dépendances installées"
else
    echo "✅ Dépendances déjà installées"
fi

# Vérifier si le build existe
if [ ! -d ".next" ]; then
    echo "🔨 Build de l'application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors du build"
        exit 1
    fi
    echo "✅ Build terminé"
else
    echo "✅ Build existant trouvé"
fi

# Démarrer l'application
echo "🌟 Démarrage de l'application..."
echo "🔗 L'application sera disponible sur http://localhost:3000"
echo ""
echo "Pour arrêter l'application, utilisez Ctrl+C"
echo ""

# Démarrer Next.js en mode production
npm start