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

echo "Deploy build OK: $REPO_ROOT/dist"
