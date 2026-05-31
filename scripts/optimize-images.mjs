/**
 * Converts PNG images in public/images to WebP (quality 82).
 * Run: node scripts/optimize-images.mjs
 */
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesRoot = join(__dirname, '..', 'public', 'images');

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    const { execSync } = await import('node:child_process');
    execSync('npm install --no-save sharp@0.33.5', { cwd: join(__dirname, '..'), stdio: 'inherit' });
    return (await import('sharp')).default;
  }
}

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (/\.(png|jpe?g)$/i.test(name)) files.push(full);
  }
  return files;
}

async function main() {
  const sharp = await loadSharp();
  const files = walk(imagesRoot);
  let converted = 0;

  for (const file of files) {
    const out = join(dirname(file), `${basename(file, extname(file))}.webp`);
    await sharp(file)
      .webp({ quality: 82, effort: 4 })
      .toFile(out);
    converted += 1;
    const { size: rawSize } = statSync(file);
    const { size: webpSize } = statSync(out);
    console.log(`${file.replace(imagesRoot, '')} → ${Math.round(rawSize / 1024)}KB → ${Math.round(webpSize / 1024)}KB webp`);
  }

  console.log(`Done: ${converted} WebP files in public/images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
