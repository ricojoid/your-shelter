import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

const merge = (a, b) => {
  const byId = new Map();
  for (const p of [...a, ...b]) byId.set(p.id, p);
  return [...byId.values()].sort((x, y) => y.id - x.id);
};

const EMPTY = { posts: [], cursor: null, status: 'idle', error: null, live: false };

/** Loads a board's posts and keeps them live over Server-Sent Events. */
export function useBoardFeed(slug) {
  const [state, setState] = useState(EMPTY);
  const loadingMore = useRef(false);

  useEffect(() => {
    if (!slug) {
      setState(EMPTY);
      return;
    }
    let cancelled = false;
    setState({ ...EMPTY, status: 'loading' });

    api
      .posts(slug)
      .then((data) => {
        if (cancelled) return;
        // Merge rather than replace: SSE may have delivered posts before this resolved.
        setState((s) => ({ ...s, posts: merge(s.posts, data.posts), cursor: data.nextCursor, status: 'ready' }));
      })
      .catch((err) => !cancelled && setState((s) => ({ ...s, status: 'error', error: err.message })));

    const es = new EventSource(api.streamUrl(slug));
    es.onopen = () => setState((s) => ({ ...s, live: true }));
    es.onerror = () => setState((s) => ({ ...s, live: false })); // EventSource retries on its own
    es.addEventListener('post', (e) => {
      const post = JSON.parse(e.data);
      setState((s) => ({ ...s, posts: merge([post], s.posts) }));
    });

    return () => {
      cancelled = true;
      es.close();
    };
  }, [slug]);

  const addPost = useCallback((post) => setState((s) => ({ ...s, posts: merge([post], s.posts) })), []);

  const loadMore = useCallback(async () => {
    if (!slug || !state.cursor || loadingMore.current) return;
    loadingMore.current = true;
    try {
      const data = await api.posts(slug, state.cursor);
      setState((s) => ({ ...s, posts: merge(s.posts, data.posts), cursor: data.nextCursor }));
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      loadingMore.current = false;
    }
  }, [slug, state.cursor]);

  return { ...state, addPost, loadMore };
}
