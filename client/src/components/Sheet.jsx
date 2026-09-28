import { useEffect } from 'react';
import { motion, useDragControls } from 'motion/react';

/**
 * Bottom sheet on phones, centered pop-up card on larger screens.
 * Locks page scroll and closes on Escape / backdrop tap / swipe down.
 */
export function Sheet({ onClose, label, children, maxWidth = 460 }) {
  const drag = useDragControls();
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/45 backdrop-blur-[3px] sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[30px] border-2 border-b-0 border-ink bg-white px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-(--shadow-soft) sm:rounded-[30px] sm:border-b-2 sm:pt-5 sm:pb-5 sm:shadow-[8px_8px_0_0_#16131F]"
        style={{ maxWidth }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        dragListener={false}
        dragControls={drag}
        onDragEnd={(_, info) => (info.offset.y > 110 || info.velocity.y > 600) && onClose()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* grab handle (phones) */}
        <div
          className="-mx-5 -mt-3 mb-1 flex cursor-grab touch-none justify-center pt-3 pb-2 sm:hidden"
          onPointerDown={(e) => drag.start(e)}
        >
          <div className="h-1.5 w-11 rounded-full bg-ink/25" />
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
