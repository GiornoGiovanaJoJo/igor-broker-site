#!/usr/bin/env bash
# Idempotent: register production origins in Sanity CORS (browser + Studio).
set -euo pipefail

TOKEN="${SANITY_WRITE_TOKEN:-}"
PROJECT_ID="${SANITY_PROJECT_ID:-ho7l3gwr}"
SITE_URL="${VITE_SITE_URL:-https://igor-broker.site}"
SITE_URL="${SITE_URL%/}"

if [ -z "$TOKEN" ]; then
  echo "ensure-sanity-cors: skip (SANITY_WRITE_TOKEN not set)"
  exit 0
fi

add_origin() {
  local origin="$1"
  local code
  code="$(curl -s -o /tmp/sanity-cors.json -w '%{http_code}' \
    -X POST "https://api.sanity.io/v2021-06-07/projects/${PROJECT_ID}/cors" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"origin\":\"${origin}\",\"allowCredentials\":true}")"
  if [ "$code" = "200" ] || [ "$code" = "201" ]; then
    echo "ensure-sanity-cors: added ${origin}"
  elif [ "$code" = "409" ]; then
    echo "ensure-sanity-cors: already exists ${origin}"
  else
    echo "ensure-sanity-cors: ${origin} HTTP ${code} $(cat /tmp/sanity-cors.json 2>/dev/null || true)"
  fi
}

add_origin "$SITE_URL"
if [[ "$SITE_URL" == https://www.* ]]; then
  add_origin "${SITE_URL/https:\/\/www./https://}"
else
  add_origin "${SITE_URL/https:\/\//https://www.}"
fi
