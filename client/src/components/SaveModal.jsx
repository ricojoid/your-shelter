import { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { Bubble } from './Bubble';
import { Sheet } from './Sheet';
import { Sparkle } from './Doodles';
import { formatDate } from '../lib/time';

const canPickLocation = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

/**
 * Shows a confession as a keepsake card and offers three ways to keep it:
 * download a PNG, choose a folder (File System Access API), or pin it to the
 * local "My Shelf" view.
 */
export function SaveModal({ item, isKept, onKeep, onForget, onClose }) {
  const cardRef = useRef(null);
  const [status, setStatus] = useState('');
  const { post, boardName } = item;
  const fileName = `your-shelter-${post.id ?? 'draft'}.png`;

  const render = () => toBlob(cardRef.current, { pixelRatio: 3, cacheBust: true });

  async function download() {
    setStatus('rendering…');
    try {
      const blob = await render();
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: fileName }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('downloaded ✓');
    } catch {
      setStatus('could not render the image');
    }
  }

  async function saveAs() {
    try {
      // Open the picker first — it must run inside the click's user activation.
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'PNG image', accept: { 'image/png': ['.png'] } }],
      });
      setStatus('rendering…');
      const blob = await render();
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      setStatus(`saved as ${handle.name} ✓`);
    } catch (err) {
      setStatus(err?.name === 'AbortError' ? '' : 'could not save the file');
    }
  }

  function toggleKeep() {
    if (isKept) {
      onForget(item);
      setStatus('removed from your shelf');
    } else {
      onKeep(item);
      setStatus('kept on this device ✓');
    }
  }

  return (
    <Sheet onClose={onClose} label="Save confession" maxWidth={420}>
      {/* This exact node is what gets exported */}
      <div ref={cardRef} className="motif relative overflow-hidden rounded-[22px] border-2 border-ink px-6 pt-5 pb-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="font-display text-[15px] font-extrabold tracking-[-0.03em]">your shelter ✦</span>
          <span className="rounded-full border-2 border-ink bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em]">
            {boardName}
          </span>
        </div>
        <Bubble post={post} meta={null} />
        <Sparkle size={20} className="absolute right-4 bottom-10" />
        <p className="mt-6 text-[11px] font-semibold text-ink/55">
          {formatDate(post.createdAt)} · written by someone, somewhere
        </p>
      </div>

      <div className="mt-4 grid gap-2">
        <Action onClick={download} icon="↓" tint="bg-lime" title="download image" hint="PNG to your downloads folder" />
        {canPickLocation && (
          <Action onClick={saveAs} icon="📁" tint="bg-sky" title="save to…" hint="pick the folder & file name yourself" />
        )}
        <Action
          onClick={toggleKeep}
          icon={isKept ? '✓' : '🔖'}
          tint="bg-blush"
          title={isKept ? 'on your shelf' : 'keep on my shelf'}
          hint={isKept ? 'tap to remove it from this device' : 'stored only in this browser, never uploaded'}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p role="status" className="truncate text-[12px] font-semibold text-muted">
          {status}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="h-10 shrink-0 rounded-full border-2 border-ink px-5 text-[13px] font-bold hover:bg-ink hover:text-white"
        >
          close
        </button>
      </div>
    </Sheet>
  );
}

function Action({ onClick, icon, tint, title, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-[18px] border-2 border-ink bg-white px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-(--shadow-pop) active:translate-y-0 active:shadow-none"
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink text-[15px] ${tint}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-bold">{title}</span>
        <span className="block truncate text-[11.5px] text-muted">{hint}</span>
      </span>
    </button>
  );
}
