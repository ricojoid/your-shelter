import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Blobby, HeartBuddy, PaperPlane, Smiley, Sparkle } from './Doodles';

const WORDS = ['spill', 'it.'];
const CHIPS = [
  { text: 'i miss them fr', bg: '#FFD3E7', pos: 'left-[8%] top-[16%]', from: -80, r: -6 },
  { text: 'so tired lately 😮‍💨', bg: '#8FD4FF', pos: 'right-[8%] top-[20%]', from: 80, r: 5 },
  { text: 'i passed!!! 🎉', bg: '#FFD84D', pos: 'left-[12%] bottom-[18%]', from: -80, r: 4 },
  { text: 'nobody knows, but…', bg: '#D6F55A', pos: 'right-[10%] bottom-[16%]', from: 80, r: -4 },
];

const EASE = [0.76, 0, 0.24, 1];

export function Intro({ onDone }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 300 : 2300);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid cursor-pointer place-items-center overflow-hidden bg-grape text-white"
      exit={reduce ? { opacity: 0 } : { y: '-100%', borderBottomLeftRadius: '50% 12%', borderBottomRightRadius: '50% 12%', transition: { duration: 0.9, ease: EASE } }}
      onClick={onDone}
      aria-hidden
    >
      <div className="motif-on-dark pointer-events-none absolute inset-0 opacity-60" />

      {!reduce &&
        CHIPS.map((c, i) => (
          <motion.span
            key={c.text}
            className={`absolute ${c.pos} hidden rounded-[18px_18px_18px_5px] border-2 border-ink px-3.5 py-2 text-[13px] font-bold text-ink shadow-(--shadow-pop) sm:block`}
            style={{ background: c.bg }}
            initial={{ opacity: 0, x: c.from, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: c.r }}
            transition={{ delay: 0.55 + i * 0.1, type: 'spring', stiffness: 160, damping: 14 }}
          >
            {c.text}
          </motion.span>
        ))}

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 12 }}
          className="relative mb-2"
        >
          <Blobby size={110} color="#FFD84D" className="drop-shadow-[5px_5px_0_#16131F]" />
          <Sparkle size={26} color="#D6F55A" className="absolute -top-2 -right-5" />
        </motion.div>

        <h1 className="font-display flex gap-[0.22em] text-[72px] leading-[0.9] font-extrabold tracking-[-0.05em] sm:text-[120px]">
          {WORDS.map((w, i) => (
            <span key={w} className="inline-block overflow-hidden pb-[0.06em]">
              <motion.span
                className={`inline-block ${i === 1 ? 'text-lime' : ''}`}
                initial={{ y: '110%', rotate: 8 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ delay: 0.25 + i * 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="mt-4 rounded-full border-2 border-ink bg-white px-4 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink shadow-(--shadow-pop)"
          initial={{ opacity: 0, y: 16, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 220, damping: 16 }}
        >
          your shelter · no login · no names
        </motion.p>

        {!reduce && (
          <>
            <motion.div className="absolute -bottom-20 -left-16" initial={{ scale: 0 }} animate={{ scale: 1, rotate: -14 }} transition={{ delay: 1, type: 'spring' }}>
              <HeartBuddy size={54} />
            </motion.div>
            <motion.div className="absolute -right-14 -bottom-16" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 12 }} transition={{ delay: 1.1, type: 'spring' }}>
              <Smiley size={46} />
            </motion.div>
            <motion.div className="absolute -top-6 -left-20" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.9, type: 'spring' }}>
              <PaperPlane size={46} />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
