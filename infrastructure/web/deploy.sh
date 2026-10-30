#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/kiochan-web}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4095}"
cd "$APP_DIR"

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

compose up -d --no-build --wait --wait-timeout 120 web
curl --fail --silent --show-error --retry 5 --retry-delay 2 "$HEALTH_URL/api/health" >/dev/null
curl --fail --silent --show-error --retry 5 --retry-delay 2 "$HEALTH_URL/api/health/database" >/dev/null
echo "Website and database health checks passed."
compose ps
