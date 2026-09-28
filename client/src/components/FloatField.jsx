import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Bubble } from './Bubble';

export const MAX_FLOATING = 24;

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Free-floating wall: cards drift around, bounce off the edges and gently push
 * each other apart. Hover pauses a card, drag moves it, flick throws it, tap opens it.
 * Positions live in refs and are written straight to `transform` every frame,
 * so React never re-renders during the animation.
 */
export function FloatField({ posts, onOpen }) {
  const reduce = useReducedMotion();
  const fieldRef = useRef(null);
  const size = useRef({ w: 0, h: 0 });
  const nodes = useRef(new Map()); // id -> element
  const bodies = useRef(new Map()); // id -> physics state
  const seeded = useRef(false);
  const zTop = useRef(1);
  const [cardW, setCardW] = useState(220);
  const [capacity, setCapacity] = useState(MAX_FLOATING);

  const visible = posts.slice(0, capacity);

  useLayoutEffect(() => {
    const el = fieldRef.current;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      size.current = { w: width, h: height };
      const w = width < 640 ? 158 : 230;
      setCardW(w);
      // Roughly as many cards as fit without constant crowding (≈10 on a phone).
      setCapacity(Math.max(8, Math.min(MAX_FLOATING, Math.floor((width * height) / (w * 130)))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Create physics bodies for new posts, drop bodies of posts that left.
  useLayoutEffect(() => {
    // Read the field directly: on first mount the ResizeObserver hasn't reported yet.
    const w = fieldRef.current.clientWidth;
    const h = fieldRef.current.clientHeight;
    size.current = { w, h };
    const ids = new Set(visible.map((p) => p.id));
    for (const id of bodies.current.keys()) if (!ids.has(id)) bodies.current.delete(id);

    visible.forEach((post) => {
      if (bodies.current.has(post.id)) return;
      const angle = rand(0, Math.PI * 2);
      const cruise = rand(12, 26); // px per second
      const fresh = seeded.current; // arrived live → burst out of the middle
      const burst = fresh ? 9 : 1;
      bodies.current.set(post.id, {
        x: fresh ? w / 2 - cardW / 2 : rand(0, Math.max(0, w - cardW)),
        y: fresh ? h / 2 - 60 : rand(0, Math.max(0, h - 140)),
        vx: Math.cos(angle) * cruise * burst,
        vy: Math.sin(angle) * cruise * burst,
        cruise,
        phase: rand(0, Math.PI * 2),
        hover: false,
        held: false,
        k: 1, // 1 = moving, 0 = paused
      });
    });
    if (visible.length) seeded.current = true;
  }, [visible, cardW]);

  // Animation loop.
  useEffect(() => {
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { w: W, h: H } = size.current;
      const list = [];
      for (const [id, b] of bodies.current) {
        const el = nodes.current.get(id);
        if (!el) continue;
        b.w = el.offsetWidth;
        b.h = el.offsetHeight;
        list.push([b, el]);
      }

      // Soft separation so cards don't pile up on each other.
      if (!reduce) {
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i][0];
            const c = list[j][0];
            const dx = c.x + c.w / 2 - (a.x + a.w / 2);
            const dy = c.y + c.h / 2 - (a.y + a.h / 2);
            const ox = (a.w + c.w) / 2 - Math.abs(dx);
            const oy = (a.h + c.h) / 2 - Math.abs(dy);
            if (ox <= 0 || oy <= 0) continue;
            const push = 40 * dt;
            if (ox < oy) {
              const s = Math.sign(dx) || 1;
              a.vx -= s * push;
              c.vx += s * push;
            } else {
              const s = Math.sign(dy) || 1;
              a.vy -= s * push;
              c.vy += s * push;
            }
          }
        }
      }

      const t = now / 1000;
      for (const [b, el] of list) {
        if (!b.held) {
          b.k += ((b.hover || reduce ? 0 : 1) - b.k) * Math.min(1, dt * 6);
          b.x += b.vx * dt * b.k;
          b.y += b.vy * dt * b.k;

          // Ease speed back to cruising (a thrown card slows down, a nudged one recovers).
          const speed = Math.hypot(b.vx, b.vy) || 1;
          const f = 1 + (b.cruise / speed - 1) * Math.min(1, dt * 1.2);
          b.vx *= f;
          b.vy *= f;
        }

        const maxX = Math.max(0, W - b.w);
        const maxY = Math.max(0, H - b.h);
        if (b.x < 0) (b.x = 0), (b.vx = Math.abs(b.vx));
        if (b.x > maxX) (b.x = maxX), (b.vx = -Math.abs(b.vx));
        if (b.y < 0) (b.y = 0), (b.vy = Math.abs(b.vy));
        if (b.y > maxY) (b.y = maxY), (b.vy = -Math.abs(b.vy));

        const wobble = reduce ? 0 : Math.sin(t * 0.8 + b.phase) * 2.5 * b.k;
        const lift = b.held ? 1.06 : 1 + (1 - b.k) * 0.03;
        el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${wobble}deg) scale(${lift})`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  // ── pointer handling: hover pause, drag, throw, tap-to-open ─────────────────
  const drag = useRef(null);

  const bringToFront = (el) => {
    zTop.current += 1;
    el.style.zIndex = String(zTop.current);
  };

  const onPointerDown = (e, post) => {
    const b = bodies.current.get(post.id);
    const el = nodes.current.get(post.id);
    if (!b || !el || e.button > 0) return;
    el.setPointerCapture(e.pointerId);
    bringToFront(el);
    b.held = true;
    drag.current = {
      id: post.id,
      startX: e.clientX,
      startY: e.clientY,
      originX: b.x,
      originY: b.y,
      moved: 0,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: performance.now(),
      vx: 0,
      vy: 0,
    };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const b = bodies.current.get(d.id);
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));
    b.x = d.originX + dx;
    b.y = d.originY + dy;

    const now = performance.now();
    const dt = Math.max(1, now - d.lastT) / 1000;
    d.vx = d.vx * 0.6 + ((e.clientX - d.lastX) / dt) * 0.4;
    d.vy = d.vy * 0.6 + ((e.clientY - d.lastY) / dt) * 0.4;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.lastT = now;
  };

  const release = (e, post, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== post.id) return;
    drag.current = null;
    const b = bodies.current.get(post.id);
    if (!b) return;
    b.held = false;
    if (!cancelled && d.moved < 6) {
      b.hover = false;
      onOpen(post);
      return;
    }
    const stale = performance.now() - d.lastT > 80; // held still before letting go → no throw
    b.vx = stale ? b.vx : clamp(d.vx, -700, 700);
    b.vy = stale ? b.vy : clamp(d.vy, -700, 700);
  };

  const setHover = (e, id, value) => {
    if (e.pointerType !== 'mouse') return;
    const b = bodies.current.get(id);
    if (b) b.hover = value;
    if (value) bringToFront(nodes.current.get(id));
  };

  return (
    <div>
      <div
        ref={fieldRef}
        className="relative h-[max(520px,calc(100dvh-190px))] overflow-hidden rounded-[28px] border-2 border-dashed border-ink/20 bg-white/25"
      >
        {visible.map((post) => (
          <div
            key={post.id}
            ref={(el) => (el ? nodes.current.set(post.id, el) : nodes.current.delete(post.id))}
            role="button"
            tabIndex={0}
            aria-label="Open confession"
            onPointerDown={(e) => onPointerDown(e, post)}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => release(e, post)}
            onPointerCancel={(e) => release(e, post, true)}
            onPointerEnter={(e) => setHover(e, post.id, true)}
            onPointerLeave={(e) => setHover(e, post.id, false)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(post))}
            className="absolute top-0 left-0 cursor-grab touch-pan-y select-none will-change-transform active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            style={{ width: cardW, transform: 'translate3d(-9999px,0,0)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            >
              <Bubble post={post} clamp />
            </motion.div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11.5px] font-semibold text-muted">
        drag &amp; fling them around · hover to pause · tap to read
        {posts.length > capacity && ` · showing the latest ${capacity}, switch to wall for all`}
      </p>
    </div>
  );
}
