import { motion } from 'motion/react';
import { Bubble } from './Bubble';
import { Blobby, Sparkle } from './Doodles';
import { Masonry } from './Masonry';
import { formatDate } from '../lib/time';

export function ShelfView({ items, onOpen }) {
  return (
    <div>
      <header className="mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
        <Blobby size={52} color="#FFD3E7" mood="shy" className="shrink-0" />
        <div className="min-w-0">
          <h2 className="font-display text-[24px] leading-tight font-extrabold tracking-[-0.035em] sm:text-[30px]">
            My Shelf <span className="text-[0.8em]">🔖</span>
          </h2>
          <p className="text-[13px] font-medium text-muted">cards you kept. they live only in this browser 🔒</p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-[28px] border-2 border-dashed border-ink/25 bg-white/50 px-6 py-14 text-center backdrop-blur-sm">
          <div className="relative">
            <Blobby size={100} color="#FFD3E7" mood="sleepy" className="animate-floaty" />
            <Sparkle size={22} className="absolute -top-1 -right-4" />
          </div>
          <p className="font-display mt-4 text-[22px] font-extrabold tracking-[-0.03em]">nothing kept yet</p>
          <p className="mt-1 max-w-xs text-[13px] text-muted">tap any note on a sheet and hit “keep on my shelf”.</p>
        </div>
      ) : (
        <Masonry
          items={items.map((it) => ({ ...it.post, id: it.key, _item: it }))}
          resetKey="shelf"
          renderItem={(entry, index) => (
            <motion.button
              key={entry.id}
              type="button"
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: Math.min(index, 12) * 0.035 }}
              whileHover={{ y: -4 }}
              onClick={() => onOpen(entry._item)}
              className="block w-full text-left"
            >
              <Bubble post={entry._item.post} meta={`${entry._item.boardName} · kept ${formatDate(entry._item.savedAt)}`} />
            </motion.button>
          )}
        />
      )}
    </div>
  );
}
