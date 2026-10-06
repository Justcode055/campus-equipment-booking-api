import { Hono } from 'hono';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { InputError, validateBooking, type Booking } from './validation.ts';

export function createApp(databasePath = ':memory:') {
  const db = new DatabaseSync(databasePath);
  db.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  db.exec('PRAGMA busy_timeout = 5000');
  const seed = db.prepare('INSERT OR IGNORE INTO equipment (id, name, location) VALUES (?, ?, ?)');
  seed.run('eq-1', 'Projector A', 'Building 1');
  seed.run('eq-2', 'Camera B', 'Media Lab');
  const app = new Hono();
  const get = (id: string) => db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined;

  function validate(raw: unknown, current?: Booking): Omit<Booking, 'id'> {
    const result = validateBooking(raw, current);
    if (!db.prepare('SELECT id FROM equipment WHERE id = ?').get(result.equipmentId)) throw new InputError('equipmentId does not exist');
    return result as Omit<Booking, 'id'>;
  }

  app.onError((err, c) => {
    if (err instanceof InputError || err instanceof SyntaxError) return c.json({ error: err.message }, 400);
    if (err.message === 'booking_overlap') return c.json({ error: 'Booking time conflicts with an existing booking' }, 409);
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
