import assert from 'node:assert/strict';
import { serve } from '@hono/node-server';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.ts';

mkdirSync('evidence', { recursive: true });
const databasePath = `evidence/verification-${randomUUID()}.sqlite`;
const { app, db } = createApp(databasePath);
const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 8788 });
const base = 'http://localhost:8788/api';
const evidence: string[] = [`# HTTP test evidence\n\nRecorded: ${new Date().toISOString()}\n\nBase API URL: ${base}\n\nClient: Node fetch over real HTTP to Hono's Node server. Fresh temporary SQLite database; assertions check status codes, JSON, and side effects. Run: npm test.\n`];
let passed = 0;

async function request(label: string, method: string, path: string, expected: number, body?: unknown, raw = false) {
  const sent = body === undefined ? undefined : raw ? String(body) : JSON.stringify(body);
  const response = await fetch(base + path, { method, headers: sent === undefined ? {} : { 'Content-Type': 'application/json' }, body: sent });
  const text = await response.text();
  evidence.push(`## ${++passed}. ${label}\n\nRequest: \`${method} ${base + path}\`\n\n${sent === undefined ? '' : '```json\n' + sent + '\n```\n\n'}Expected status: ${expected}; observed: ${response.status}.\n\n\`Content-Type: ${response.headers.get('content-type') ?? '(absent)'}\`\n\n${text ? '```json\n' + text + '\n```' : '(empty body)'}\n`);
  assert.equal(response.status, expected, label);
  if (expected === 204) { assert.equal(text, ''); return undefined; }
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  const parsed = JSON.parse(text);
  if (expected >= 400) { assert.deepEqual(Object.keys(parsed), ['error']); assert.equal(typeof parsed.error, 'string'); assert.ok(parsed.error.length); }
  if (expected === 201) assert.equal(response.headers.get('location'), `/api/bookings/${parsed.id}`);
  return parsed;
}

const payload = { equipmentId: 'eq-1', borrowerName: 'Somchai Jaidee', startAt: '2026-10-20T09:00:00.000Z', endAt: '2026-10-20T11:00:00.000Z', purpose: 'Class presentation' };
try {
  if (!server.listening) await once(server, 'listening');
  const equipment = await request('Seed equipment', 'GET', '/equipment', 200);
  assert.equal(equipment.length, 2);
  assert.deepEqual(await request('Initially empty', 'GET', '/bookings', 200), []);
  const first = await request('Create booking', 'POST', '/bookings', 201, payload);
  assert.equal(typeof first.id, 'string');
  assert.deepEqual(first, { id: first.id, ...payload });
  assert.deepEqual(await request('Read one', 'GET', `/bookings/${first.id}`, 200), first);
  const all = await request('Read list', 'GET', '/bookings', 200);
  assert.equal(all.length, 1);
  await request('Overlap create', 'POST', '/bookings', 409, { ...payload, startAt: '2026-10-20T10:00:00.000Z' });
  await request('Contained interval', 'POST', '/bookings', 409, { ...payload, startAt: '2026-10-20T09:30:00.000Z', endAt: '2026-10-20T10:30:00.000Z' });
  await request('Containing interval', 'POST', '/bookings', 409, { ...payload, startAt: '2026-10-20T08:00:00.000Z', endAt: '2026-10-20T12:00:00.000Z' });
  await request('Identical interval', 'POST', '/bookings', 409, payload);
  const adjacent = await request('Touching end allowed', 'POST', '/bookings', 201, { ...payload, startAt: payload.endAt, endAt: '2026-10-20T12:00:00.000Z' });
  const before = await request('Touching start allowed', 'POST', '/bookings', 201, { ...payload, startAt: '2026-10-20T08:00:00Z', endAt: '2026-10-20T09:00:00Z' });
  assert.equal(before.endAt, payload.startAt);
  const other = await request('Same time different equipment', 'POST', '/bookings', 201, { ...payload, equipmentId: 'eq-2' });
  await request('Overlap PATCH', 'PATCH', `/bookings/${adjacent.id}`, 409, { startAt: '2026-10-20T10:00:00.000Z' });
  assert.deepEqual(await request('Failed PATCH leaves row intact', 'GET', `/bookings/${adjacent.id}`, 200), adjacent);
  await request('Equipment change conflict', 'PATCH', `/bookings/${other.id}`, 409, { equipmentId: 'eq-1' });
  const updated = await request('Partial PATCH excludes self', 'PATCH', `/bookings/${first.id}`, 200, { purpose: 'Updated presentation' });
  assert.equal(updated.purpose, 'Updated presentation');
  assert.equal(updated.startAt, first.startAt);
  await request('Unknown equipment create', 'POST', '/bookings', 400, { ...payload, equipmentId: 'eq-missing' });
  await request('Unknown equipment PATCH', 'PATCH', `/bookings/${first.id}`, 400, { equipmentId: 'eq-missing' });
  await request('Reversed interval', 'POST', '/bookings', 400, { ...payload, startAt: payload.endAt, endAt: payload.startAt });
  await request('Equal times', 'POST', '/bookings', 400, { ...payload, endAt: payload.startAt });
  await request('Missing fields', 'POST', '/bookings', 400, { equipmentId: 'eq-1' });
  await request('Empty borrower', 'POST', '/bookings', 400, { ...payload, borrowerName: '   ' });
  await request('Wrong type', 'POST', '/bookings', 400, { ...payload, purpose: 42 });
  await request('Unknown field', 'POST', '/bookings', 400, { ...payload, id: 'user-id' });
  await request('Empty PATCH', 'PATCH', `/bookings/${first.id}`, 400, {});
  await request('Invalid merged PATCH interval', 'PATCH', `/bookings/${first.id}`, 400, { startAt: payload.endAt });
  await request('Impossible date', 'POST', '/bookings', 400, { ...payload, startAt: '2026-02-30T09:00:00.000Z', endAt: '2026-03-03T11:00:00.000Z' });
  await request('Timezone required', 'POST', '/bookings', 400, { ...payload, startAt: '2026-10-20T09:00:00' });
  await request('Malformed JSON', 'POST', '/bookings', 400, '{', true);
  await request('Array body', 'POST', '/bookings', 400, []);
  await request('Null body', 'POST', '/bookings', 400, null);
  await request('Length bound', 'POST', '/bookings', 400, { ...payload, purpose: 'x'.repeat(1001) });
  await request('Read not found', 'GET', '/bookings/missing', 404);
  await request('PATCH not found', 'PATCH', '/bookings/missing', 404, { purpose: 'test' });
  await request('DELETE not found', 'DELETE', '/bookings/missing', 404);
  await request('Unknown route', 'GET', '/missing', 404);
  const injection = "Robert'); DROP TABLE equipment; --";
  const escaped = await request('SQL-looking text safely stored', 'POST', '/bookings', 201, { ...payload, startAt: '2026-10-21T09:00:00Z', endAt: '2026-10-21T11:00:00Z', borrowerName: injection });
  assert.equal(escaped.borrowerName, injection);
  assert.equal((await request('Equipment survives text input', 'GET', '/equipment', 200)).length, 2);
  await request('Delete existing', 'DELETE', `/bookings/${first.id}`, 204);
  await request('Deleted row absent', 'GET', `/bookings/${first.id}`, 404);
  await request('Deleted slot reusable', 'POST', '/bookings', 201, payload);
  const competingPayload = { ...payload, startAt: '2026-10-22T09:00:00Z', endAt: '2026-10-22T11:00:00Z' };
  const competing = await Promise.all([1, 2].map(() => fetch(`${base}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(competingPayload) })));
  const results = await Promise.all(competing.map(async response => ({ status: response.status, body: await response.json() })));
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
  evidence.push(`## Competing HTTP creates\n\nPOST ${base}/bookings twice concurrently with ${JSON.stringify(competingPayload)}.\n\nExpected one 201 and one 409; observed:\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n`);
  const secondDb = new DatabaseSync(databasePath);
  try {
    assert.equal(secondDb.prepare('SELECT borrowerName FROM bookings WHERE id = ?').get(escaped.id)?.borrowerName, injection);
    assert.throws(() => secondDb.prepare('INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose) VALUES (?, ?, ?, ?, ?, ?)').run('direct', 'eq-1', 'Second connection', payload.startAt, payload.endAt, 'Conflict'), /booking_overlap/);
    assert.throws(() => secondDb.prepare('UPDATE bookings SET startAt = ? WHERE id = ?').run('2026-10-20T10:00:00.000Z', adjacent.id), /booking_overlap/);
    evidence.push('## Separate SQLite connection\n\nPersisted SQL-looking text read back unchanged. INSERT and UPDATE into an occupied interval both threw `booking_overlap`; rejected statements did not commit. Assertions passed.\n');
  } finally { secondDb.close(); }
  evidence.push(`Result: PASS — ${passed} sequential HTTP cases, competing HTTP writes, and separate-connection database checks.\n`);
  console.log(`PASS: ${passed} HTTP cases, concurrent requests, persistence and database constraints.`);
} catch (error) {
  evidence.push(`Result: FAIL — ${String(error)}\n`);
  throw error;
} finally {
  writeFileSync('evidence/HTTP_TEST_RESULTS.md', evidence.join('\n'));
  await new Promise<void>(resolve => server.close(() => resolve()));
  db.close();
  unlinkSync(databasePath);
}
