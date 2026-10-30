#!/bin/sh
set -eu

psql --username "$POSTGRES_USER" --dbname postgres --set ON_ERROR_STOP=1 \
  --set web_password="$KIOCHAN_WEB_DATABASE_PASSWORD" <<'SQL'
CREATE ROLE kiochan_web LOGIN PASSWORD :'web_password';
CREATE DATABASE kiochan_web OWNER kiochan_web;
REVOKE ALL ON DATABASE kiochan_web FROM PUBLIC;
SQL
