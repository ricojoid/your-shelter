import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Bubble } from './Bubble';
import { BoardMascot, Blobby, PaperPlane, Sparkle } from './Doodles';
import { FloatField } from './FloatField';
import { Masonry } from './Masonry';
import { QuoteOfTheDay } from './QuoteOfTheDay';
import { useNow } from '../hooks/useNow';

export function BoardView({ board, feed, view, onViewChange, onOpen, onCompose }) {
  useNow(60_000);
  const sentinel = useRef(null);
  const { posts, status, error, live, cursor, loadMore } = feed;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor || view !== 'wall') return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, loadMore, view]);

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-center gap-3 sm:mb-7 sm:gap-4">
        <motion.div
          key={board.slug}
          initial={{ rotate: -20, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          className="shrink-0"
        >
          <BoardMascot slug={board.slug} size={52} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display truncate text-[24px] leading-tight font-extrabold tracking-[-0.035em] sm:text-[30px]">
            {board.name} <span className="text-[0.8em]">{board.emoji}</span>
          </h2>
          <p className="truncate text-[13px] font-medium text-muted">{board.description}</p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
          <ViewToggle view={view} onChange={onViewChange} />
          <LiveBadge live={live} />
        </div>
      </header>

      {board.slug === 'quotes' && (
        <QuoteOfTheDay slug={board.slug} hasPosts={posts.length > 0} onOpen={onOpen} onCompose={onCompose} />
      )}

      {status === 'loading' && <Skeleton />}
      {status === 'error' && (
        <Empty mood="sleepy" title="oops, couldn't load this sheet" body={error} />
      )}
      {status === 'ready' && posts.length === 0 && (
        <Empty
          title="it's quiet here…"
          body="be the first to pin something. nobody will know it was you ✌️"
          action={{ label: '+ spill the first one', onClick: onCompose }}
        />
      )}

      {posts.length > 0 && view === 'float' && <FloatField posts={posts} onOpen={onOpen} />}

      {posts.length > 0 && view === 'wall' && (
        <Masonry
          items={posts}
          resetKey={board.slug}
          renderItem={(post, index) => (
            <motion.button
              key={post.id}
              type="button"
              layout="position"
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: Math.min(index, 12) * 0.035 }}
              whileHover={{ y: -4, rotate: index % 2 ? 0.8 : -0.8 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpen(post)}
              className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              aria-label="Open confession"
            >
              {/* idle bob, desynced per card */}
              <div className="animate-bob" style={{ animationDelay: `${-((post.id * 0.73) % 6)}s` }}>
                <Bubble post={post} />
              </div>
            </motion.button>
          )}
        />
      )}

      <div ref={sentinel} className="h-px" />
      {cursor && view === 'wall' && <p className="py-8 text-center text-[12px] font-semibold text-muted">loading older notes…</p>}
    </div>
  );
}

function ViewToggle({ view, onChange }) {
  const options = [
    { id: 'float', label: '🫧 float' },
    { id: 'wall', label: '▦ wall' },
  ];
  return (
    <div role="radiogroup" aria-label="Layout" className="relative flex rounded-full border-2 border-ink bg-white p-0.5 shadow-(--shadow-pop)">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={view === o.id}
          onClick={() => onChange(o.id)}
          className={`relative h-7 rounded-full px-3 text-[12px] font-extrabold transition-colors ${
            view === o.id ? 'text-ink' : 'text-ink/50 hover:text-ink'
          }`}
        >
          {view === o.id && (
            <motion.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-lime" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function LiveBadge({ live }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-(--shadow-pop)">
      <span className="relative flex size-2">
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-live/70" />}
        <span className={`relative size-2 rounded-full ${live ? 'bg-live' : 'bg-ink/30'}`} />
      </span>
      {live ? 'live' : '…'}
    </span>
  );
}

function Empty({ title, body, action, mood = 'shy' }) {
  return (
    <div className="relative grid place-items-center overflow-hidden rounded-[28px] border-2 border-dashed border-ink/25 bg-white/50 px-6 py-14 text-center backdrop-blur-sm">
      <div className="relative">
        <Blobby size={110} mood={mood} className="animate-floaty" />
        <Sparkle size={22} className="absolute -top-1 -right-4" />
        <PaperPlane size={34} className="absolute -bottom-1 -left-9 -rotate-12" />
      </div>
      <p className="font-display mt-4 text-[22px] font-extrabold tracking-[-0.03em]">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] text-muted">{body}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 h-10 rounded-full border-2 border-ink bg-lime px-5 text-[13px] font-extrabold shadow-(--shadow-pop) transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
      {[88, 132, 72, 110, 96, 140, 80, 120, 100, 90].map((h, i) => (
        <div key={i} className="animate-pulse rounded-[20px] border-2 border-ink/10 bg-white/60" style={{ height: h }} />
      ))}
    </div>
  );
}
