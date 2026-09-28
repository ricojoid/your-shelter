#!/bin/sh
set -e

echo "=========================================="
echo "🚀 Starting Your Shelter container"
echo "=========================================="

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set. Copy .env.example to .env and fill it in."
  exit 1
fi
echo "📡 Database: $(echo "$DATABASE_URL" | sed -e 's/:[^:@]*@/:****@/')"

# Creates the database if missing, then applies server/db/schema.sql (idempotent).
echo "⏳ Ensuring database & schema..."
attempt=1
until node server/src/migrate.js; do
  if [ "$attempt" -ge 5 ]; then
    echo "❌ Database still unreachable after $attempt attempts — giving up."
    exit 1
  fi
  echo "⚠️  Attempt $attempt failed, retrying in 3s..."
  attempt=$((attempt + 1))
  sleep 3
done

echo "✅ Database ready."
echo "🚀 Launching server on ${HOST:-0.0.0.0}:${PORT:-3030}..."

exec "$@"
