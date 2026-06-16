#!/usr/bin/env bash
# MBA Path Pro — backup MySQL database + uploads directory
# Cron example: 0 2 * * * /var/www/mbapathpro/deploy/scripts/backup.sh >> /var/log/mbapathpro/backup.log 2>&1

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/mbapathpro}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
RETAIN_DAYS="${RETAIN_DAYS:-14}"

# Load DB credentials from backend .env
ENV_FILE="$ROOT/backend/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source <(grep -E '^(DB_HOST|DB_PORT|DB_USER|DB_PASSWORD|DB_NAME)=' "$ENV_FILE" | sed 's/\r$//')
set +a

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

MYSQL_DIR="$BACKUP_ROOT/mysql"
UPLOADS_DIR="$BACKUP_ROOT/uploads"
mkdir -p "$MYSQL_DIR" "$UPLOADS_DIR"

DB_FILE="$MYSQL_DIR/mba_admission_db_${TIMESTAMP}.sql.gz"
UPLOADS_FILE="$UPLOADS_DIR/uploads_${TIMESTAMP}.tar.gz"

echo "==> Backing up MySQL: $DB_FILE"
mysqldump \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  -u "$DB_USER" \
  -p"$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" | gzip > "$DB_FILE"

echo "==> Backing up uploads: $UPLOADS_FILE"
tar -czf "$UPLOADS_FILE" -C "$ROOT/backend" uploads

echo "==> Pruning backups older than ${RETAIN_DAYS} days..."
find "$MYSQL_DIR" -name '*.sql.gz' -mtime +"$RETAIN_DAYS" -delete
find "$UPLOADS_DIR" -name '*.tar.gz' -mtime +"$RETAIN_DAYS" -delete

echo "==> Backup complete."
echo "    Database: $DB_FILE"
echo "    Uploads:  $UPLOADS_FILE"
