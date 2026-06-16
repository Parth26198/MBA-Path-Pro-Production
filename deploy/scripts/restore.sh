#!/usr/bin/env bash
# MBA Path Pro — restore MySQL + uploads from backup
# Usage: bash deploy/scripts/restore.sh /path/to/db.sql.gz /path/to/uploads.tar.gz

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <db_backup.sql.gz> <uploads_backup.tar.gz>"
  exit 1
fi

DB_BACKUP="$1"
UPLOADS_BACKUP="$2"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT/backend/.env"

set -a
# shellcheck disable=SC1090
source <(grep -E '^(DB_HOST|DB_PORT|DB_USER|DB_PASSWORD|DB_NAME)=' "$ENV_FILE" | sed 's/\r$//')
set +a

read -r -p "This will OVERWRITE the database and uploads. Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

echo "==> Restoring MySQL..."
gunzip -c "$DB_BACKUP" | mysql -h "${DB_HOST:-127.0.0.1}" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"

echo "==> Restoring uploads..."
rm -rf "$ROOT/backend/uploads"
mkdir -p "$ROOT/backend"
tar -xzf "$UPLOADS_BACKUP" -C "$ROOT/backend"
chmod -R 755 "$ROOT/backend/uploads"

echo "==> Restarting API..."
pm2 restart mbapathpro-api

echo "==> Restore complete."
