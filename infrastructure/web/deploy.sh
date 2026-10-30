#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/kiochan-web}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4095}"
cd "$APP_DIR"

exec 9>"$APP_DIR/.deploy.lock"
flock -n 9 || { echo "Another deployment is running."; exit 1; }

compose() {
  docker compose --env-file env/prod.env -f compose.yaml "$@"
}

previous_image="$(docker inspect --format '{{.Image}}' kiochan-web 2>/dev/null || true)"
if [ -n "$previous_image" ]; then
  docker image tag "$previous_image" kiochan-web:rollback
fi

rollback() {
  echo "Deployment failed. Checking whether rollback is available."
  trap - ERR
  if [ -n "$previous_image" ]; then
    KIOCHAN_WEB_IMAGE="$previous_image" compose up -d --no-build --wait --wait-timeout 120 web
    echo "The previous website image has been restored."
  else
    echo "No previous website image exists. The database has been preserved."
  fi
  exit 1
}
trap rollback ERR

if [ -n "${KIOCHAN_MIGRATION_IMAGE:-}" ]; then
  test -n "${KIOCHAN_WEB_IMAGE:-}"
  docker pull "$KIOCHAN_WEB_IMAGE"
  docker pull "$KIOCHAN_MIGRATION_IMAGE"
  /opt/kiochan-postgres/backup.sh
  migration_override="$(mktemp "$APP_DIR/.migration-compose.XXXXXX.yaml")"
  trap 'rm -f -- "$migration_override"' EXIT
  printf 'services:\n  web:\n    image: %s\n' "$KIOCHAN_MIGRATION_IMAGE" > "$migration_override"
  docker compose --env-file env/prod.env -f compose.yaml -f "$migration_override" \
    run --rm --no-deps -T web
  rm -f -- "$migration_override"
fi

compose up -d --no-build --wait --wait-timeout 120 web
curl --fail --silent --show-error --retry 5 --retry-delay 2 "$HEALTH_URL/api/health" >/dev/null
curl --fail --silent --show-error --retry 5 --retry-delay 2 "$HEALTH_URL/api/health/database" >/dev/null
echo "Website and database health checks passed."

if [ -n "${KIOCHAN_MIGRATION_IMAGE:-}" ]; then
  python3 - <<'PY'
import os
from pathlib import Path

path = Path('env/prod.env')
values = {key: os.environ[key] for key in ['KIOCHAN_WEB_IMAGE', 'KIOCHAN_MIGRATION_IMAGE']}
lines = [line for line in path.read_text().splitlines() if line.split('=', 1)[0] not in values]
lines.extend(f'{key}={value}' for key, value in values.items())
temporary = path.with_suffix('.pending')
fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
with os.fdopen(fd, 'w') as stream:
    stream.write('\n'.join(lines) + '\n')
temporary.replace(path)
PY
fi

compose ps
