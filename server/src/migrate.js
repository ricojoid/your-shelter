import { readFile } from 'node:fs/promises';
import pg from 'pg';

const url = new URL(process.env.DATABASE_URL ?? '');
const dbName = decodeURIComponent(url.pathname.slice(1));

// Create the database first if it doesn't exist (connects to the default "postgres" db).
async function ensureDatabase() {
  const adminUrl = new URL(url);
  adminUrl.pathname = '/postgres';
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName.replaceAll('"', '""')}"`);
      console.log(`Database "${dbName}" created.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } finally {
    await admin.end();
  }
}

try {
  await ensureDatabase();
  const sql = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Schema applied.');
} catch (err) {
  console.error('Migration failed:', err.message);
  if (err.code === '28P01') console.error('→ Wrong username/password in DATABASE_URL (server/.env).');
  process.exitCode = 1;
}
