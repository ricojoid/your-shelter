import { useEffect, useState } from 'react';

/** Re-renders every `ms` so relative timestamps ("5m ago") stay fresh. */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
