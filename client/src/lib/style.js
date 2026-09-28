// Single source of truth for how a bubble looks. The server stores only
// { bgColor, textColor, shape }, and every surface (board, preview, export,
// shelf) renders from these tokens, so a card looks identical everywhere.

export const SHAPES = [
  { id: 'bubble', label: 'Chat', radius: '20px 20px 20px 5px', mini: '9px 9px 9px 2px', padding: '12px 16px' },
  { id: 'round', label: 'Card', radius: '14px', mini: '6px', padding: '14px 16px' },
  { id: 'pebble', label: 'Pebble', radius: '32px', mini: '14px', padding: '16px 22px' },
  { id: 'leaf', label: 'Leaf', radius: '26px 6px 26px 6px', mini: '12px 3px 12px 3px', padding: '14px 18px' },
  { id: 'note', label: 'Sticky', radius: '3px', mini: '2px', padding: '20px 16px 14px', tape: true },
];

export const SHAPE_MAP = Object.fromEntries(SHAPES.map((s) => [s.id, s]));

export const BG_SWATCHES = [
  '#FFFFFF', '#D9CCFF', '#FFD3E7', '#D6F55A', '#FFD84D',
  '#8FD4FF', '#FFB38A', '#FF7AC3', '#8B6CFF', '#16131F',
];

export const TEXT_SWATCHES = ['#16131F', '#FFFFFF', '#5B21B6', '#B4235F', '#1D4ED8', '#166534'];

export const DEFAULT_STYLE = { bgColor: '#D9CCFF', textColor: '#16131F', shape: 'bubble' };

export const MAX_LEN = 500;

/** Deterministic tilt for sticky notes so each note sits the same way on every visit. */
export function tiltFor(seed) {
  const n = Math.sin(Number(seed) * 9301 + 49297) * 233280;
  return Math.round((n - Math.floor(n) - 0.5) * 30) / 10; // -1.5deg .. 1.5deg
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
