import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Rebuilds snapshot, sitemap, RSS and static SEO HTML for Insights routes.
 */
export async function regenerateInsightsSnapshot(): Promise<void> {
  const distDir = resolve(repoRoot, 'dist');
  if (!existsSync(distDir)) {
    throw new Error(`dist/ missing — run site build before publishing insights`);
  }

  await runScript(resolve(repoRoot, 'scripts/generate-sitemap.mjs'));
  await runScript(resolve(repoRoot, 'scripts/prerender-seo.mjs'));
}

async function runScript(script: string): Promise<void> {
  if (!existsSync(script)) {
    throw new Error(`Script not found: ${script}`);
  }

  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: repoRoot,
      env: {
        ...process.env,
        VITE_SITE_URL: process.env.VITE_SITE_URL || 'https://igor-broker.site',
        VITE_SANITY_PROJECT_ID: env.sanityProjectId,
        VITE_SANITY_DATASET: env.sanityDataset,
        VITE_SANITY_API_VERSION: '2024-01-01',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`${script} failed (exit ${code}): ${stderr.slice(-800)}`));
    });
  });
}
