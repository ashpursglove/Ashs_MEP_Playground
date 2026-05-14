import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Themed replacement for `window.prompt`. Used for placing and editing
 * annotations on drawing pages, where the browser-native dialog looks like
 * something from 1998 and clashes with the rest of the dark UI.
 *
 * The dialog handles the usual ergonomics:
 *  - autofocus + select-all on open so typing replaces existing text
 *  - Enter commits (single-line); Ctrl/Cmd+Enter commits (multi-line)
 *  - Esc cancels
 *  - click on the backdrop also cancels
 */
export interface TextPromptOptions {
  title: string;
  /** Optional helper line under the title, e.g. "use Enter for new lines". */
  hint?: string;
  /** Pre-filled value, used when editing an existing annotation. */
  initialValue?: string;
  /** Textarea instead of an input. */
  multiline?: boolean;
  /** Label for the confirm button. Defaults to "OK". */
  confirmLabel?: string;
}

interface Props extends TextPromptOptions {
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function TextPromptModal({
  title,
  hint,
  initialValue = "",
  multiline = false,
  confirmLabel = "OK",
  onSubmit,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = multiline ? textareaRef.current : inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [multiline]);

  function commit() {
    onSubmit(value);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key === "Enter") {
      // Multi-line needs Ctrl/Cmd+Enter so plain Enter can insert newlines.
      if (multiline) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          commit();
        }
        return;
      }
      e.preventDefault();
      commit();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="text-prompt-title"
        className="w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-zinc-700 bg-[var(--color-panel)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2
            id="text-prompt-title"
            className="text-sm font-semibold tracking-tight text-zinc-100"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-500 transition hover:text-zinc-200"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </header>

        <div className="px-4 py-3">
          {multiline ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKey}
              rows={5}
              className={cn(
                "w-full resize-y rounded border border-zinc-700 bg-[var(--color-panel-2)] px-2.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition",
                "focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40",
              )}
            />
          ) : (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKey}
              type="text"
              className={cn(
                "w-full rounded border border-zinc-700 bg-[var(--color-panel-2)] px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition",
                "focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40",
              )}
            />
          )}
          <p className="mt-2 text-[10px] text-zinc-500">
            {hint ?? (
              multiline
                ? "Ctrl+Enter to confirm · Esc to cancel"
                : "Enter to confirm · Esc to cancel"
            )}
          </p>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-zinc-800 bg-[var(--color-panel-2)] px-4 py-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-zinc-700 bg-transparent px-3 py-1 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            className="rounded border border-sky-500 bg-sky-500/20 px-3 py-1 text-xs font-medium text-sky-100 transition hover:bg-sky-500/30"
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
