#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

APP_DIR="${APP_DIR:-/opt/kiochan-postgres}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

backup="$BACKUP_DIR/kiochan-postgres-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
partial="$(mktemp "$BACKUP_DIR/.backup.XXXXXX")"
trap 'rm -f -- "$partial"' EXIT

docker exec kiochan-postgres pg_dumpall -U kiochan_admin | gzip > "$partial"
gzip --test "$partial"
mv -- "$partial" "$backup"
echo "Cluster backup created: $backup"
