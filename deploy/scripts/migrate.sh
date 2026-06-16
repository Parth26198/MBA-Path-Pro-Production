#!/usr/bin/env bash
# MBA Path Pro — database schema + migrations + optional seed
# Run from repo root: bash deploy/scripts/migrate.sh [--seed]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/backend"

if [[ ! -f .env ]]; then
  echo "ERROR: backend/.env not found. Copy .env.production.example to .env first."
  exit 1
fi

echo "==> Running base schema migration..."
npm run db:migrate

echo "==> Running production migrations..."
npm run db:migrate:prod

if [[ "${1:-}" == "--seed" ]]; then
  echo "==> Seeding demo data (first deploy only)..."
  npm run db:seed
fi

echo "==> Database ready."
