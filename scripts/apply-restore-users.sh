#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/apply-restore-users.sh
# Applies the SQL to recreate the `users` table and updates Prisma client.

SQL_FILE="prisma/migrations/restore_users_table/migration.sql"
if [ ! -f "$SQL_FILE" ]; then
  echo "Missing $SQL_FILE"
  exit 1
fi

# Use DIRECT_URL from .env (recommended for migrations)
if [ -z "${DIRECT_URL:-}" ]; then
  echo "DIRECT_URL not found in environment — loading from .env"
  # shellcheck disable=SC1091
  source .env
fi

if [ -z "${DIRECT_URL:-}" ]; then
  echo "Please set DIRECT_URL in your environment or .env and re-run."
  exit 2
fi

echo "Applying SQL to database..."
echo "-- SQL: $SQL_FILE --"
psql "$DIRECT_URL" -f "$SQL_FILE"

echo "Refreshing Prisma schema from DB..."
npx prisma db pull
npx prisma generate

echo "Done. The users table should be present and Prisma client regenerated."