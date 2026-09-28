import { Router } from 'express';
import { pool } from './db.js';
import { hub } from './hub.js';
import { rateLimit } from './rateLimit.js';

const SHAPES = new Set(['bubble', 'round', 'pebble', 'leaf', 'note']);
const HEX = /^#[0-9a-f]{6}$/i;
const MAX_LEN = 500;
const PAGE_SIZE = 30;

export const api = Router();

export const toPost = (row) => ({
  id: row.id,
  body: row.body,
  bgColor: row.bg_color,
  textColor: row.text_color,
  shape: row.shape,
  createdAt: row.created_at,
});

async function findBoard(slug) {
  const { rows } = await pool.query('SELECT id, slug FROM boards WHERE slug = $1', [slug]);
  return rows[0];
}

function cleanBody(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+$/gm, '') // trailing spaces per line
    .replace(/\n{4,}/g, '\n\n\n') // at most two blank lines in a row
    .trim();
}

api.get('/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

api.get('/boards', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT b.slug, b.name, b.description, b.emoji, COUNT(p.id)::int AS "postCount"
    FROM boards b
    LEFT JOIN posts p ON p.board_id = b.id AND NOT p.is_hidden
    GROUP BY b.id
    ORDER BY b.sort_order, b.id`);
  res.json(rows);
});

api.get('/boards/:slug/posts', async (req, res) => {
  const board = await findBoard(req.params.slug);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const before = Number.parseInt(req.query.before, 10);
  const params = [board.id, PAGE_SIZE + 1];
  let cursorSql = '';
  if (Number.isInteger(before) && before > 0) {
    params.push(before);
    cursorSql = 'AND id < $3';
  }

  const { rows } = await pool.query(
    `SELECT id, body, bg_color, text_color, shape, created_at
     FROM posts
     WHERE board_id = $1 AND NOT is_hidden ${cursorSql}
     ORDER BY id DESC
     LIMIT $2`,
    params,
  );

  const page = rows.slice(0, PAGE_SIZE).map(toPost);
  res.json({ posts: page, nextCursor: rows.length > PAGE_SIZE ? page.at(-1).id : null });
});

// One post per board per day, the same for everyone: hash(id + date) decides.
api.get('/boards/:slug/today', async (req, res) => {
  const board = await findBoard(req.params.slug);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const { rows } = await pool.query(
    `SELECT id, body, bg_color, text_color, shape, created_at
     FROM posts
     WHERE board_id = $1 AND NOT is_hidden
     ORDER BY md5(id::text || current_date::text)
     LIMIT 1`,
    [board.id],
  );
  res.json({ post: rows[0] ? toPost(rows[0]) : null });
});

api.post('/boards/:slug/posts', rateLimit, async (req, res) => {
  const board = await findBoard(req.params.slug);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  const { bgColor, textColor, shape } = req.body ?? {};
  const body = cleanBody(req.body?.body);

  if (!body) return res.status(400).json({ error: 'Write something first.' });
  if ([...body].length > MAX_LEN) return res.status(400).json({ error: `Keep it under ${MAX_LEN} characters.` });
  if (!HEX.test(bgColor ?? '') || !HEX.test(textColor ?? '')) return res.status(400).json({ error: 'Invalid colors.' });
  if (!SHAPES.has(shape)) return res.status(400).json({ error: 'Invalid bubble shape.' });

  const { rows } = await pool.query(
    `INSERT INTO posts (board_id, body, bg_color, text_color, shape)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, body, bg_color, text_color, shape, created_at`,
    [board.id, body, bgColor.toUpperCase(), textColor.toUpperCase(), shape],
  );

  // Other viewers receive it through the NOTIFY trigger -> SSE.
  res.status(201).json(toPost(rows[0]));
});

api.get('/boards/:slug/stream', async (req, res) => {
  const board = await findBoard(req.params.slug);
  if (!board) return res.status(404).json({ error: 'Board not found' });

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write('retry: 3000\n\n');

  hub.add(board.slug, res);
  req.on('close', () => hub.remove(board.slug, res));
});
