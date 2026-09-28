import { motion } from 'motion/react';

const RING_TEXT = 'spill it ✦ stay anon ✦ spill it ✦ stay anon ✦ ';

/** Floating "+" with a slowly spinning text ring. Opens the composer. */
export function Fab({ open, onClick, visible }) {
  return (
    <motion.div
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 sm:right-8 sm:bottom-8"
      initial={{ scale: 0, rotate: -90 }}
      animate={visible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: visible ? 0.6 : 0 }}
    >
      <div className="relative grid size-[92px] place-items-center">
        <svg viewBox="0 0 100 100" className="animate-spin-slow pointer-events-none absolute inset-0" aria-hidden>
          <defs>
            <path id="fab-ring" d="M50 50m-40 0a40 40 0 1 1 80 0a40 40 0 1 1-80 0" />
          </defs>
          <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#16131F" strokeWidth="2" />
          <text className="fill-ink text-[8px] font-extrabold uppercase">
            <textPath href="#fab-ring" textLength="249" lengthAdjust="spacing">{RING_TEXT}</textPath>
          </text>
        </svg>
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={open ? 'Close composer' : 'Write a confession'}
          aria-expanded={open}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: open ? 45 : 0 }}
          className="relative grid size-[60px] place-items-center rounded-full border-2 border-ink bg-bubblegum text-white shadow-(--shadow-pop)"
        >
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
            <path d="M13 3v20M3 13h20" stroke="#16131F" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M13 3v20M3 13h20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
