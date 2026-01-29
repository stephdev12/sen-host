#!/bin/sh
set -e

# Appliquer les migrations de base de données (créer les tables si elles n'existent pas)
echo "Running Prisma Migrations..."
npx prisma migrate deploy

# Démarrer le serveur Next.js
echo "Starting Next.js Server..."
node server.js
