#!/bin/sh
set -e

echo "🔍 DEBUG: DATABASE_URL is: $DATABASE_URL"

# Extract DB path from DATABASE_URL (assuming file: protocol)
DB_PATH=$(echo "$DATABASE_URL" | sed 's/file://')

if [ -f "$DB_PATH" ]; then
    echo "✅ Database file exists at: $DB_PATH"
    ls -l "$DB_PATH"
else
    echo "⚠️ Database file NOT found at: $DB_PATH (will be created by migrate)"
fi

# Appliquer les migrations de base de données (créer les tables si elles n'existent pas)
echo "Running Prisma Migrations..."
npx prisma migrate deploy

if [ -f "$DB_PATH" ]; then
    echo "✅ Database file AFTER migration:"
    ls -l "$DB_PATH"
else
    echo "❌ CRITICAL: Database file still NOT found at: $DB_PATH"
fi

# Démarrer le cron job en arrière-plan

# Démarrer le cron job en arrière-plan
echo "Starting Cron Job..."
node cron.js &

# Démarrer le serveur Next.js
echo "Starting Next.js Server..."
node server.js
