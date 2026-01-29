#!/bin/sh
set -e

echo "🔍 DEBUG: Starting entrypoint script..."
echo "🔍 DEBUG: DATABASE_URL is: $DATABASE_URL"

# Extract DB path from DATABASE_URL (assuming file: protocol)
DB_PATH=$(echo "$DATABASE_URL" | sed 's/file://')

# Appliquer les migrations de base de données (créer les tables si elles n'existent pas)
echo "Running Prisma Migrations..."
npx prisma migrate deploy

if [ -f "$DB_PATH" ]; then
    echo "✅ Database file exists after migration:"
    ls -l "$DB_PATH"
else
    echo "⚠️ Database file NOT found at: $DB_PATH (Check DATABASE_URL and Volume configuration)"
fi

# Démarrer le cron job en arrière-plan
echo "Starting Cron Job..."
node cron.js &

# Démarrer le serveur Next.js
echo "Starting Next.js Server..."

if [ -f "./server.js" ]; then
    echo "🚀 Running in Standalone mode (Docker)..."
    node server.js
else
    echo "🚀 Running in Standard mode (Buildpack)..."
    # Ensure port is set, default to 3007 if not
    PORT="${PORT:-3007}"
    npx next start -p $PORT
fi

# Démarrer le cron job en arrière-plan
echo "Starting Cron Job..."
node cron.js &

# Démarrer le serveur Next.js
echo "Starting Next.js Server..."
node server.js
