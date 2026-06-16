#!/usr/bin/env bash
# MBA Path Pro — production deploy / update
# Run from repo root: bash deploy/scripts/deploy.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> Pulling latest code..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git pull --ff-only
fi

echo "==> Installing backend dependencies..."
cd "$ROOT/backend"
npm ci --omit=dev

echo "==> Ensuring upload directories exist..."
mkdir -p uploads/documents uploads/colleges uploads/resources uploads/invoices
chmod -R 755 uploads

echo "==> Installing frontend dependencies..."
cd "$ROOT/frontend"
npm ci

echo "==> Building frontend for production..."
if [[ -f .env.production ]]; then
  cp .env.production .env.production.local 2>/dev/null || true
fi
export VITE_API_URL="${VITE_API_URL:-/api/v1}"
npm run build

echo "==> Syncing frontend build to web root..."
WEB_ROOT="${WEB_ROOT:-/var/www/mbapathpro/frontend/dist}"
mkdir -p "$(dirname "$WEB_ROOT")"
rsync -a --delete "$ROOT/frontend/dist/" "$WEB_ROOT/"

echo "==> Running database migrations..."
bash "$ROOT/deploy/scripts/migrate.sh"

echo "==> Restarting API with PM2..."
cd "$ROOT"
mkdir -p logs
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

echo "==> Deploy complete."
echo "    Frontend: \$WEB_ROOT"
echo "    API:      pm2 status mbapathpro-api"
echo "    Health:   curl -s https://MY_DOMAIN/health | jq"
