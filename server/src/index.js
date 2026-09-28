import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { listen, pool } from './db.js';
import { hub } from './hub.js';
import { api } from './routes.js';

const app = express();
// Only trust X-Forwarded-For when a reverse proxy (nginx) sits in front — otherwise
// anyone could spoof their IP and dodge the rate limit. Set TRUST_PROXY=1 behind nginx.
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy) app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy === 'true' || trustProxy);
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));

app.use('/api', api);

// In production, serve the built client from the same origin.
const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));
if (existsSync(clientDist)) {
  // Hashed build assets never change → cache for a year. index.html is always revalidated,
  // so a new deploy shows up on the next refresh.
  app.use('/assets', express.static(`${clientDist}/assets`, { maxAge: '1y', immutable: true }));
  app.use(express.static(clientDist, { index: false, maxAge: 0 }));
  app.get('/{*path}', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile('index.html', { root: clientDist });
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

listen('new_post', ({ board, post }) => hub.broadcast(board, 'post', post));

const DB_HINTS = {
  '28P01': 'Wrong username/password in DATABASE_URL (server/.env).',
  '3D000': 'Database does not exist — create it, then run `npm run db:migrate`.',
  '42P01': 'Tables are missing — run `npm run db:migrate`.',
  ECONNREFUSED: 'PostgreSQL is not running or the host/port is wrong.',
};

pool
  .query('SELECT 1 FROM boards LIMIT 1')
  .then(() => console.log('Database OK'))
  .catch((err) => console.error(`\n  ✖ Database check failed: ${err.message}\n    ${DB_HINTS[err.code] ?? ''}\n`));

const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || '0.0.0.0';
const server = app.listen(port, host, () => console.log(`Your Shelter listening on http://${host}:${port}`));

// Graceful shutdown (PM2 reload / deploy): drop open SSE streams — browsers reconnect on their own.
function shutdown(signal) {
  console.log(`${signal} received, shutting down…`);
  server.close();
  server.closeAllConnections();
  pool.end().finally(() => process.exit(0));
  setTimeout(() => process.exit(0), 4000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
