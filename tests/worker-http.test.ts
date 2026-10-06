import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

// Run against `npm run cf:dev` after applying the local D1 migration.
// This test intentionally targets localhost only and deletes only its own rows.
const base = 'http://127.0.0.1:8789/api';
const ids = new Set<string>();
const output = [`# Local Cloudflare Worker HTTP evidence\n\nRecorded: ${new Date().toISOString()}\n\nBase URL: ${base}\n\nClient: Node fetch; runtime: Wrangler/workerd; storage: local D1 simulation. Agent-run checks, not a remote deployment.\n`];
let count = 0;
async function request(label: string, method: string, path: string, expected: number, body?: unknown) {
  const response = await fetch(base + path, { method, headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  output.push(`## ${++count}. ${label}\n\n${method} ${base + path}\n\nRequest body: ${body === undefined ? '(none)' : JSON.stringify(body)}\n\nExpected: ${expected}; observed: ${response.status}\n\n\`\`\`json\n${text || '(empty body)'}\n\`\`\`\n`);
  const parsed = text ? JSON.parse(text) : undefined;
  if (response.status === 201 && parsed?.id) ids.add(parsed.id);
  assert.equal(response.status, expected, label);
  if (expected === 204) assert.equal(text, '');
  else assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  if (expected >= 400) { assert.deepEqual(Object.keys(parsed), ['error']); assert.equal(typeof parsed.error, 'string'); }
  if (expected === 201) assert.equal(response.headers.get('location'), `/api/bookings/${parsed.id}`);
  return parsed;
}
const payload = { equipmentId: 'eq-1', borrowerName: "O'Brien'); DROP TABLE equipment; --", purpose: `Worker test ${randomUUID()}`, startAt: '2030-10-20T09:00:00.000Z', endAt: '2030-10-20T11:00:00.000Z' };
try {
  assert.equal((await request('Equipment seeds', 'GET', '/equipment', 200)).length, 2);
  assert.ok(Array.isArray(await request('Booking collection', 'GET', '/bookings', 200)));
  const first = await request('Create and safely store SQL-looking text', 'POST', '/bookings', 201, payload);
  assert.deepEqual(first, { id: first.id, ...payload });
  assert.deepEqual(await request('Read one', 'GET', `/bookings/${first.id}`, 200), first);
  await request('Overlap create mapped from D1 trigger', 'POST', '/bookings', 409, { ...payload, startAt: '2030-10-20T10:00:00.000Z' });
  const adjacent = await request('Adjacent interval', 'POST', '/bookings', 201, { ...payload, startAt: payload.endAt, endAt: '2030-10-20T12:00:00.000Z' });
  await request('Overlapping PATCH', 'PATCH', `/bookings/${adjacent.id}`, 409, { startAt: '2030-10-20T10:00:00.000Z' });
  assert.deepEqual(await request('Failed PATCH is unchanged', 'GET', `/bookings/${adjacent.id}`, 200), adjacent);
  const partial = await request('Self-excluding partial PATCH', 'PATCH', `/bookings/${first.id}`, 200, { purpose: 'Updated purpose' });
  assert.equal(partial.purpose, 'Updated purpose');
  assert.equal(partial.startAt, first.startAt);
  const full = await request('Move booking time with full PATCH', 'PATCH', `/bookings/${first.id}`, 200, { ...payload, startAt: '2030-10-20T12:00:00Z', endAt: '2030-10-20T14:00:00Z' });
  assert.equal(full.startAt, '2030-10-20T12:00:00.000Z');
  await request('Contained overlap after time change', 'POST', '/bookings', 409, { ...payload, startAt: '2030-10-20T12:30:00Z', endAt: '2030-10-20T13:30:00Z' });
  await request('Invalid equipment', 'POST', '/bookings', 400, { ...payload, equipmentId: 'eq-missing' });
  await request('Reversed times', 'POST', '/bookings', 400, { ...payload, startAt: payload.endAt, endAt: payload.startAt });
  await request('Impossible calendar date', 'POST', '/bookings', 400, { ...payload, startAt: '2030-02-30T09:00:00Z', endAt: '2030-03-03T11:00:00Z' });
  await request('Missing fields', 'POST', '/bookings', 400, {});
  await request('Missing GET', 'GET', '/bookings/missing', 404);
  await request('Missing PATCH', 'PATCH', '/bookings/missing', 404, { purpose: 'Test' });
  await request('Missing DELETE', 'DELETE', '/bookings/missing', 404);
  await request('Unknown route JSON', 'GET', '/unknown', 404);
  await request('Different equipment same interval', 'POST', '/bookings', 201, { ...payload, equipmentId: 'eq-2', startAt: full.startAt, endAt: full.endAt });
  const competingBody = { ...payload, startAt: '2030-10-21T09:00:00Z', endAt: '2030-10-21T11:00:00Z' };
  const competing = await Promise.all([1, 2].map(async () => {
    const response = await fetch(`${base}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(competingBody) });
    const body = await response.json() as { id?: string; error?: string };
    if (response.status === 201 && body.id) ids.add(body.id);
    return { status: response.status, body };
  }));
  output.push(`## Concurrent creates\n\nRequest: POST ${base}/bookings\n\n${JSON.stringify(competingBody)}\n\nExpected one 201 and one 409:\n\n\`\`\`json\n${JSON.stringify(competing, null, 2)}\n\`\`\`\n`);
  assert.deepEqual(competing.map(r => r.status).sort(), [201, 409]);
  await request('Delete', 'DELETE', `/bookings/${first.id}`, 204);
  await request('Deleted booking missing', 'GET', `/bookings/${first.id}`, 404);
  ids.delete(first.id);
  output.push(`PASS: ${count} sequential HTTP cases and competing creates.\n`);
  console.log(`PASS: ${count} Worker HTTP cases and competing creates.`);
} catch (error) {
  output.push(`FAIL: ${String(error)}\n`);
  throw error;
} finally {
  for (const id of ids) {
    const response = await fetch(`${base}/bookings/${id}`, { method: 'DELETE' });
    output.push(`Cleanup own test booking ${id}: ${response.status}\n`);
  }
  mkdirSync('evidence', { recursive: true });
  writeFileSync('evidence/WORKER_LOCAL_TEST_RESULTS.md', output.join('\n'));
}
