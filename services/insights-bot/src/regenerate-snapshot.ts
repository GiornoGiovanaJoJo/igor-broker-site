import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Rebuilds dist/data/insights-snapshot.json (+ sitemap) so new bot posts appear on the site
 * without a full redeploy.
 */
export async function regenerateInsightsSnapshot(): Promise<void> {
  const script = resolve(repoRoot, 'scripts/generate-sitemap.mjs');
  const distDir = resolve(repoRoot, 'dist');

  if (!existsSync(script)) {
    throw new Error(`Snapshot script not found: ${script}`);
  }
  if (!existsSync(distDir)) {
    throw new Error(`dist/ missing — run site build before publishing insights`);
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
      reject(new Error(`insights snapshot regen failed (exit ${code}): ${stderr.slice(-800)}`));
    });
  });
}
