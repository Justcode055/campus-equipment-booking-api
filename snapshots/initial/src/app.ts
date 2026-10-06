import { Hono } from 'hono';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

type Booking = { id: string; equipmentId: string; borrowerName: string; startAt: string; endAt: string; purpose: string };
const fields = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose'] as const;
class InputError extends Error {}

export function createApp(databasePath = ':memory:') {
  const db = new DatabaseSync(databasePath);
  db.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  const seed = db.prepare('INSERT OR IGNORE INTO equipment (id, name, location) VALUES (?, ?, ?)');
  seed.run('eq-1', 'Projector A', 'Building 1');
  seed.run('eq-2', 'Camera B', 'Media Lab');
  const app = new Hono();
  const get = (id: string) => db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined;

  function validate(raw: unknown, current?: Booking): Omit<Booking, 'id'> {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InputError('Body must be a JSON object');
    const input = raw as Record<string, unknown>;
    const keys = Object.keys(input);
    if (!keys.length || keys.some(k => !fields.includes(k as typeof fields[number]))) throw new InputError('Provide booking fields only; body must not be empty');
    const merged = { ...current, ...input } as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const field of fields) {
      if (typeof merged[field] !== 'string' || !(merged[field] as string).trim()) throw new InputError(`${field} must be a nonempty string`);
      result[field] = (merged[field] as string).trim();
    }
    if (result.equipmentId.length > 100 || result.borrowerName.length > 200 || result.purpose.length > 1000) throw new InputError('A text field exceeds its maximum length');
    for (const field of ['startAt', 'endAt']) {
      const time = Date.parse(result[field]);
      if (!Number.isFinite(time)) throw new InputError(`${field} must be a valid timestamp`);
      result[field] = new Date(time).toISOString();
    }
    if (result.startAt >= result.endAt) throw new InputError('startAt must be before endAt');
    if (!db.prepare('SELECT id FROM equipment WHERE id = ?').get(result.equipmentId)) throw new InputError('equipmentId does not exist');
    return result as Omit<Booking, 'id'>;
  }

  app.onError((err, c) => {
    if (err instanceof InputError || err instanceof SyntaxError) return c.json({ error: err.message }, 400);
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  });
  app.notFound(c => c.json({ error: 'Resource not found' }, 404));
  app.get('/api/equipment', c => c.json(db.prepare('SELECT * FROM equipment ORDER BY id').all()));
  app.get('/api/bookings', c => c.json(db.prepare('SELECT * FROM bookings ORDER BY startAt, id').all()));
  app.get('/api/bookings/:id', c => {
    const booking = get(c.req.param('id'));
    return booking ? c.json(booking) : c.json({ error: 'Booking not found' }, 404);
  });
  app.post('/api/bookings', async c => {
    const data = validate(await c.req.json());
    const id = randomUUID();
    if (db.prepare('SELECT id FROM bookings WHERE equipmentId = ? AND startAt < ? AND endAt > ?').get(data.equipmentId, data.endAt, data.startAt)) return c.json({ error: 'Booking time conflicts with an existing booking' }, 409);
    db.prepare('INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose) VALUES (?, ?, ?, ?, ?, ?)').run(id, data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose);
    c.header('Location', `/api/bookings/${id}`);
    return c.json(get(id)!, 201);
  });
  app.patch('/api/bookings/:id', async c => {
    const id = c.req.param('id');
    const current = get(id);
    if (!current) return c.json({ error: 'Booking not found' }, 404);
    const data = validate(await c.req.json(), current);
    db.prepare('UPDATE bookings SET equipmentId = ?, borrowerName = ?, startAt = ?, endAt = ?, purpose = ? WHERE id = ?').run(data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose, id);
    return c.json(get(id)!, 200);
  });
  app.delete('/api/bookings/:id', c => {
    const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(c.req.param('id'));
    return result.changes ? c.body(null, 204) : c.json({ error: 'Booking not found' }, 404);
  });
  return { app, db };
}
