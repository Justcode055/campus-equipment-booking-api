import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

// Explicit live verification for this submission. Deletes only its own rows.
const base = 'https://campus-equipment-api.6731503055.workers.dev/api';
const runId = randomUUID();
const ids = new Set<string>();
const evidence = [`# Live Cloudflare API verification\n\nRecorded: ${new Date().toISOString()}\n\nBase API URL: ${base}\n\nClient: Node fetch over HTTPS. Run by Codex at the student's explicit request; these are agent-run remote checks, not student-run commands. Run ID: ${runId}.\n`];
let count = 0;
let failed = false;

async function request(label: string, method: string, path: string, expected: number, body?: unknown) {
  const response = await fetch(base + path, { method, headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : undefined;
  if (response.status === 201 && typeof parsed?.id === 'string') ids.add(parsed.id);
  evidence.push(`## ${++count}. ${label}\n\nRequest: ${method} ${base + path}\n\nRequest body: ${body === undefined ? '(none)' : JSON.stringify(body)}\n\nExpected status: ${expected}; observed: ${response.status}\n\nContent-Type: ${response.headers.get('content-type') ?? '(absent)'}\nLocation: ${response.headers.get('location') ?? '(absent)'}\n\n\`\`\`json\n${text || '(empty body)'}\n\`\`\`\n`);
  assert.equal(response.status, expected, label);
  if (expected === 204) assert.equal(text, '');
  else assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  if (expected >= 400) { assert.deepEqual(Object.keys(parsed), ['error']); assert.equal(typeof parsed.error, 'string'); }
  if (expected === 201) assert.equal(response.headers.get('location'), `/api/bookings/${parsed.id}`);
  return parsed;
}

try {
  const equipment = await request('Read seeded equipment', 'GET', '/equipment', 200);
  assert.ok(equipment.some((e: { id: string }) => e.id === 'eq-1'));
  assert.ok(equipment.some((e: { id: string }) => e.id === 'eq-2'));
  const existing = await request('Read booking collection before tests', 'GET', '/bookings', 200) as Array<{ equipmentId: string; startAt: string; endAt: string }>;
  assert.ok(Array.isArray(existing));
  // Find a free day using the collection instead of changing existing bookings.
  let day = Date.UTC(2030, 9, 20);
  for (let tries = 0; ; tries++, day += 86400000) {
    assert.ok(tries < 3650, 'Find a free verification day');
    const start = day + 9 * 3600000;
    const end = day + 16 * 3600000;
    if (!existing.some(b => ['eq-1', 'eq-2'].includes(b.equipmentId) && Date.parse(b.startAt) < end && Date.parse(b.endAt) > start)) break;
  }
  const time = (hour: number, minute = 0) => new Date(day + hour * 3600000 + minute * 60000).toISOString();
  const payload = { equipmentId: 'eq-1', borrowerName: 'Codex live verification', purpose: `Quality Gate ${runId}`, startAt: time(9), endAt: time(11) };
  const first = await request('Create booking', 'POST', '/bookings', 201, payload);
  assert.deepEqual(first, { id: first.id, ...payload });
  assert.deepEqual(await request('Read created booking', 'GET', `/bookings/${first.id}`, 200), first);
  const adjacent = await request('Adjacent booking allowed', 'POST', '/bookings', 201, { ...payload, startAt: time(11), endAt: time(12) });
  const moved = await request('Update booking times', 'PATCH', `/bookings/${first.id}`, 200, { ...payload, startAt: time(12), endAt: time(14), purpose: `Updated Quality Gate ${runId}` });
  assert.equal(moved.startAt, time(12));
  assert.equal(moved.endAt, time(14));
  assert.equal(moved.id, first.id);
  assert.deepEqual(await request('Updated values persisted', 'GET', `/bookings/${first.id}`, 200), moved);
  await request('Contained overlapping create rejected', 'POST', '/bookings', 409, { ...payload, startAt: time(12, 30), endAt: time(13, 30) });
  await request('Overlapping update rejected', 'PATCH', `/bookings/${adjacent.id}`, 409, { startAt: time(12, 30), endAt: time(13, 30) });
  assert.deepEqual(await request('Failed update leaves data unchanged', 'GET', `/bookings/${adjacent.id}`, 200), adjacent);
  const partial = await request('Purpose-only update excludes self', 'PATCH', `/bookings/${first.id}`, 200, { purpose: `Partial Quality Gate ${runId}` });
  assert.equal(partial.startAt, moved.startAt);
  assert.equal(partial.purpose, `Partial Quality Gate ${runId}`);
  await request('Reversed interval rejected', 'POST', '/bookings', 400, { ...payload, startAt: time(11), endAt: time(9) });
  await request('Unknown equipment rejected', 'POST', '/bookings', 400, { ...payload, equipmentId: 'eq-missing' });
  await request('Impossible date rejected', 'POST', '/bookings', 400, { ...payload, startAt: '2030-02-30T09:00:00.000Z', endAt: '2030-03-03T11:00:00.000Z' });
  await request('Missing fields rejected', 'POST', '/bookings', 400, {});
  const missingId = `missing-${runId}`;
  await request('Missing booking', 'GET', `/bookings/${missingId}`, 404);
  await request('Missing update', 'PATCH', `/bookings/${missingId}`, 404, { purpose: 'Test' });
  await request('Same time different equipment allowed', 'POST', '/bookings', 201, { ...payload, equipmentId: 'eq-2', startAt: time(12), endAt: time(14) });
  await request('Delete existing booking', 'DELETE', `/bookings/${first.id}`, 204);
  ids.delete(first.id);
  await request('Deleted booking not found', 'GET', `/bookings/${first.id}`, 404);
  evidence.push(`PASS: ${count} live HTTP cases, with status, JSON, field, Location, and failed-update assertions.\n`);
  console.log(`PASS: ${count} live Cloudflare API cases.`);
} catch (error) {
  failed = true;
  evidence.push(`FAIL: ${String(error)}\n`);
  console.error(error);
} finally {
  for (const id of ids) {
    try {
      const response = await fetch(`${base}/bookings/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(20000) });
      evidence.push(`Cleanup own booking ${id}: ${response.status}\n`);
      if (response.status !== 204 && response.status !== 404) { failed = true; evidence.push('Cleanup failed.\n'); }
    } catch (error) { failed = true; evidence.push(`Cleanup ${id} failed: ${String(error)}\n`); }
  }
  evidence.push(failed ? 'Final result: FAIL.\n' : 'Final result: PASS. All test-created bookings were removed; pre-existing bookings were not changed.\n');
  mkdirSync('evidence', { recursive: true });
  writeFileSync('evidence/CLOUDFLARE_LIVE_TEST_RESULTS.md', evidence.join('\n'));
  if (failed) process.exitCode = 1;
}
