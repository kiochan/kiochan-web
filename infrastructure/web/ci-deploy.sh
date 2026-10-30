#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

revision="${1:-}"
if [[ ! "$revision" =~ ^[a-f0-9]{40}$ ]]; then
  echo "A full commit SHA is required."
  exit 1
fi

read -r registry_user
read -r registry_token
test -n "$registry_user" && test -n "$registry_token"

export DOCKER_CONFIG
DOCKER_CONFIG="$(mktemp -d /tmp/kiochan-registry.XXXXXX)"
trap 'rm -rf -- "$DOCKER_CONFIG"' EXIT
printf '%s' "$registry_token" | docker login ghcr.io --username "$registry_user" --password-stdin
unset registry_token

export KIOCHAN_WEB_IMAGE="ghcr.io/kiochan/kiochan-web:sha-$revision"
export KIOCHAN_MIGRATION_IMAGE="ghcr.io/kiochan/kiochan-web:migrate-$revision"
bash /opt/kiochan-web/deploy.sh
