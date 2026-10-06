import { Hono } from 'hono';
import { InputError, validateBooking, type Booking } from './validation.ts';

const app = new Hono<{ Bindings: Env }>();
const getBooking = (db: D1Database, id: string) => db.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<Booking>();

async function validate(db: D1Database, raw: unknown, current?: Booking) {
  const data = validateBooking(raw, current);
  if (!await db.prepare('SELECT id FROM equipment WHERE id = ?').bind(data.equipmentId).first()) throw new InputError('equipmentId does not exist');
  return data;
}

app.onError((err, c) => {
  if (err instanceof InputError || err instanceof SyntaxError) return c.json({ error: err.message }, 400);
  // D1 prefixes SQLite trigger errors, unlike the local Node adapter.
  if (err.message.includes('booking_overlap')) return c.json({ error: 'Booking time conflicts with an existing booking' }, 409);
  console.error(JSON.stringify({ event: 'api_error', message: err.message }));
  return c.json({ error: 'Internal server error' }, 500);
});
app.notFound(c => c.json({ error: 'Resource not found' }, 404));

app.get('/api/equipment', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM equipment ORDER BY id').all();
  return c.json(results);
});
app.get('/api/bookings', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM bookings ORDER BY startAt, id').all();
  return c.json(results);
});
app.get('/api/bookings/:id', async c => {
  const booking = await getBooking(c.env.DB, c.req.param('id'));
  return booking ? c.json(booking) : c.json({ error: 'Booking not found' }, 404);
});
app.post('/api/bookings', async c => {
  const data = await validate(c.env.DB, await c.req.json());
  const booking = { id: crypto.randomUUID(), ...data };
  await c.env.DB.prepare('INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(booking.id, data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose).run();
  c.header('Location', `/api/bookings/${booking.id}`);
  return c.json(booking, 201);
});
app.patch('/api/bookings/:id', async c => {
  const id = c.req.param('id');
  const current = await getBooking(c.env.DB, id);
  if (!current) return c.json({ error: 'Booking not found' }, 404);
  const data = await validate(c.env.DB, await c.req.json(), current);
  const result = await c.env.DB.prepare('UPDATE bookings SET equipmentId = ?, borrowerName = ?, startAt = ?, endAt = ?, purpose = ? WHERE id = ?')
    .bind(data.equipmentId, data.borrowerName, data.startAt, data.endAt, data.purpose, id).run();
  if (!result.meta.changes) return c.json({ error: 'Booking not found' }, 404);
  return c.json({ id, ...data }, 200);
});
app.delete('/api/bookings/:id', async c => {
  const result = await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(c.req.param('id')).run();
  return result.meta.changes ? c.body(null, 204) : c.json({ error: 'Booking not found' }, 404);
});

export default app;
