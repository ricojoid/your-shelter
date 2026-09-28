import { motion } from 'motion/react';
import { Blobby, HeartBuddy, PaperPlane, Smiley, Sparkle, Squiggle } from './Doodles';

const CHIPS = [
  { text: 'ugh. mondays 🙄', bg: '#FFD3E7', r: -6, x: 'left-[2%] top-[8%]', delay: 0.1 },
  { text: 'i think i like them 🫣', bg: '#D6F55A', r: 4, x: 'right-[0%] top-[0%]', delay: 0.2 },
  { text: "i'm fine (i'm not)", bg: '#8FD4FF', r: -3, x: 'left-[8%] bottom-[4%]', delay: 0.3 },
];

export function Hero({ onCompose }) {
  return (
    <section className="relative mb-6 overflow-hidden rounded-[28px] border-2 border-ink bg-grape px-5 py-6 text-white shadow-(--shadow-pop-lg) sm:mb-8 sm:px-8 sm:py-9 lg:px-12">
      {/* backdrop decorations */}
      <div aria-hidden className="motif-on-dark pointer-events-none absolute inset-0 opacity-70" />
      <Sparkle size={22} className="absolute top-4 right-[42%] hidden animate-floaty sm:block" />
      <Squiggle width={80} color="#D6F55A" className="absolute bottom-5 left-[38%] hidden md:block" />

      <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <span className="inline-flex -rotate-2 items-center gap-1.5 rounded-full border-2 border-ink bg-lime px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink shadow-(--shadow-pop)">
            <span className="size-1.5 rounded-full bg-ink" /> 100% anon · no login
          </span>
          <h2 className="font-display mt-4 text-[38px] leading-[0.95] font-extrabold tracking-[-0.045em] sm:text-[56px] lg:text-[68px]">
            spill it.
            <br />
            <span className="relative inline-block text-lime">
              nobody knows
              <Squiggle width={140} color="#FF7AC3" className="absolute -bottom-3 left-0 w-full" />
            </span>{' '}
            it&apos;s you.
          </h2>
          <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-white/85 sm:text-[14.5px]">
            A shared wall for the stuff you can&apos;t say out loud. Pick a sheet, write it, style your bubble, pin it.
          </p>
          <button
            type="button"
            onClick={onCompose}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-white px-5 text-[13.5px] font-extrabold text-ink shadow-(--shadow-pop) transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-(--shadow-pop-lg) active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span className="text-[18px] leading-none">+</span> write a confession
          </button>
        </div>

        {/* illustration cluster */}
        <div aria-hidden className="relative mx-auto hidden h-[260px] w-full max-w-[420px] sm:block">
          {CHIPS.map((c) => (
            <motion.span
              key={c.text}
              className={`absolute ${c.x} rounded-[18px_18px_18px_5px] border-2 border-ink px-3.5 py-2 text-[12.5px] font-bold text-ink shadow-(--shadow-pop)`}
              style={{ background: c.bg, rotate: c.r }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + c.delay, type: 'spring', stiffness: 260, damping: 14 }}
            >
              {c.text}
            </motion.span>
          ))}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 160, damping: 12 }}
          >
            <Blobby size={150} color="#FFD84D" className="drop-shadow-[5px_5px_0_#16131F]" />
          </motion.div>
          <HeartBuddy size={58} className="absolute right-[6%] bottom-[10%] animate-floaty [--r:10deg]" />
          <Smiley size={44} className="absolute top-[38%] left-[0%] animate-floaty [--r:-12deg] [animation-delay:-2s]" />
          <PaperPlane size={50} className="absolute top-[30%] right-[2%] animate-floaty [animation-delay:-1s]" />
          <Sparkle size={30} color="#FF7AC3" className="absolute top-[18%] left-[34%]" />
          <Sparkle size={20} color="#D6F55A" className="absolute right-[30%] bottom-[2%]" />
        </div>
      </div>
    </section>
  );
}
