#!/usr/bin/env bash
# One-time: allow self-hosted Studio on VPS to authenticate against Sanity API.
# Requires: sanity login (project admin), then run from repo root.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORIGIN="${1:-${VITE_SITE_URL:-https://6e48a4f79211.vps.myjino.ru}}"
PROJECT_ID="${SANITY_STUDIO_PROJECT_ID:-ho7l3gwr}"

ORIGIN="${ORIGIN%/}"

cd "$REPO_ROOT/sanity"
echo "Adding CORS origin: $ORIGIN (credentials) for project $PROJECT_ID"
npx sanity cors add "$ORIGIN" --credentials -p "$PROJECT_ID"
echo "Done. Reload https://${ORIGIN#https://}/studio/"
