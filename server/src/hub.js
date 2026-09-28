// In-memory registry of open SSE connections, grouped by board slug.
const channels = new Map();

export const hub = {
  add(slug, res) {
    if (!channels.has(slug)) channels.set(slug, new Set());
    channels.get(slug).add(res);
  },

  remove(slug, res) {
    const set = channels.get(slug);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) channels.delete(slug);
  },

  broadcast(slug, event, data) {
    const set = channels.get(slug);
    if (!set) return;
    const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of set) res.write(frame);
  },
};

// Comment frames keep proxies from closing idle connections.
setInterval(() => {
  for (const set of channels.values()) {
    for (const res of set) res.write(': ping\n\n');
  }
}, 25_000).unref();
