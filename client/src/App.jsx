import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BoardTabs, SHELF } from './components/BoardTabs';
import { BoardView } from './components/BoardView';
import { Composer } from './components/Composer';
import { Fab } from './components/Fab';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { SaveModal } from './components/SaveModal';
import { Sheet } from './components/Sheet';
import { ShelfView } from './components/ShelfView';
import { useBoardFeed } from './hooks/useBoardFeed';
import { usePersistentState } from './hooks/usePersistentState';
import { api } from './lib/api';
import { KEYS } from './lib/storage';

const introAlreadySeen = () => {
  try {
    return sessionStorage.getItem(KEYS.introSeen) === '1';
  } catch {
    return false;
  }
};

const rise = (delay) => ({
  hidden: { opacity: 0, y: 50 },
  shown: { opacity: 1, y: 0, transition: { delay, type: 'spring', stiffness: 140, damping: 18 } },
});

export default function App() {
  const [introDone, setIntroDone] = useState(introAlreadySeen);
  const [boards, setBoards] = useState([]);
  const [boardsError, setBoardsError] = useState('');
  const [active, setActive] = useState(() => new URLSearchParams(location.search).get('sheet'));
  const [lastBoard, setLastBoard] = usePersistentState(KEYS.lastBoard, null);
  const [shelf, setShelf] = usePersistentState(KEYS.shelf, []);
  const [view, setView] = usePersistentState(KEYS.view, 'float');
  const [composerOpen, setComposerOpen] = useState(false);
  const [saveItem, setSaveItem] = useState(null);
  const [toast, setToast] = useState('');
  const direction = useRef(1);

  const finishIntro = useCallback(() => {
    setIntroDone(true);
    try {
      sessionStorage.setItem(KEYS.introSeen, '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    api
      .boards()
      .then((list) => {
        setBoards(list);
        setActive((cur) => {
          if (cur === SHELF || list.some((b) => b.slug === cur)) return cur;
          return list.find((b) => b.slug === lastBoard)?.slug ?? list[0]?.slug ?? null;
        });
      })
      .catch((err) => setBoardsError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const board = boards.find((b) => b.slug === active);
  // On the shelf, the composer still needs a sheet to post to.
  const targetBoard = board ?? boards.find((b) => b.slug === lastBoard) ?? boards[0];
  const feed = useBoardFeed(board?.slug);

  // Keep the URL shareable: ?sheet=love opens that sheet directly.
  useEffect(() => {
    if (!active) return;
    const url = new URL(location.href);
    url.searchParams.set('sheet', active);
    history.replaceState(null, '', url);
    if (active !== SHELF) setLastBoard(active);
  }, [active, setLastBoard]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const order = useMemo(() => [...boards.map((b) => b.slug), SHELF], [boards]);
  const selectBoard = (slug) => {
    direction.current = order.indexOf(slug) >= order.indexOf(active) ? 1 : -1;
    setActive(slug);
  };

  const closeComposer = useCallback(() => setComposerOpen(false), []);
  const closeSave = useCallback(() => setSaveItem(null), []);

  const handlePosted = (post) => {
    if (targetBoard?.slug === board?.slug) feed.addPost(post);
    setBoards((list) => list.map((b) => (b.slug === targetBoard.slug ? { ...b, postCount: b.postCount + 1 } : b)));
    setComposerOpen(false);
    setToast(`pinned to ${targetBoard.name} ✦`);
    if (active === SHELF) selectBoard(targetBoard.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSave = (post, boardName) =>
    setSaveItem({ key: post.id != null ? `${active}-${post.id}` : `draft-${Date.now()}`, post, boardName });

  const keep = (item) =>
    setShelf((list) => [{ ...item, savedAt: new Date().toISOString() }, ...list.filter((i) => i.key !== item.key)]);
  const forget = (item) => setShelf((list) => list.filter((i) => i.key !== item.key));

  return (
    <>
      <div className="wall" aria-hidden />
      <AnimatePresence>{!introDone && <Intro key="intro" onDone={finishIntro} />}</AnimatePresence>

      <motion.div initial="hidden" animate={introDone ? 'shown' : 'hidden'} className="min-h-dvh">
        <motion.header variants={rise(0.05)} className="sticky top-0 z-20 bg-paper/75 backdrop-blur-xl">
          <div className="px-4 pt-3 sm:px-6 lg:px-10">
            <div className="mb-2.5 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-display text-[19px] leading-none font-extrabold tracking-[-0.04em]">
                  your shelter
                </span>
              </a>
              <span className="rotate-2 rounded-full border-2 border-ink bg-sunny px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] shadow-(--shadow-pop)">
                anon mading
              </span>
            </div>
            <BoardTabs boards={boards} active={active} shelfCount={shelf.length} onSelect={selectBoard} />
          </div>
          <div className="h-[2px] bg-ink/10" />
        </motion.header>

        <main className="px-4 pt-5 pb-32 sm:px-6 sm:pt-7 lg:px-10">
          <motion.div variants={rise(0.18)}>
            <Hero onCompose={() => setComposerOpen(true)} />
          </motion.div>

          <motion.section variants={rise(0.3)} className="min-w-0">
            {boardsError && (
              <p className="mb-4 rounded-2xl border-2 border-ink bg-blush px-4 py-3 text-[13px] font-semibold">
                can&apos;t reach the server: {boardsError}
              </p>
            )}
            <AnimatePresence mode="wait" custom={direction.current} initial={false}>
              <motion.div
                key={active ?? 'none'}
                custom={direction.current}
                variants={{
                  enter: (d) => ({ opacity: 0, x: 60 * d }),
                  center: { opacity: 1, x: 0 },
                  exit: (d) => ({ opacity: 0, x: -60 * d }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {active === SHELF ? (
                  <ShelfView items={shelf} onOpen={(item) => setSaveItem(item)} />
                ) : (
                  board && (
                    <BoardView
                      board={board}
                      feed={feed}
                      view={view}
                      onViewChange={setView}
                      onOpen={(post) => openSave(post, board.name)}
                      onCompose={() => setComposerOpen(true)}
                    />
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </main>
      </motion.div>

      <Fab visible={introDone && !saveItem} open={composerOpen} onClick={() => setComposerOpen((o) => !o)} />

      <AnimatePresence>
        {composerOpen && (
          <Sheet key="composer" onClose={closeComposer} label="Write a confession">
            <Composer
              board={targetBoard}
              onPosted={handlePosted}
              onSave={(post) => openSave(post, targetBoard?.name ?? '')}
              onClose={closeComposer}
            />
          </Sheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveItem && (
          <SaveModal
            key={saveItem.key}
            item={saveItem}
            isKept={shelf.some((i) => i.key === saveItem.key)}
            onKeep={keep}
            onForget={forget}
            onClose={closeSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.p
            role="status"
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-ink bg-lime px-4 py-2 text-[13px] font-extrabold whitespace-nowrap shadow-(--shadow-pop)"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="10" fill="#8B6CFF" stroke="#16131F" strokeWidth="2" />
      <path
        d="M9 9.5h14a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-7.5L11 24v-3.5H9A2.5 2.5 0 0 1 6.5 18v-6A2.5 2.5 0 0 1 9 9.5z"
        fill="#D6F55A"
        stroke="#16131F"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12.5" cy="15" r="1.4" fill="#16131F" />
      <circle cx="19.5" cy="15" r="1.4" fill="#16131F" />
    </svg>
  );
}
