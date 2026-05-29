# Sanity Studio — Insights CMS

Headless CMS for `/insights` feed (`insightPost` documents with structured blocks).

## Setup

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage).
2. Copy `.env.example` from repo root → set `SANITY_STUDIO_PROJECT_ID` in `sanity/.env`:
   ```
   SANITY_STUDIO_PROJECT_ID=your_project_id
   SANITY_STUDIO_DATASET=production
   ```
3. Install and run Studio:
   ```bash
   cd sanity
   npm install
   npm run dev
   ```
4. Create a **write token** (API → Tokens) for the Telegram bot (`SANITY_WRITE_TOKEN`).

## Frontend env (Vite build)

```
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
VITE_SANITY_READ_TOKEN=   # optional, for private datasets
```

Without `VITE_SANITY_PROJECT_ID` the site uses `public/data/insights-seed.json` (5 demo posts).

## Seed import (optional)

After Studio is configured, import demo posts from the repo seed file:

```bash
cd sanity
SANITY_WRITE_TOKEN=... npm run seed
```

Images are uploaded from `../public/images/` referenced in the seed JSON.

## Deploy Studio

```bash
npm run deploy
```

Hosted Studio URL: `https://your-project.sanity.studio`
