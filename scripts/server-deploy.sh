#!/usr/bin/env bash
# Запускать на сервере из корня клонированного репозитория (или через CI по SSH).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

BRANCH="${DEPLOY_BRANCH:-main}"

# Снимает предупреждение Git «dubious ownership» при деплое под другим пользователем.
git config --global --add safe.directory "$REPO_ROOT" 2>/dev/null || true

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

# Старый production-only node_modules + NODE_ENV в окружении root дают «vite: not found».
rm -rf node_modules
NODE_ENV=development npm ci --no-audit --no-fund --loglevel=warn
NODE_ENV=production npm exec -- vite build

# nginx по умолчанию отдаёт Welcome — подключаем собранный dist как основной сайт на :80.
# Неинтерактивный SSH часто без /usr/sbin в PATH → command -v nginx молча пропускал блок.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
if command -v nginx >/dev/null 2>&1 || [ -x /usr/sbin/nginx ]; then
  SITE_CONF="/etc/nginx/sites-available/igor-broker-site"
  install -d "$(dirname "$SITE_CONF")"
  cat >"$SITE_CONF" <<NGINX_EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root $REPO_ROOT/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /assets/ {
        try_files \$uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = /favicon.svg {
        add_header Cache-Control "public, max-age=86400";
    }
}
NGINX_EOF
  ln -sf "$SITE_CONF" /etc/nginx/sites-enabled/igor-broker-site
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  if command -v systemctl >/dev/null 2>&1; then
    systemctl reload nginx
  else
    service nginx reload
  fi
fi

echo "Deploy build OK: $REPO_ROOT/dist"
