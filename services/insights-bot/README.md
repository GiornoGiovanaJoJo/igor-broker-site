# Insights Telegram Bot

Editor bot for creating `/insights` posts with PIN auth, text normalizer, Sanity publish, and optional Cursor AI.

## Env

Copy repo `.env.example` → `services/insights-bot/.env`:

```
TELEGRAM_BOT_TOKEN=
BOT_EDITOR_PIN=
BOT_WEBHOOK_SECRET=random-secret
BOT_PORT=8787
BOT_PUBLIC_URL=https://your-domain.com/api/bot

SANITY_PROJECT_ID=
SANITY_DATASET=production
SANITY_WRITE_TOKEN=

CURSOR_API_KEY=
```

## Development

```bash
cd services/insights-bot
npm install
npm run dev
```

Without `BOT_PUBLIC_URL` the bot runs in **polling** mode (local dev).

## Production (PM2)

```bash
npm ci
npm run build
pm2 start ecosystem.config.cjs
```

Nginx proxies `/api/bot/` → `localhost:8787` (see `deploy/nginx.example.conf`).

## Flow

1. `/start` → PIN
2. «Создать пост» → category → title → excerpt → body → cover photo
3. Preview with formatted line breaks
4. «Опубликовать» / «Черновик» / «Улучшить текст (Cursor)»
