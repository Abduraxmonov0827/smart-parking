#!/bin/sh
set -e

echo "Applying database schema..."
npx prisma db push --skip-generate

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts || true
fi

echo "Starting API server..."
exec node dist/server.js
