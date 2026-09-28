import { motion } from 'motion/react';

export const SHELF = '__shelf';

export function BoardTabs({ boards, active, shelfCount, onSelect }) {
  const tabs = [
    ...boards.map((b) => ({ slug: b.slug, label: b.name, emoji: b.emoji, count: b.postCount })),
    { slug: SHELF, label: 'My Shelf', emoji: '🔖', count: shelfCount, local: true },
  ];

  return (
    <nav aria-label="Sheets" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <ul className="flex w-max gap-2 pt-1 pb-2">
        {tabs.map((tab) => {
          const isActive = tab.slug === active;
          return (
            <li key={tab.slug} className={tab.local ? 'ml-1 border-l-2 border-dashed border-ink/20 pl-3' : undefined}>
              <button
                type="button"
                onClick={() => onSelect(tab.slug)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex h-9 items-center gap-1.5 rounded-full border-2 px-3.5 text-[13px] font-bold transition ${
                  isActive
                    ? 'border-ink text-white shadow-(--shadow-pop)'
                    : 'border-ink/15 bg-white/70 text-ink/75 backdrop-blur hover:-translate-y-0.5 hover:border-ink hover:text-ink'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{tab.emoji}</span>
                <span className="relative whitespace-nowrap">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`relative ml-0.5 rounded-full px-1.5 text-[10.5px] tabular-nums ${
                      isActive ? 'bg-lime text-ink' : 'bg-ink/[0.07]'
                    }`}
                  >
                    {tab.count > 999 ? '999+' : tab.count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
