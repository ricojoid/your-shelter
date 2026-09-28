import { SHAPE_MAP, tiltFor } from '../lib/style';
import { timeAgo } from '../lib/time';

/**
 * The one component that draws a confession. Used on the board, in the
 * composer preview, in the export card and on the shelf.
 */
export function Bubble({ post, meta, tilt = true, clamp = false, className = '' }) {
  const shape = SHAPE_MAP[post.shape] ?? SHAPE_MAP.bubble;
  const rotate = shape.tape && tilt && post.id != null ? tiltFor(post.id) : 0;
  const footer = meta === undefined && post.createdAt ? timeAgo(post.createdAt) : meta;

  return (
    <div className={`relative ${className}`} style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}>
      {shape.tape && (
        <span
          aria-hidden
          className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-[3px] border-2 border-ink/80 bg-lime/85"
        />
      )}
      <div
        className="relative border-2 border-ink shadow-(--shadow-pop)"
        style={{ background: post.bgColor, color: post.textColor, borderRadius: shape.radius, padding: shape.padding }}
      >
        <p
          className={`whitespace-pre-wrap break-words text-[14px] font-medium leading-[1.6] tracking-[-0.006em] ${
            clamp ? 'line-clamp-6' : ''
          }`}
        >
          {post.body || <span className="opacity-45">your words will show up here…</span>}
        </p>
        {footer && (
          <p className="mt-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] opacity-60">
            <span aria-hidden>✦</span>
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
