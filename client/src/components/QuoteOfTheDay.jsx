import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { QuoteBuddy, Sparkle } from './Doodles';

/** Today's featured quote — same pick for everyone, changes daily (server decides). */
export function QuoteOfTheDay({ slug, hasPosts, onOpen, onCompose }) {
  const [state, setState] = useState({ status: 'loading', post: null });

  useEffect(() => {
    let cancelled = false;
    api
      .today(slug)
      .then((d) => !cancelled && setState({ status: 'ready', post: d.post }))
      .catch(() => !cancelled && setState({ status: 'error', post: null }));
    return () => {
      cancelled = true;
    };
    // Re-check once the sheet gets its first post.
  }, [slug, hasPosts]);

  if (state.status === 'loading' || state.status === 'error') return null;

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
  const { post } = state;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="relative mb-6 overflow-hidden rounded-[28px] border-2 border-ink bg-sunny px-5 py-6 shadow-(--shadow-pop-lg) sm:mb-8 sm:px-8 sm:py-8"
    >
      <div aria-hidden className="motif-on-dark pointer-events-none absolute inset-0 opacity-50" />
      <span aria-hidden className="font-display pointer-events-none absolute -top-10 -left-2 text-[180px] leading-none font-extrabold text-ink/10 select-none">
        “
      </span>
      <Sparkle size={24} color="#FF7AC3" className="absolute top-5 right-6 animate-floaty" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <QuoteBuddy size={72} className="shrink-0 -rotate-6" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em]">
            <span className="rounded-full border-2 border-ink bg-white px-2.5 py-0.5">✦ quote of the day</span>
            <span className="text-ink/60">{today}</span>
          </p>

          {post ? (
            <button type="button" onClick={() => onOpen(post)} className="mt-3 block w-full text-left">
              <p className="font-display line-clamp-5 text-[20px] leading-[1.3] font-bold tracking-[-0.02em] break-words whitespace-pre-wrap sm:text-[26px]">
                “{post.body}”
              </p>
              <p className="mt-3 text-[12px] font-bold text-ink/60">— someone, anonymously · tap to save</p>
            </button>
          ) : (
            <div className="mt-3">
              <p className="font-display text-[20px] leading-[1.3] font-bold tracking-[-0.02em] sm:text-[24px]">
                no quote yet today… be the one who drops it.
              </p>
              <button
                type="button"
                onClick={onCompose}
                className="mt-4 h-10 rounded-full border-2 border-ink bg-white px-5 text-[13px] font-extrabold shadow-(--shadow-pop) transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
              >
                + drop a quote
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
