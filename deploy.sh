#!/bin/bash

# Configuration
REPO_URL="https://github.com/stephdev12/sen-host.git"
DB_FILE="prisma/dev.db"
BACKUP_DIR="backups"

echo "🚀 Démarrage du déploiement..."

# 1. Sauvegarde de la base de données
echo "💾 Sauvegarde de la base de données..."
mkdir -p $BACKUP_DIR
if [ -f "$DB_FILE" ]; then
    cp $DB_FILE "$BACKUP_DIR/dev.db.$(date +%F_%H-%M-%S).bak"
    echo "✅ Base de données sauvegardée."
else
    echo "⚠️ Aucune base de données trouvée à sauvegarder."
fi

# 2. Nettoyage Git pour éviter les conflits
echo "🧹 Nettoyage des fichiers locaux conflictuels..."
git reset --hard HEAD
git clean -fd

# 3. Pull du code
echo "⬇️ Récupération du code..."
git pull $REPO_URL

# 4. Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

echo "📦 Installation des dépendances du Bot..."
cd templates/sen-bot && npm install && cd ../..

# 5. Base de données
echo "🗄️ Mise à jour du schéma de base de données..."
# Si la base de données a été écrasée par le pull (ne devrait pas arriver avec .gitignore), on restaure
# Mais ici on suppose que .gitignore est correct.
npx prisma generate
npx prisma migrate deploy

# 6. Build
echo "🏗️ Construction de l'application..."
npm run build

# 7. Redémarrage des services
echo "🔄 Redémarrage des services PM2..."
pm2 restart sen-host
pm2 restart coin-deduction

echo "✅ Déploiement terminé avec succès !"
