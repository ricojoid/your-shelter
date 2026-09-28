import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Bubble } from './Bubble';
import { Blobby, Sparkle } from './Doodles';
import { usePersistentState } from '../hooks/usePersistentState';
import { api } from '../lib/api';
import { KEYS } from '../lib/storage';
import { BG_SWATCHES, DEFAULT_STYLE, MAX_LEN, SHAPES, TEXT_SWATCHES, contrastRatio } from '../lib/style';

export function Composer({ board, onPosted, onSave, onClose }) {
  // Draft + chosen style survive reloads, so the card looks exactly as the user left it.
  const [draft, setDraft] = usePersistentState(KEYS.composer, { body: '', ...DEFAULT_STYLE });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const textRef = useRef(null);

  useEffect(() => {
    // Focus after the sheet finishes sliding in (avoids a jump on mobile keyboards).
    const t = setTimeout(() => textRef.current?.focus({ preventScroll: true }), 350);
    return () => clearTimeout(t);
  }, []);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const length = [...draft.body].length;
  const lowContrast = contrastRatio(draft.bgColor, draft.textColor) < 3;
  const canPost = draft.body.trim().length > 0 && length <= MAX_LEN && status.state !== 'sending' && board;

  async function submit(e) {
    e.preventDefault();
    if (!canPost) return;
    setStatus({ state: 'sending', message: '' });
    try {
      const post = await api.createPost(board.slug, {
        body: draft.body,
        bgColor: draft.bgColor,
        textColor: draft.textColor,
        shape: draft.shape,
      });
      set({ body: '' });
      setStatus({ state: 'idle', message: '' });
      onPosted(post);
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  }

  const preview = { body: draft.body.trim(), bgColor: draft.bgColor, textColor: draft.textColor, shape: draft.shape };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Blobby size={44} mood="shy" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[22px] leading-none font-extrabold tracking-[-0.035em]">spill the tea ☕</h2>
          <p className="mt-1 truncate text-[12.5px] font-medium text-muted">
            pinning to <span className="font-bold text-ink">{board ? `${board.emoji} ${board.name}` : '…'}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-white text-[14px] font-bold transition hover:rotate-90"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Live preview on the same motif as the wall */}
      <div className="motif relative grid min-h-36 place-items-center overflow-hidden rounded-[22px] border-2 border-ink px-5 py-7">
        <Sparkle size={18} className="absolute top-3 right-4" />
        <span className="absolute top-3 left-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/50">preview</span>
        <motion.div layout className="w-full max-w-[300px]">
          <Bubble post={preview} meta={null} tilt={false} />
        </motion.div>
      </div>

      <div>
        <label htmlFor="confession" className="sr-only">
          Your confession
        </label>
        <textarea
          ref={textRef}
          id="confession"
          value={draft.body}
          onChange={(e) => set({ body: e.target.value })}
          onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && submit(e)}
          maxLength={MAX_LEN}
          rows={3}
          placeholder="what's been living in your head rent-free?"
          className="max-h-48 min-h-24 w-full resize-none rounded-[18px] border-2 border-ink bg-white px-4 py-3 text-[14px] leading-[1.6] outline-none transition placeholder:text-muted/70 focus:shadow-(--shadow-pop)"
        />
        <div className="mt-1 flex justify-between px-1 text-[11px] font-semibold text-muted">
          <span>no account · no name · no trace</span>
          <span className={`tabular-nums ${length > MAX_LEN - 50 ? 'text-bubblegum' : ''}`}>
            {length}/{MAX_LEN}
          </span>
        </div>
      </div>

      <Field label="bubble color">
        <Swatches colors={BG_SWATCHES} value={draft.bgColor} onChange={(bgColor) => set({ bgColor })} />
      </Field>

      <Field label="text color">
        <Swatches colors={TEXT_SWATCHES} value={draft.textColor} onChange={(textColor) => set({ textColor })} />
      </Field>
      {lowContrast && (
        <p className="-mt-2 rounded-xl bg-sunny/40 px-3 py-2 text-[11.5px] font-semibold">
          ⚠️ hard to read — try a darker or lighter text color
        </p>
      )}

      <Field label="shape">
        <div className="grid grid-cols-5 gap-1.5">
          {SHAPES.map((s) => {
            const active = s.id === draft.shape;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => set({ shape: s.id })}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-2 text-[10.5px] font-bold transition ${
                  active ? 'border-ink bg-ink text-white shadow-(--shadow-pop)' : 'border-ink/15 bg-white hover:border-ink'
                }`}
              >
                <span
                  className="h-4 w-6 border-[1.5px]"
                  style={{
                    borderRadius: s.mini,
                    background: active ? draft.bgColor : 'transparent',
                    borderColor: active ? '#fff' : 'currentColor',
                  }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      </Field>

      {status.message && (
        <p role="alert" className="rounded-xl bg-bubblegum/20 px-3 py-2 text-center text-[12px] font-semibold text-[#9d174d]">
          {status.message}
        </p>
      )}

      <div className="sticky bottom-0 -mx-5 flex gap-2 bg-white px-5 pt-2 pb-1 sm:static sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => onSave({ ...preview, createdAt: new Date().toISOString() })}
          disabled={!preview.body}
          className="h-12 rounded-full border-2 border-ink bg-white px-4 text-[13px] font-bold transition hover:bg-lilac disabled:opacity-40"
        >
          save card
        </button>
        <button
          type="submit"
          disabled={!canPost}
          className="h-12 flex-1 rounded-full border-2 border-ink bg-lime text-[14px] font-extrabold shadow-(--shadow-pop) transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
        >
          {status.state === 'sending' ? 'pinning…' : 'pin it anonymously ✦'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/55">{label}</p>
      {children}
    </div>
  );
}

function Swatches({ colors, value, onChange }) {
  const current = value.toUpperCase();
  const isCustom = !colors.includes(current);
  const ring = 'ring-2 ring-ink ring-offset-2 ring-offset-white scale-110';
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c}
          aria-pressed={current === c}
          className={`size-8 rounded-full border-2 border-ink transition hover:scale-110 ${current === c ? ring : ''}`}
          style={{ background: c }}
        />
      ))}
      <label
        className={`relative size-8 cursor-pointer overflow-hidden rounded-full border-2 border-ink transition hover:scale-110 ${
          isCustom ? ring : ''
        }`}
        style={{
          background: isCustom ? value : 'conic-gradient(#ff7ac3, #ffd84d, #d6f55a, #8fd4ff, #8b6cff, #ff7ac3)',
        }}
        title="Custom color"
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Custom color"
        />
      </label>
    </div>
  );
}
