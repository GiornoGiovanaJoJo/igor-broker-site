/**
 * Trigger bulk import on production bot (runs on VPS with proxy + Sanity token).
 * Usage: BOT_EDITOR_PIN=842019 node scripts/trigger-channel-import.mjs
 */
const baseUrl = (process.env.BOT_PUBLIC_URL || 'https://igor-broker.site/api/bot').replace(/\/$/, '');
const pin = process.env.BOT_EDITOR_PIN || '';
const limit = Number(process.env.IMPORT_LIMIT || 500);

if (!pin) {
  console.error('Set BOT_EDITOR_PIN');
  process.exit(1);
}

async function pollStatus() {
  const res = await fetch(`${baseUrl}/admin/import-channel/status`);
  return res.json();
}

async function main() {
  console.log('Starting channel import...');
  const start = await fetch(`${baseUrl}/admin/import-channel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, limit, dryRun: false }),
  });
  console.log(await start.json());

  for (let i = 0; i < 120; i += 1) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await pollStatus();
    console.log(`[${i * 5}s] running=${status.running} last=${status.last ? `${status.last.created} created` : '—'}`);
    if (!status.running && (status.last || status.error)) {
      console.log(JSON.stringify(status, null, 2));
      break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
