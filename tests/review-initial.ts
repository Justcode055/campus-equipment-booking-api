import { serve } from '@hono/node-server';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createApp } from '../snapshots/initial/src/app.ts';

const { app, db } = createApp();
const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 8789 });
const base = 'http://localhost:8789/api';
const post = async (data: object) => fetch(`${base}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
const payload = { equipmentId: 'eq-1', borrowerName: 'Review', purpose: 'Initial regression probe', startAt: '2026-10-20T09:00:00.000Z', endAt: '2026-10-20T11:00:00.000Z' };
try {
  const first = await (await post(payload)).json() as { id: string };
  const second = await (await post({ ...payload, startAt: '2026-10-20T11:00:00.000Z', endAt: '2026-10-20T12:00:00.000Z' })).json() as { id: string };
  const patch = await fetch(`${base}/bookings/${second.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startAt: '2026-10-20T10:00:00.000Z' }) });
  const date = await post({ ...payload, equipmentId: 'eq-2', startAt: '2026-02-30T09:00:00.000Z', endAt: '2026-03-03T11:00:00.000Z' });
  let direct = 'accepted';
  try {
    db.prepare('INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose) VALUES (?, ?, ?, ?, ?, ?)').run('probe', 'eq-1', 'Review', payload.startAt, payload.endAt, 'Direct competing writer probe');
  } catch { direct = 'rejected'; }
  const output = `# Initial review probes\n\nRecorded: ${new Date().toISOString()}\n\nBase URL: ${base}\n\nPreserved initial implementation in snapshots/initial; these are actual observed shortcomings, not passing results.\n\n| Probe | Expected final behavior | Initial observation |\n| --- | --- | --- |\n| PATCH second booking into first interval (${first.id}) | 409 | ${patch.status}: ${await patch.text()} |\n| POST February 30 | 400 | ${date.status}: ${await date.text()} |\n| Independent SQL write into reserved slot | Rejected by database | ${direct} |\n`;
  mkdirSync('evidence', { recursive: true });
  writeFileSync('evidence/INITIAL_REVIEW.md', output);
  console.log(output);
} finally {
  await new Promise<void>(resolve => server.close(() => resolve()));
  db.close();
}
