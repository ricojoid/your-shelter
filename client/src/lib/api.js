async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  boards: () => request('/boards'),
  posts: (slug, before) => request(`/boards/${slug}/posts${before ? `?before=${before}` : ''}`),
  today: (slug) => request(`/boards/${slug}/today`),
  createPost: (slug, post) => request(`/boards/${slug}/posts`, { method: 'POST', body: JSON.stringify(post) }),
  streamUrl: (slug) => `/api/boards/${slug}/stream`,
};
