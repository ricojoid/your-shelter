// Hand-drawn style illustrations. Bold ink outline + flat pop colors,
// matching the neo-brutal bubbles.
const INK = '#16131F';

export function Blobby({ size = 120, color = '#D9CCFF', mood = 'happy', className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M62 10c25 1 44 17 47 41 3 25-10 49-38 55-27 6-54-6-60-32C5 48 30 9 62 10z"
        fill={color}
        stroke={INK}
        strokeWidth="3.5"
      />
      {/* shine */}
      <path d="M34 34c4-7 11-11 18-12" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      {/* cheeks */}
      <ellipse cx="38" cy="70" rx="7" ry="4.5" fill="#FF7AC3" opacity=".55" />
      <ellipse cx="84" cy="70" rx="7" ry="4.5" fill="#FF7AC3" opacity=".55" />
      {mood === 'sleepy' ? (
        <>
          <path d="M42 58c3 3 8 3 11 0M69 58c3 3 8 3 11 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M56 76c3 2 7 2 10 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : mood === 'shy' ? (
        <>
          <path d="M42 60l10-3M80 60l-10-3" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M53 76q8 6 16 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="47" cy="58" r="5.5" fill={INK} />
          <circle cx="75" cy="58" r="5.5" fill={INK} />
          <circle cx="49" cy="56" r="1.8" fill="#fff" />
          <circle cx="77" cy="56" r="1.8" fill="#fff" />
          <path d="M50 73q11 12 22 0" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="#FF7AC3" />
        </>
      )}
    </svg>
  );
}

export function Sparkle({ size = 28, color = '#FFD84D', className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden {...props}>
      <path
        d="M16 2c1.6 7.5 5.5 11.8 13 13.2v1.6C21.5 18.2 17.6 22.5 16 30h-.1c-1.6-7.5-5.5-11.8-13-13.2v-1.6C10.4 13.8 14.3 9.5 15.9 2H16z"
        fill={color}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartBuddy({ size = 64, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M32 56S6 41 6 22C6 12 14 6 22 7c5 .5 8 3.5 10 7 2-3.5 5-6.5 10-7 8-1 16 5 16 15 0 19-26 34-26 34z"
        fill="#FF7AC3"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="27" r="3" fill={INK} />
      <circle cx="40" cy="27" r="3" fill={INK} />
      <path d="M27 35q5 5 10 0" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M14 18c1.5-3 4-5 7-5.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

export function Smiley({ size = 56, color = '#D6F55A', className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className} aria-hidden {...props}>
      <circle cx="28" cy="28" r="24" fill={color} stroke={INK} strokeWidth="3" />
      <path d="M20 22v4M36 22v4" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M17 33q11 11 22 0" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SleepyMoon({ size = 64, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden {...props}>
      <path d="M40 6a26 26 0 1 0 18 38A22 22 0 0 1 40 6z" fill="#FFD84D" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 34c2 2 5 2 7 0M34 38c2 2 5 2 7 0" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 8h7l-7 8h7" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PaperPlane({ size = 56, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className} aria-hidden {...props}>
      <path d="M4 26L52 6 40 50 26 36 4 26z" fill="#8FD4FF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 36l26-30M26 36l-2 14 8-8" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Squiggle({ width = 90, color = INK, className = '', ...props }) {
  return (
    <svg width={width} height={width * 0.18} viewBox="0 0 100 18" fill="none" className={className} aria-hidden {...props}>
      <path d="M2 9c8-10 16 10 24 0s16 10 24 0 16 10 24 0 16 10 24 0" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function QuoteBuddy({ size = 64, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M10 8h44a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H30l-12 10v-10h-8a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z"
        fill="#D9CCFF"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M17 20c-3 2-4 5-4 9h6v-6h-3c0-1.5.7-2.5 2-3.3zM30 20c-3 2-4 5-4 9h6v-6h-3c0-1.5.7-2.5 2-3.3z" fill={INK} />
      <circle cx="42" cy="24" r="2.2" fill={INK} />
      <circle cx="50" cy="24" r="2.2" fill={INK} />
      <path d="M42 31q4 4 8 0" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M56 2l1.4 3.6L61 7l-3.6 1.4L56 12l-1.4-3.6L51 7l3.6-1.4z" fill="#FFD84D" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function GamePad({ size = 64, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden {...props}>
      <path
        d="M18 18h28c8 0 13 6 14 15l1 9c.7 6-6 9-10 5l-6-6H19l-6 6c-4 4-10.7 1-10-5l1-9c1-9 6-15 14-15z"
        fill="#8FD4FF"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M18 26v10M13 31h10" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="44" cy="27" r="3" fill="#FF7AC3" stroke={INK} strokeWidth="2" />
      <circle cx="50" cy="33" r="3" fill="#D6F55A" stroke={INK} strokeWidth="2" />
      <path d="M28 25c1.5 1.5 3.5 1.5 5 0M31 32q2 2 4 0" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M30 18c0-5 2-8 6-10" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function BookBuddy({ size = 64, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden {...props}>
      <path d="M32 14C24 8 14 8 6 10v40c8-2 18-2 26 4 8-6 18-6 26-4V10c-8-2-18-2-26 4z" fill="#FFD84D" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 14v40" stroke={INK} strokeWidth="3" />
      <circle cx="18" cy="28" r="2.4" fill={INK} />
      <circle cx="46" cy="28" r="2.4" fill={INK} />
      <path d="M15 36q3 3 6 0M43 36q3 3 6 0" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M50 2l8 8-24 24-10 2 2-10z" fill="#FF7AC3" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M46 6l8 8" stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}

/** Illustration shown per sheet in the board header. */
export function BoardMascot({ slug, size = 56 }) {
  switch (slug) {
    case 'love':
      return <HeartBuddy size={size} />;
    case 'quotes':
      return <QuoteBuddy size={size} />;
    case 'games':
      return <GamePad size={size} />;
    case 'school':
      return <BookBuddy size={size} />;
    case 'late-night':
      return <SleepyMoon size={size} />;
    case 'family':
      return <Smiley size={size} color="#FFD84D" />;
    default:
      return <Blobby size={size} />;
  }
}
