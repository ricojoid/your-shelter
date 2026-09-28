# Your Shelter

An anonymous confession wall, like a digital *mading* (bulletin board). You don't need an account: open the page, write, and pin it. Everyone watching the same sheet sees it appear right away.

## Quick start

```bash
npm run install:all                     # installs root, server and client deps
cp server/.env.example server/.env      # then set DATABASE_URL
createdb your_shelter                   # or: CREATE DATABASE your_shelter;
npm run db:migrate                      # applies server/db/schema.sql (safe to re-run)
npm run dev                             # API on :4000, web on :5173 (proxied /api)
```

Production: `npm run build && npm start`. Express serves `client/dist` and the API from the same origin.

Deploying to the VPS (Docker, port 3030): see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Architecture

```
 Browser (React 19 + Tailwind v4 + Motion)
   │  GET  /api/boards                    list sheets + counts
   │  GET  /api/boards/:slug/posts        page of 30, ?before=<id> cursor
   │  POST /api/boards/:slug/posts        create (rate limited, validated)
   │  GET  /api/boards/:slug/stream  ◄──  Server-Sent Events: `event: post`
   ▼
 Node + Express 5 ──── pg Pool ────►  PostgreSQL
        ▲                               │ AFTER INSERT trigger
        └──── dedicated LISTEN conn ◄───┘ pg_notify('new_post', json)
```

* **Real-time:** an insert fires a trigger → `NOTIFY new_post`. Each API instance holds one `LISTEN` connection and pushes the post to the SSE clients watching that board. Because of this, horizontal scaling works without Redis. (A connection pooler in *transaction* mode, such as PgBouncer, breaks `LISTEN`. Point `DATABASE_URL` at a direct or session-mode connection.)
* **Anonymity:** the `posts` table has no user, IP or device columns. The rate limiter (`POSTS_PER_MINUTE`, default 3) lives only in process memory.
* **Validation, twice:** Express checks the length, hex colors and shape, and the same rules exist as `CHECK` constraints in Postgres.

## Database schema (`server/db/schema.sql`)

| boards        |                                   | posts        |                                            |
|---------------|-----------------------------------|--------------|--------------------------------------------|
| `id` int PK   | identity                          | `id` int PK  | identity; also the pagination cursor       |
| `slug`        | unique, `^[a-z0-9-]{2,40}$`       | `board_id`   | FK → boards, cascade                       |
| `name`        | ≤ 40 chars                        | `body`       | 1–500 chars                                |
| `description` |                                   | `bg_color`   | `#RRGGBB`                                  |
| `emoji`       |                                   | `text_color` | `#RRGGBB`                                  |
| `sort_order`  | tab order                         | `shape`      | `bubble · round · pebble · leaf · note`    |
| `created_at`  |                                   | `is_hidden`  | moderation soft-delete                     |
|               |                                   | `created_at` |                                            |

Index: `posts (board_id, id DESC) WHERE NOT is_hidden` covers the feed query.
To add a sheet, `INSERT INTO boards (slug, name, description, emoji, sort_order) …`. To hide a post, `UPDATE posts SET is_hidden = true WHERE id = …`.

### Local storage (browser only)

| key               | content                                                   |
|-------------------|-----------------------------------------------------------|
| `ys:composer:v1`  | `{ body, bgColor, textColor, shape }`: draft and style    |
| `ys:shelf:v1`     | `[{ key, post, boardName, savedAt }]`: "My Shelf" cards   |
| `ys:last-board`   | last sheet visited                                        |
| `ys:intro-seen`   | *(sessionStorage)*: the intro plays once per session      |

## Frontend map (`client/src`)

| file                         | role                                                                         |
|------------------------------|------------------------------------------------------------------------------|
| `App.jsx`                    | layout, sheet switching (direction-aware slide), URL `?sheet=`, shelf state  |
| `components/Intro.jsx`       | entry animation: words slide up, sample bubbles drift in, the panel lifts off |
| `components/BoardTabs.jsx`   | sheet tabs with a spring-animated active pill                                |
| `components/BoardView.jsx`   | header, live badge, masonry feed, infinite scroll                            |
| `components/Masonry.jsx`     | stable-column masonry: live posts slide in without reshuffling               |
| `components/Bubble.jsx`      | **the only renderer of a confession**, used everywhere                       |
| `components/Composer.jsx`    | textarea, color swatches plus custom picker, shape picker, live preview      |
| `components/Sheet.jsx`       | bottom sheet (mobile) / pop-up (desktop), swipe to close                     |
| `components/Fab.jsx`         | floating + button with spinning text ring                                    |
| `components/Hero.jsx`        | purple hero banner with illustration cluster                                 |
| `components/Doodles.jsx`     | SVG illustrations and mascots                                                |
| `components/SaveModal.jsx`   | keepsake card plus Download PNG / Save to… / Keep on shelf                   |
| `components/ShelfView.jsx`   | local-only "My Shelf" sheet                                                  |
| `hooks/useBoardFeed.js`      | fetch, SSE subscription, dedupe/merge, pagination                            |
| `lib/style.js`               | shapes, palettes, contrast check, deterministic sticky-note tilt             |

### Saving a card
* **Download image:** the modal's card node is rendered to a 3× PNG with `html-to-image`.
* **Save to…:** uses the File System Access API (`showSaveFilePicker`) so you choose the folder and file name. The button appears only in browsers that support it (Chromium desktop).
* **Keep on my shelf:** stores the post *data* (not pixels) in localStorage, and it is re-rendered through `Bubble`, so it looks identical on every visit.

## Styling guidelines

**Consistency rule:** a post is just `{ body, bgColor, textColor, shape }`. Every surface draws it with `<Bubble>` using the tokens in `lib/style.js`. The board, preview, export and shelf therefore always match, and sticky-note tilt is seeded from the post id, so a note never "moves" between visits. Fonts are self-hosted (`@fontsource`), so exported images use the same typeface as the screen.

**Look:** Gen Z neo-brutalism. Every bubble, button and sheet has a 2px ink outline and a hard offset shadow (`3px 3px 0 ink`). Pop colors sit on a warm cream wall.

**Wall background** (`.wall` in `index.css`): four soft color blobs, a repeating doodle motif (`assets/motif.svg`: sparkles, hearts, smileys, moons, squiggles) and a film-grain layer. `.motif` puts the same pattern inside cards (composer preview, exported PNG), and `.motif-on-dark` draws it in white on the purple hero.

**Illustrations** (`components/Doodles.jsx`): Blobby (a blob mascot with happy/shy/sleepy moods), HeartBuddy, SleepyMoon, Smiley, PaperPlane, Sparkle and Squiggle. Each sheet has its own mascot (`BoardMascot`).

**Typography:** Bricolage Grotesque (display: titles, hero) and Plus Jakarta Sans (UI and bubble text).
| use            | size / weight / leading            |
|----------------|------------------------------------|
| hero           | 38 → 68px · 800 · 0.95 · −0.045em  |
| sheet title    | 24 → 30px · 800 · −0.035em         |
| bubble text    | 14px · 500 · 1.6                   |
| bubble meta    | 10.5px · 700 · uppercase · +0.08em |
| labels         | 11px · 800 · uppercase · +0.12em   |

**Color tokens:** `paper #FBF6EC`, `ink #16131F`, `grape #8B6CFF`, `lilac #D9CCFF`, `bubblegum #FF7AC3`, `blush #FFD3E7`, `lime #D6F55A`, `sunny #FFD84D`, `sky #8FD4FF`, `tangerine #FF9248`.

**Motion:** springs everywhere. Bubbles pop in (scale 0.9 → 1, staggered 35ms) and tilt slightly on hover. Sheets slide in the direction of travel. The intro panel lifts off with a curved bottom edge. The + button spins in with a rotating text ring. `prefers-reduced-motion` turns all of this into fades.

**Layout:** the wall is full-screen with no sidebar. The masonry uses 2 columns on phones (≥160px each) and up to 6 on wide screens (≥250px each). Writing always starts from the floating **+** button, which opens a bottom sheet on phones (swipe the handle down to close) or a centered pop-up on larger screens.
