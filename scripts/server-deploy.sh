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

# После reset на диске новая версия скрипта — перезапускаем, иначе выполняется старый код из памяти.
if [ "${DEPLOY_SCRIPT_REEXEC:-}" != "1" ]; then
  export DEPLOY_SCRIPT_REEXEC=1
  exec bash "$REPO_ROOT/scripts/server-deploy.sh" "$@"
fi

# Frontend build env (Sanity + site URL — без секретов)
SITE_DOMAIN="${SITE_DOMAIN:-igor-broker.site}"
cat >"$REPO_ROOT/.env" <<ENV_EOF
VITE_SANITY_PROJECT_ID=ho7l3gwr
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
VITE_SITE_URL=${VITE_SITE_URL:-https://igor-broker.site}
VITE_YANDEX_METRIKA_ID=${VITE_YANDEX_METRIKA_ID:-109498772}
ENV_EOF

# Bot env — из переменных окружения CI/SSH (секреты не в git)
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ]; then
  mkdir -p "$REPO_ROOT/services/insights-bot"
  cat >"$REPO_ROOT/services/insights-bot/.env" <<BOT_EOF
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
BOT_EDITOR_PIN=${BOT_EDITOR_PIN:-842019}
BOT_WEBHOOK_SECRET=${BOT_WEBHOOK_SECRET:-igor-insights-webhook}
BOT_PORT=8787
TELEGRAM_USE_POLLING=1
TELEGRAM_PROXY_URL=${TELEGRAM_PROXY_URL:-}
SANITY_PROJECT_ID=ho7l3gwr
SANITY_DATASET=production
SANITY_WRITE_TOKEN=${SANITY_WRITE_TOKEN:-}
VITE_SITE_URL=${VITE_SITE_URL:-https://igor-broker.site}
TELEGRAM_CHANNEL_USERNAME=${TELEGRAM_CHANNEL_USERNAME:-IgorBroker}
TELEGRAM_CHANNEL_ID=${TELEGRAM_CHANNEL_ID:-}
CURSOR_API_KEY=${CURSOR_API_KEY:-}
BOT_EOF
  chmod 600 "$REPO_ROOT/services/insights-bot/.env"
fi

# Sanity CORS for custom domain (browser API + Studio on VPS).
if [ -f "$REPO_ROOT/scripts/ensure-sanity-cors.sh" ]; then
  SANITY_PROJECT_ID=ho7l3gwr VITE_SITE_URL="${VITE_SITE_URL:-https://igor-broker.site}" \
    SANITY_WRITE_TOKEN="${SANITY_WRITE_TOKEN:-}" \
    bash "$REPO_ROOT/scripts/ensure-sanity-cors.sh" || true
fi

# Старый production-only node_modules + NODE_ENV в окружении root дают «vite: not found».
rm -rf node_modules
NODE_ENV=development npm ci --no-audit --no-fund --loglevel=warn
NODE_ENV=production npm run build

# Sanity Studio → /studio/ (self-hosted on VPS)
if [ -f sanity/package.json ]; then
  cd sanity
  rm -rf node_modules
  NODE_ENV=development npm ci --no-audit --no-fund --loglevel=warn
  SANITY_STUDIO_PROJECT_ID=ho7l3gwr SANITY_STUDIO_DATASET=production \
  SANITY_STUDIO_FORMAT_API_URL=/api/bot/format \
  SANITY_STUDIO_EDITOR_PIN=${BOT_EDITOR_PIN:-842019} \
  npm run build
  mkdir -p "$REPO_ROOT/dist/studio"
  cp -a dist/. "$REPO_ROOT/dist/studio/"
  cd "$REPO_ROOT"
  echo "Sanity Studio built: $(du -sh "$REPO_ROOT/dist/studio" 2>/dev/null | cut -f1 || echo ok)"
fi

if [ ! -f "$REPO_ROOT/dist/studio/index.html" ]; then
  echo "ERROR: dist/studio/index.html missing after build"
  exit 1
fi

# Insights bot
if [ -f services/insights-bot/package.json ] && [ -f services/insights-bot/.env ]; then
  if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2 --no-audit --no-fund --loglevel=warn
  fi
  cd services/insights-bot
  rm -rf node_modules
  NODE_ENV=development npm ci --no-audit --no-fund --loglevel=warn
  npm run build
  # Сброс старого cluster-режима PM2 — иначе возможен 409 Conflict при polling
  pm2 delete igor-insights-bot 2>/dev/null || true
  pm2 start ecosystem.config.cjs --update-env
  pm2 save 2>/dev/null || true
  cd "$REPO_ROOT"
fi

# nginx по умолчанию отдаёт Welcome — подключаем собранный dist как основной сайт на :80.
# Неинтерактивный SSH часто без /usr/sbin в PATH → command -v nginx молча пропускал блок.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
if command -v nginx >/dev/null 2>&1 || [ -x /usr/sbin/nginx ]; then
  # Только conf.d — без symlink в sites-enabled (на части VPS каталог отсутствует или не каталог → ln падает).
  NGINX_SITE="/etc/nginx/conf.d/igor-broker-site.conf"
  mkdir -p "$(dirname "$NGINX_SITE")"
  if [ -n "$SITE_DOMAIN" ]; then
    NGINX_SERVER_NAME="$SITE_DOMAIN www.$SITE_DOMAIN"
  else
    NGINX_SERVER_NAME="_"
  fi
  cat >"$NGINX_SITE" <<NGINX_EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $NGINX_SERVER_NAME;
    root $REPO_ROOT/dist;
    index index.html;

    location = /robots.txt {
        try_files \$uri =404;
        add_header Cache-Control "public, max-age=86400";
    }

    location = /sitemap.xml {
        try_files \$uri =404;
        add_header Cache-Control "public, max-age=3600";
        default_type application/xml;
    }

    location = /studio {
        return 301 /studio/;
    }

    location ^~ /studio/ {
        try_files \$uri \$uri/ /studio/index.html;
    }

    # Studio requests /manifest.webmanifest at site root — serve studio manifest, not SPA index.html
    location = /manifest.webmanifest {
        alias $REPO_ROOT/dist/studio/manifest.webmanifest;
        default_type application/manifest+json;
        add_header Cache-Control "public, max-age=86400";
    }

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

    location /api/bot/ {
        proxy_pass http://127.0.0.1:8787/;
        proxy_http_version 1.1;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF
  rm -f /etc/nginx/conf.d/default.conf /etc/nginx/sites-enabled/default 2>/dev/null || true
  nginx -t
  if command -v systemctl >/dev/null 2>&1; then
    systemctl reload nginx
  else
    service nginx reload
  fi
fi

echo "Deploy build OK: $REPO_ROOT/dist"

if [ -f "$REPO_ROOT/services/insights-bot/.env" ]; then
  sleep 8
  echo "--- Bot health ---"
  curl -sf --max-time 15 "http://127.0.0.1:8787/health" || echo "health: unavailable"
  echo ""
  echo "--- Bot diag ---"
  curl -sf --max-time 60 "http://127.0.0.1:8787/diag" || echo "diag: unavailable"
  echo ""
  if command -v pm2 >/dev/null 2>&1; then
    pm2 describe igor-insights-bot 2>/dev/null || true
    echo "--- PM2 logs (last 40 lines) ---"
    pm2 logs igor-insights-bot --lines 40 --nostream 2>/dev/null || true
  fi
fi
