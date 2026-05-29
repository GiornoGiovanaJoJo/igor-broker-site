/**
 * Prerender SPA routes after build for crawlers and OG previews.
 * Requires: dist/ built, dist/prerender-routes.json from generate-sitemap.mjs
 */
import { spawn, execSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const distDir = join(repoRoot, 'dist');
const routesFile = join(distDir, 'prerender-routes.json');
const previewPort = Number(process.env.PRERENDER_PORT || 4173);
const previewHost = process.env.PRERENDER_HOST || '127.0.0.1';
const previewUrl = `http://${previewHost}:${previewPort}`;

function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve(undefined);
      } catch {
        /* retry */
      }
      if (Date.now() - start > timeoutMs) return reject(new Error(`Preview server not ready: ${url}`));
      setTimeout(tick, 400);
    };
    tick();
  });
}

function routeToFile(route) {
  if (route === '/') return join(distDir, 'index.html');
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  return join(distDir, clean, 'index.html');
}

function stopPreview(preview) {
  if (!preview?.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${preview.pid} /T /F`, { stdio: 'ignore' });
    } else {
      preview.kill('SIGTERM');
    }
  } catch {
    /* already stopped */
  }
}

async function main() {
  if (!existsSync(routesFile)) {
    console.warn('No prerender-routes.json — skipping prerender');
    return;
  }

  const routes = JSON.parse(readFileSync(routesFile, 'utf8'));
  if (routes.length === 0) {
    console.warn('Empty prerender routes — skipping');
    return;
  }

  const viteBin = join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const preview = spawn(process.execPath, [viteBin, 'preview', '--host', previewHost, '--port', String(previewPort), '--strictPort'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });

  let previewLog = '';
  preview.stderr?.on('data', (d) => {
    previewLog += d.toString();
  });
  preview.stdout?.on('data', (d) => {
    previewLog += d.toString();
  });

  try {
    await waitForServer(previewUrl);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const route of routes) {
      const page = await browser.newPage();
      const url = `${previewUrl}${route}`;
      console.log(`Prerender: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
      // Allow react-helmet-async and JSON-LD injection
      await page.waitForFunction(() => document.title.length > 0, { timeout: 15000 }).catch(() => {});

      const html = await page.content();
      const outFile = routeToFile(route);
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, html, 'utf8');
      await page.close();
    }

    await browser.close();
    console.log(`Prerendered ${routes.length} routes`);
  } finally {
    stopPreview(preview);
    if (previewLog.trim()) console.log(previewLog.trim());
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
