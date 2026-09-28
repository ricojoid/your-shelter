// Sliding-window limiter kept only in memory. IPs are never written to the database.
const WINDOW_MS = 60_000;
const LIMIT = Number(process.env.POSTS_PER_MINUTE) || 3;
const hits = new Map();

export function rateLimit(req, res, next) {
  const now = Date.now();
  const recent = (hits.get(req.ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= LIMIT) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: `Take a breath — you can post again in ${retryAfter}s.` });
  }

  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of hits) {
    if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(ip);
  }
}, WINDOW_MS).unref();
