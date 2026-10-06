import { serve } from '@hono/node-server';
import { mkdirSync } from 'node:fs';
import { createApp } from './app.js';

mkdirSync('data', { recursive: true });
const { app, db } = createApp(process.env.DB_PATH || 'data/bookings.sqlite');
const port = Number(process.env.PORT || 8787);
const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port }, () => {
  console.log(`Campus Equipment Booking API: http://localhost:${port}/api`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
}
