import { useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = readJSON(key, undefined);
    if (stored === undefined) return initial;
    // Merge so new fields added to `initial` later still get defaults.
    return isPlainObject(initial) && isPlainObject(stored) ? { ...initial, ...stored } : stored;
  });

  useEffect(() => writeJSON(key, value), [key, value]);

  return [value, setValue];
}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
