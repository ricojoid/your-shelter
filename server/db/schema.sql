-- Your Shelter — PostgreSQL schema (idempotent, safe to re-run)
-- Requires PostgreSQL 13+

-- ─── Boards (the "sheets" of the mading) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS boards (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{2,40}$'),
  name        text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  description text        NOT NULL DEFAULT '',
  emoji       text        NOT NULL DEFAULT '💭',
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Posts (anonymous confessions) ──────────────────────────────────────────
-- No user / IP / device columns on purpose: nothing ties a post to a person.
CREATE TABLE IF NOT EXISTS posts (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  board_id    integer     NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  body        text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  bg_color    char(7)     NOT NULL CHECK (bg_color   ~ '^#[0-9A-Fa-f]{6}$'),
  text_color  char(7)     NOT NULL CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  shape       text        NOT NULL CHECK (shape IN ('bubble', 'round', 'pebble', 'leaf', 'note')),
  is_hidden   boolean     NOT NULL DEFAULT false,   -- moderation soft-delete
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Feed query: newest visible posts of one board, paginated by id
CREATE INDEX IF NOT EXISTS posts_board_feed_idx
  ON posts (board_id, id DESC) WHERE NOT is_hidden;

-- ─── Real-time fan-out: every insert is broadcast on channel "new_post" ─────
CREATE OR REPLACE FUNCTION notify_new_post() RETURNS trigger AS $$
DECLARE
  v_slug text;
BEGIN
  SELECT b.slug INTO v_slug FROM boards b WHERE b.id = NEW.board_id;
  PERFORM pg_notify('new_post', json_build_object(
    'board', v_slug,
    'post', json_build_object(
      'id',        NEW.id,
      'body',      NEW.body,
      'bgColor',   NEW.bg_color,
      'textColor', NEW.text_color,
      'shape',     NEW.shape,
      'createdAt', NEW.created_at
    )
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_notify ON posts;
CREATE TRIGGER posts_notify
  AFTER INSERT ON posts
  FOR EACH ROW WHEN (NOT NEW.is_hidden)
  EXECUTE FUNCTION notify_new_post();

-- ─── Seed sheets ────────────────────────────────────────────────────────────
-- "School & Work" became plain "School" (its posts stay, only the label changes).
UPDATE boards SET slug = 'school' WHERE slug = 'school-work'
  AND NOT EXISTS (SELECT 1 FROM boards WHERE slug = 'school');

-- This list is the source of truth for names/order; re-running migrate applies edits.
INSERT INTO boards (slug, name, description, emoji, sort_order) VALUES
  ('general',     'General',          'Anything that is on your mind',          '💭', 1),
  ('love',        'Love & Crushes',   'Unsent letters, quiet feelings',         '💌', 2),
  ('quotes',      'Quote of the Day', 'Lines that hit different',               '✨', 3),
  ('games',       'Games',            'Rage quits, clutch wins, gaming rants',  '🎮', 4),
  ('school',      'School',           'Exams, teachers, crushes in class',      '📚', 5),
  ('family',      'Home & Family',    'The people we live with',                '🏠', 6),
  ('late-night',  '3 AM Thoughts',    'For when you cannot sleep',              '🌙', 7)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  emoji       = EXCLUDED.emoji,
  sort_order  = EXCLUDED.sort_order;
